<?php
$channel=($_GET['channel']);
$command=($_GET['command']);
$mode=($_GET['mode']);

if ($mode == "rx")
{
	$sockf = @fsockopen("unix:///tmp/nooliterxd.sock", 0, $errno, $errstr, 1);
}
else if ($mode == "tx")
{
	$sockf = @fsockopen("unix:///tmp/noolitepcd.sock", 0, $errno, $errstr, 1);
}
else
	{
	echo "Unknown mode. What would you like to set, TX or RX?";
	exit;
	}

if ($sockf)
    {
	$cmd = $command . " " . $channel;
	fwrite($sockf, $cmd);
	fclose($sockf);
	}
else
	{
	echo "Socket error " . $errno . ": " . $errstr;
	}
?>