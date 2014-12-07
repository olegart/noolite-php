<?php
$channel=($_GET['channel']);
$command=($_GET['command']);

$xmlfile = "switch.xml";

openlog("noolite-php", LOG_NDELAY, LOG_LOCAL0);

include 'switchlamp.php';

if (($channel < 1) || ($channel > 64))
{
    if ($LOGGING)
    {
        syslog("LOG_WARNING", "Channel " . $channel . " out of range");
    }
    exit;
}

$db = new SQLite3("lamps.db", SQLITE3_OPEN_READWRITE);
$db->busyTimeout(1000);
$db->exec("PRAGMA synchronous=OFF;");
$db->exec("PRAGMA journal_mode=MEMORY;");

$switches = simplexml_load_file($xmlfile);
if (!$switches)
{
    syslog(LOG_ERR, "Couldn't open XML file " . $xmlfile);
    exit();
}

$items = $switches->xpath("channel[@id=" . $channel . "]");

if (count($items) > 0)
{
    if (count($items) == 1)
    {
        $item = $items[0];
    }
    else
    {
        $success = 0;
        foreach($items as $i => $subitem)
        {
            if ($subitem["command"] == $command)
            {
                $item = $items[$i];
                $success = 1;
                break;
            }
            if (($subitem["command"] == NULL) && !isset($defkey))
            {
                $defkey = $i;
            }
        }
        if (!$success)
        {
            if (isset($defkey))
            {
                $item = $items[$defkey];
            }
            else
            {
                $item = $items[0];
            }
        }
    }

    if ($item["enabled"] == "yes")
    {
        switch ((string)$item["mode"])
        {
            case "toggle":
                foreach ($item->lamp as $lamp)
                {
                    $state = $db->querySingle("SELECT state FROM lamps WHERE id=" . $lamp["channel"] . ";", false);
                    syslog(LOG_INFO, "Channel: " . $lamp["channel"] . " State: " . $state);
                    if ($state > 0)
                    {
                        $state = 0;
                    }
                    else
                    {
                        $state = 1;
                    }
                    switchlamp($lamp["channel"], $state);
                }
                break;
            case "on":
                foreach ($item->lamp as $lamp)
                {
                    switchlamp($lamp["channel"], 1);
                }
                break;
            case "off":
                foreach ($item->lamp as $lamp)
                {
                    switchlamp($lamp["channel"], 0);
                }
                break;
            case "alloff":
                $lamps = $db->query("SELECT id FROM lamps WHERE state=1;");
                while ($lamp = $lamps->fetchArray())
                {
                    switchlamp($lamp["channel"], 0);
                }
                break;
            case "combined":
                $i = 0;
                foreach ($item->lamp as $lamp)
                {
                    $lamps[$i++] = $db->querySingle("SELECT state FROM lamps WHERE id=" . $lamp["channel"] . ";", false);
                }

                $key = array_search("0", $lamps); // find the first lamp which is off

                if ($key === FALSE) // all lamps are turned on
                {
                    foreach ($item->lamp as $lamp) // turn'em off
                    {
                        switchlamp($lamp["channel"], 0);
                    }
                }
                else
                {
                    $lamp = $item->lamp[$key];        
                    switchlamp($lamp["channel"], 1); // turn on the next lamp               
                    /*
					if ($item["override"] == "yes") // check if any other lamps are enabled and turn'em off
                    {
                        $index = array_search($key, array_keys($lamps));
                        $lamps_subarr = array_slice($lamps, $index+1, 255, true);
                        foreach ($lamps_subarr as $id => $state)
                        {
                            if ($state > 0)
                            {
                                $lamp = $item->lamp[$id];
                                switchlamp($lamp["channel"], 0);
                            }
                        }
                    }
					*/
                }
                break;
            case "sequence":
                $i = 0;
                foreach ($item->lamp as $lamp)
                {
                    $lamps[$i++] = $db->querySingle("SELECT state FROM lamps WHERE id=" . $lamp["channel"] . ";", false);
                }

                $key = array_search("1", $lamps); // find the first lamp which is on
                if ($key === FALSE) // all lamps are turned off
                {
                    $lamp = $item->lamp[0]; // turn on the first lamp
                    switchlamp($lamp["channel"], 1);
                }
                else
                {
                    $lamp = $item->lamp[++$key];
                    switchlamp($lamp["channel"], 1); // turn on next lamp
					/*
                    if ($item["override"] == "yes") // check if any other lamps are enabled and turn'em off
                    {
                        $index = array_search($key, array_keys($lamps));
                        $lamps_subarr = array_slice($lamps, $index+1, 255, true);

                        foreach ($lamps_subarr as $id => $state)
                        {
                            if ($state > 0)
                            {
                                $lamp = $item->lamp[$id];
                                switchlamp($lamp["channel"], 0);
                            }
                        }
                    }
					*/
                    $lamp = $item->lamp[++$key];
                    switchlamp($lamp["channel"], 0); // turn off lamp that was on before
                }
                break;
            case "group":
                $i = 0;
                foreach ($item->lamp as $lamp)
                {
                    $lamps[$i++] = $db->querySingle("SELECT state FROM lamps WHERE id=" . $lamp["channel"] . ";", false);
                }
                $keys = array_keys($lamps, "1"); // find all lamps turned on, if any
                
                if (empty($keys)) // turn on all lamps
                {
                    foreach ($item->lamp as $lamp)
                    {
                        switchlamp($lamp["channel"], 1);
                    }
                }
                else // turn off all lamps
                {
                    foreach ($keys as $key => $id)
                    {
                        $lamp = $item->lamp[$id];
                        switchlamp($lamp["channel"], 0);
                    }
                }
                break;
			case "dim_steps":
				$i = 0;
				foreach ($item->lamp as $lamp)
				{
					$lamps[$i++] = $db->querySingle("SELECT state FROM lamps WHERE id=" . $lamp["channel"] . ";", false);
				}
				$keys = array_keys($lamps, "1");
				
				if (empty($keys)) // switch all lamps to 50 % brightness
				{
					foreach ($item->lamp as $lamp)
					{
						switchlamp($lamp["channel"], 1, 50);
					}
				}
				else
				{
					$level = $db->querySingle("SELECT dimlevel FROM lamps WHERE id =" . reset($keys) . ";", false);
					if ($level <= 50) // lamps at 50 % brightness, switch them to 100 %
					{
						foreach ($keys as $key => $id)
						{
							$lamp = $item->lamp[$id];
							switchlamp($lamp["channel"], 1);
						}
					}
					else  // lamps at 100 % brightness, switch them off
					{
						foreach ($keys as $key => $id)
						{
							$lamp = $item->lamp[$id];
							switchlamp($lamp["channel"], 0);
						}					
					}
				}
				break;
			case "dim_onoff":
				break;
        }
    }
    else
    {
        syslog(LOG_WARNING, "Switch " . $channel. " is disabled in the XML file " . $xmlfile);
    }
}
else
{
    syslog(LOG_WARNING, "Switch " . $channel . " was not found in the XML file " . $xmlfile);
}

if ($LOGGING)
{
    closelog();
}

$db->close();
?>
