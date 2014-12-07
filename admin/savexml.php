<?php
/**
 * Saves POST input as an XML file
 */
function xmlsort($a, $b)
{
    if (intval($a["id"]) == intval($b["id"]))
	{
		if($a["enabled"] == "no")
		{
			return 1;
		}
		elseif ($b["enabled"] == "no")
		{
			return -1;
		}
		elseif (strnatcmp((string)$a["mode"], (string)$b["mode"]) > 0)
		{
			return 1;
		}
		else
		{
			return 0;
		}
    }
    return (intval($a["id"]) < intval($b["id"])) ? -1 : 1;
}
 
$xmlString;

if (isset($_POST['xmlString'])){
	$filename  = $_POST['xmlFilename'];
	$xmlString = stripslashes($_POST['xmlString']);
	
	// sort values by id
	$xml = simplexml_load_string($xmlString);
	$index = 0;
	foreach ($xml->channel as $ch)
	{
		$dbs[$index++] = $ch;
	}
	usort($dbs, "xmlsort");
	
	$xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<channels>";
	foreach($dbs as $item)
	{
		$xmlString = $xmlString . "\n    ";
		$xmlString = $xmlString . $item->asXML() . "\n";
	}
	$xmlString = $xmlString . "</channels>";

	copy($filename, $filename . ".bak");
	
	//write new data to the file, along with the old data 
	$handle = fopen($filename, "wb"); 
	if (fwrite($handle, $xmlString) === false)
	{ 
		echo "{error:\"Couldn't write to file.\"}";  
	} 
	fclose($handle); 	
}
?>