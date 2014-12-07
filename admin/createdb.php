<?php

$db = new SQLite3('../lamps.db');

$db->exec("CREATE TABLE lamps(id INTEGER, state INTEGER, dimlevel INTEGER, rlevel INTEGER, glevel INTEGER, blevel INTEGER);"); 

$db->exec("BEGIN;");
for ($i = 1; $i <= 64; $i++)
{
	$db->exec("INSERT INTO lamps (id, state, dimlevel, rlevel, glevel, blevel) VALUES ($i, 0, 0, 0, 0, 0);");
}
$db->exec("COMMIT;");
$db->close();
?>
