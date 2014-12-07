<?php

$reply = array();

if (count($_FILES) > 0)
{
	copy("../apartments.png", "../apartments.png.bak");
	if (move_uploaded_file($_FILES['apartments']['tmp_name'], '../apartments.png'))
	{
		$reply = array("success" => "File uploaded successfully");
	}
	else
	{
		$reply = array("error" => "File upload error");
	}
}
else
{
	$reply = array("error" => "No files received");
}

echo json_encode($reply);
?>