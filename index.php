<html>
<head>
	<title>Lighting</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<link href="admin/css/main.css" type="text/css" rel="stylesheet"/>
	<link rel="shortcut icon" href="favicon.png" type="image/png">
	<script type="text/javascript" src="admin/js/ext/jquery-2.1.1.min.js"></script>
</head>
<body>
<?php
if (!file_exists("lamps.db"))
{
	?>
	<div id="loginPage">
		<div id="header">Первый запуск</div>
		<div id="loginData">
			Отсутствует база данных текущего состояния ламп. Вероятно, это первый запуск системы — либо же файл был поврежден. Нажмите кнопку «Создать», чтобы создать новую базу данных.
		</div>
		<div id="footer"><button id="createDb">Создать</button></div>
	</div>
	</body>
	<script>
	$("#createDb").click(function() {
		$.ajax({
			url: "admin/createdb.php",
			success: function() {
				location.reload();
			}
		});
	});
	</script>
	</html>
	<?php
	exit;
}

$db = new SQLite3("lamps.db", SQLITE3_OPEN_READONLY);

$db->busyTimeout(1000);
//$db->exec("PRAGMA synchronous=OFF;");
//$db->exec("PRAGMA journal_mode=MEMORY;");

libxml_use_internal_errors(true);
$lamps = simplexml_load_file("lamps.xml");

require_once 'Mobile_Detect.php';
$detect = new Mobile_Detect;

if ($detect->isMobile())
{
    ?><table><?php
	foreach ($lamps->channel as $lamp)
    {
		$state = $db->querySingle("SELECT state FROM lamps WHERE id=" . $lamp["id"] . ";", false); 
        		
		if ($state == 0)
        {
			$state = 1;
			$image = "switch-off.png";
        }
        else
        {	
			$state = 0;
			$image = "switch-on.png";
			
        }
		list($width, $height, $type, $attr) = getimagesize($image);
        printf("<tr><td>%s: </td><td><img src='%s' id='%s' class='lamp' %s /></td></tr>", $lamp["title"], $image, $lamp["id"], $attr);
    }
	list($width, $height, $type, $attr) = getimagesize("switch-on.png");
    printf("<tr><td>Выключить всё: </td><td><img src='switch-on.png' class='lamp' id='0' %s /></td></tr></table>", $attr);
}
else
{	
	list($width, $height, $type, $attr) = getimagesize("apartments.png");
?>
	<div style="width:<?php echo $width+60;?>px; margin: 20px auto;" >
		<div id="header">
			<font size="+1">Освещение в доме</font>
			<img src='switch-on.png' title="Выключить всё" style="float: right;" class='lamp' id='0' />
		</div>
		<div id="xml">
			<div style="position: relative; margin: 10px;">
				<img src='apartments.png' style='vertical-align: bottom' <?php echo $attr;?> />
				<?php
				foreach ($lamps->channel as $lamp)
				{
					if (($lamp->image["x"] >= 0) && ($lamp->image["y"] >= 0))
					{
						$shift=$lamp->image["x"];
						
						$imageURL = ($lamp["type"] == "other")? "wallsocket" : "lightbulb";
						$imageURL .= ($db->querySingle("SELECT state FROM lamps WHERE id=" . $lamp["id"] . ";", false) == 0)? "-off.png" : "-on.png";

						list($width, $height, $type, $attr) = getimagesize($imageURL);
						printf("<img src='%s' title='%s' id='%s' class='lamp' style='z-index:100; position: absolute; left: %dpx; top: %dpx;' %s />", $imageURL, $lamp["title"], $lamp["id"], $lamp->image["x"], $lamp->image["y"], $attr);
					}
				}
				?>
			</div>
		</div>
		<div id="footer">
			<button id="saveFile" onclick="window.open('admin/index.php','_self',false)">Настройка ламп и выключателей</button>
		</div>
	</div>
<?php } ?>

<script>
$(".lamp").click(function() {
	var state = 1;
	if ($(this).attr("src").indexOf("on.png") >= 0) {
		state = 0;
	}
	
	var image = $(this);
	lampID = image.attr("id");
	cmd = "onofflamp.php?lamp=" + lampID + "&on=" + state;

	$.ajax({
			url: cmd,
			success: function(){
				imageUrl = (state == 0)? image.attr("src").replace("on.png", "off.png") : image.attr("src").replace("off.png", "on.png");				
				image.attr("src", imageUrl);	
				
				if (lampID == 0) {
					setTimeout(function(){
						image.attr("src", imageUrl.replace("off.png", "on.png"));
					}, 200);
					location.reload();
				}
			}
		});
});
</script>
</body>
</html>