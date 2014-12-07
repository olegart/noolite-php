<?php
$lamp=($_GET['lamp']);
$state=($_GET['on']);

$xmlfile = "lamps.xml";

$db = new SQLite3("lamps.db", SQLITE3_OPEN_READWRITE);
$db->busyTimeout(1000);
$db->exec("PRAGMA synchronous=OFF;");
$db->exec("PRAGMA journal_mode=MEMORY;");

$error = 0;

if (isset($lamp))
{
    openlog("noolite-php", LOG_NDELAY, LOG_LOCAL0);
    include 'switchlamp.php';
    
    if (isset($state))
    {
        if (switchlamp($lamp, $state) < 0)
		{
			$error = 1;
		}
    }

    if($lamp == "0") // turn off all lamps
    {
        $lamps = $db->query("SELECT id FROM lamps WHERE state=1;");
        while ($lamp = $lamps->fetchArray())
        {
            if (switchlamp($lamp[id], 0) < 0)
			{
				$error = 1;
				break;
			}
        }
    }
    closelog();
}
?>