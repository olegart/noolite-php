<!DOCTYPE html>
<html style="height:100%">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Homelight: Настройка ламп и выключателей</title>
<link href="css/tabs.css" type="text/css" rel="stylesheet"/>
<link href="css/main.css" type="text/css" rel="stylesheet"/>
<script type="text/javascript" src="js/ext/jquery-2.1.1.min.js"></script>
<script type="text/javascript" src="js/ext/GLR/GLR.js"></script>
<script type="text/javascript" src="js/ext/GLR/GLR.messenger.js"></script>

<?php
$user = $_POST['user'];
$pass = $_POST['pass'];

if($user != "admin" || $pass != "admin")
{
    if(isset($_POST))
    {?>
		<script>
			$(document).ready(function() {
				$("button#saveFile").show().click(function() {
					$("#loginForm").submit();
				});
			});
		</script>
		</head>
		<body>
		<div id="loginPage">
			<div id="header">Представьтесь, пожалуйста</div>
			<div id="loginData">
				<form method="POST" action="index.php" id="loginForm">
					User <input type="text" name="user"></input><br/>
					Pass <input type="password" name="pass"></input><br/>
					<input type="submit" style="display:none"></input>
				</form>
			</div>
			<div id="footer"><button id="saveFile">Войти</button></div>
			<?php
			if (isset($user) || isset($pass))
			{?>
				<script>
					GLR.messenger.show({msg:"Неправильное имя или пароль",mode:"error"});
				</script>
			<?php } ?>
		</body>
		</html>
    <?php
		exit;
	}
}
?>

</head>
<body style="height:100%">
<section class="tabs">
	<input id="tab_1" type="radio" name="tab" checked="checked" class="tabInput" />
	<input id="tab_2" type="radio" name="tab" class="tabInput" />
	<input id="tab_3" type="radio" name="tab" class="tabInput" />
	<label for="tab_1" id="tab_l1" class="tabLabel">Лампы</label>
	<label for="tab_2" id="tab_l2" class="tabLabel">Выключатели</label>
	<label for="tab_3" id="tab_l3" class="tabLabel">Привязка</label>
	<div style="clear:both"></div>
	<div class="tabs_line"></div>

	<div class="tabs_cont">
		<div id="tab_c1">
			<div id="add_switch_div"><input id="add_lamp" type="button" value="Добавить лампу"><input id="save_lamps" type="button" value="Сохранить настройки"><input id="upload" type="button" value="Сменить план квартиры"><input id="apartmentsupload" type="file" style="display: none;" accept="image/png" /></div>
			<div class="lmptable nodisplay"></div>
			<img id="apartmentsimg" src="../apartments.png" />
		</div>
		<div id="tab_c2">
			<div id="add_switch_div"><input id="add_switch" type="button" value="Добавить выключатель"><input id="save_switches" type="button" value="Сохранить настройки"></div>
			<div style='display: table'><div style='display: table-row'><div style='display: table-cell'>
				<div class="swtable"></div>
			</div><div style='display: table-cell'>
				<div class="swhelp"><?php include('swhelp.php'); ?></div>
			</div></div></div>
		</div>
		<div id="tab_c3">
			<div style="display:table; padding: 20px;">
				<div style="display:table-row;">
					<div style="display:table-cell; width:50%;">
						<h1>Привязка выключателей</h1>
						<p class="nooSettings">Для привязки канала приёмника нажмите на пульте nooLite кнопку начала привязки, выберите ниже номер канала, нажмите кнопку «Привязать канал» и в течение 30 секунд нажмите на пульте кнопку, которую хотите привязать к этому каналу. Для снятия привязки пульта к каналу приёмника выберите ниже нужный канал и нажмите кнопку «Очистить привязку».</p>
					</div>
					<div style="display:table-cell; width:50%;">
						<h1>Привязка силовых блоков</h1>
						<p class="nooSettings">Для привязки силового блока нажмите на нём кнопку привязки, выберите ниже номер канала, нажмите кнопку «Привязать канал». После того, как силовой блок примет команду, нажмите на нём кнопку второй раз для подтверждения привязки.</p>
					</div>
				</div>
				<div style="display:table-row;">
					<div style="display:table-cell;">					
						<div class="binding" style="display: inline;">
							Канал приёмника: <select id="rx_ch">
								<?php for ($i=1; $i<=64; $i++) { ?>
								<option value="<?php echo $i;?>"><?php echo $i;?></option>
								<?php } ?> </select>
							<input id="bind_rx" type="button" value="Привязать канал">
							<input id="clear_rx" type="button" value="Очистить привязку">
						</div>
					</div>
					<div style="display:table-cell;">	
						<p><div class="binding" style="display: inline;">
						Канал передатчика: <select id="tx_ch">
							<?php for ($i=1; $i<=64; $i++) { ?>
							<option value="<?php echo $i;?>"><?php echo $i;?></option>
							<?php } ?> </select>
						<input id="bind_tx" type="button" value="Привязать канал">
						<input id="clear_tx" type="button" value="Очистить привязку">
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<script src="js/loc/switches.js" charset="UTF-8"></script>
<script src="js/loc/lamps.js" charset="UTF-8"></script>

<script>
$('.binding > :button').click(function() {
	var cmd;
	if ($(this).attr("id") == "bind_rx") {
		cmd = 'noocfg.php?mode=rx&command=bind&channel=' + $('#rx_ch option:selected').val();
	}
	else if ($(this).attr("id") == "clear_rx") {
		cmd = 'noocfg.php?mode=rx&command=clear&channel=' + $('#rx_ch option:selected').val();
	}
	else if ($(this).attr("id") == "bind_tx") {
		cmd = 'noocfg.php?mode=tx&command=bind&channel=' + $('#tx_ch option:selected').val();
	}
	else if ($(this).attr("id") == "clear_tx") {
		cmd = 'noocfg.php?mode=tx&command=unbind&channel=' + $('#tx_ch option:selected').val();
	}
	
	if (confirm("Вы уверены?"))  {
		$.ajax({
			url: cmd,
			success: function(){
			
			}
		});
	}
    return false;
});
</script>
</body>
</html>
