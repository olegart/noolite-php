<?php 
function switchlamp($channel, $on, $level)
{
	global $db;
	
	if (func_num_args() < 3)
	{
		if ($on)
		{
			$level = 100;
		}
		else
		{
			$level = 0;
		}
	}

    $sockf = @fsockopen("unix:///tmp/noolitepcd.sock", 0, $errno, $errstr);
    if ($sockf)
    {
		$filename = pathinfo($_SERVER["PHP_SELF"]);
		if ($filename["basename"] == "index.php")
		{
			$log = "Web: ";
		}
		else
		{
			$log = "";
		}
		$log = $log . "Lamp " . $channel . " state " . $db->querySingle("SELECT state FROM lamps WHERE id=" . $channel . ";", false);
		switch ($on)
		{
			case 1:
				$cmd = "on " . $channel;
				break;
			case 0:
				$cmd = "off " . $channel;
				break;
		}
		fwrite($sockf, $cmd);
		fclose($sockf);

		$db->exec("BEGIN;");
		$db->exec("UPDATE lamps SET state=" . $on . ", dimlevel=" . $level . " WHERE id=" . $channel . ";");
		$db->exec("COMMIT;");
		
		$log = $log . "->" . $on;
		syslog(LOG_INFO, $log);
		return 0;
	}
	else
	{
		syslog(LOG_ERR, "Socket error: $errstr ($errno)");
		return -1;
	}
}
?>