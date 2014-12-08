var swModeSelect = {
	"toggle": "Переключение",
	"group": "Группа",
	"combined": "Последовательно",
	"sequence": "По цепочке",
//	"dim_steps": "Диммер 0-50-100",
//	"dim_onoff": "Диммер вкл-выкл",
	"off": "Выключить",
	"on": "Включить",
	"alloff": "Выключить все"
}

var swCommandSelect = {
	"0": "0 — Выключить нагрузку",
	"1": "1 – Запускает плавное понижение яркости",
	"2": "2 – Включить нагрузку",
	"3": "3 – Запускает плавное повышение яркости",
	"4": "4 – Переключить нагрузку",
	"5": "5 – Начало длинного нажатия (обычная кнопка)",
	"6": "6 – Установить заданную яркость",
	"7": "7 – Вызвать записанный сценарий",
	"8": "8 – Записать сценарий",
	"9": "9 – Стирание адреса управляющего устройства",
	"10": "10 – Конец длинного нажатия (обычная кнопка)",
	"15": "15 – Устройство хочет записать свой адрес в память",
	"16": "16 – Включение плавного перебора цвета",
	"17": "17 – Переключение цвета",
	"18": "18 – Переключение режима работы",
	"19": "19 – Переключение скорости эффекта для режима работы",
	"20": "20 – Разряд батареи в устройстве",
	"21": "21 – Передача информации о текущей температуре и влажности"
}

var lamps = [];

$.ajax({
    type: "GET",
    url: "../lamps.xml",
    dataType: "xml",
    async: false,
    success: function (xml) {
		$(xml).find("channels").each(function() {
			$(this).find("channel").each(function() {
				lamps[$(this).attr("id")] = $(this).attr("title");
			});
		});
	}
});

$.ajax({
    type: "GET",
    url: "../switch.xml",
    dataType: "xml",
    async: false,
    success: function (xml) {
		$(xml).find("channels").each(function() {
			$(".swtable").append("<table><tr class='headrow'><th class='headcol'>Канал</th><th class='headcol'>Включено</th><th class='headcol'>Режим</th><th class='headcol'>Команда</th><th class='headcol'>Лампы</th><th class='headcol'>Изменить</th><th class='headcol'>Удалить</th></tr>");
			$(this).find("channel").each(function() {
			
				$(".swtable").find('table').last().append("<tr class='headrow'><td class='switchcell'>" + $(this).attr("id") + "</td><td class='switchcell'>" + onOffButton($(this).attr("enabled")) + "</td><td class='switchcell'>" + swValueToMode($(this).attr("mode")) + "</td><td class='switchcell'>" + $(this).attr("command") + "</td><td class='switchcell'><img class='showlamps' src='img/expand.png' height='22' width='22' /></td><td class='switchcell'><img class='editswitchsign' src='img/edit.png'></td><td class='switchcell'><img class='delswitchsign' src='img/delete.png' /></td></tr>");
				
				$(this).find("lamp").each(function() {
					$(".swtable").find('table').last().append("<tr class='lamprow'><td class='lampcellarrow'><img src='img/lampmark.png'/></td><td class='lampcell' colspan='5'>Лампа " + $(this).attr("channel") + " (" + lamps[$(this).attr("channel")] + ")</td><td class='swdellampsign'><img src='img/delete.png' /></tr>")
				});
				$(".swtable").find('table').last().append("<tr class='lamprow addlamp'><td class='addlamp' colspan='6'>Добавить лампу</td><td class='addlampsign'><img src='img/plus.png' /></td></tr>");
			});
			$(".swtable").find('table').last().after("</table>");
		});
		swTableEdited();
    }
});

$(document).mouseup(function (e) {
	var container = $(".selectbox");
	if (!container.is(e.target) && container.has(e.target).length === 0) { // if the target of the click isn't the container nor it's descendant
		container.remove();
		$(".selected").removeClass("selected");
	}
});

function onOffButton(text) {
	img = (text == "yes")? "../on.png" : "../off.png";
	return "<img src='" + img + "' />";
}

function swValueToMode(text) {
	return swModeSelect[text];
}

function swModeToValue(text) {
	var ret;
	$.each(swModeSelect, function(key, value) { 
		if (text == value) {
			ret = key;
			return false;
		}
	});	
	return ret;
}

function swTableEdited() {
	$(".addlampsign").off("click");
	$(".addlampsign").click(function () {
		var select_str = "<div class='selectbox' tabindex='-1'><select id='selected_lamp'>";
		var index;
		for (index = 0; index < lamps.length; ++index) {
			if (lamps[index] != undefined) {
				select_str += "<option value='" + index + "'>" + index + " - " + lamps[index] + "</option>";
			}
		}
		select_str += "</select><p><input id='add_ok' type='button' value='OK'><input id='add_cancel' type='button' value='Отмена'></p></div>";
		$(this).after(select_str);
		
		$('.selectbox').find(':button').click(function() {
			if ($(this).attr("id") == "add_ok") {
				$(this).closest(".lamprow").before("<tr class='lamprow expanded'><td class='lampcellarrow'><img src='img/lampmark.png' /></td><td class='lampcell' colspan='5'>Лампа " + $('#selected_lamp').val() + " (" + lamps[$('#selected_lamp').val()] +  ")</td><td class='swdellampsign'><img src='img/delete.png' /></tr>");
				$(".expanded").show(150);

				swTableEdited();
			}
			$('.selectbox').remove();
		});
    });

	$(".showlamps").off("click");
	$(".showlamps").click(function () {
		if ($(this).closest("tr").next().hasClass("expanded")) {
			$(".expanded").hide(150);
			$(".expanded").removeClass("expanded");
			return;
		}
		$(".expanded").hide(150);
		$(".expanded").removeClass("expanded");
		$(this).closest("tr").nextUntil(".headrow").addClass("expanded");
		$(this).closest("tr").nextUntil(".headrow").show(400);
		});

	$(".swdellampsign").off("click");
	$(".swdellampsign").click(function () {
		var tr = $(this).closest("tr");
		if (confirm("Вы уверены, что хотите удалить эту лампу?")) {
			tr.fadeOut(400, function(){
				tr.remove();
			});
		}
	});
	
	$(".delswitchsign").off("click");
	$(".delswitchsign").click(function () {
		var tr = $(this).closest("tr");
		if (confirm("Вы уверены, что хотите удалить этот выключатель?")) {
			tr.nextUntil(".headrow").remove();
			tr.fadeOut(400, function(){
				tr.remove();
			});
			
		}
	});
	
	$(".editswitchsign").off("click");
	$(".editswitchsign").click(function () {
		var select_str = "<div class='selectbox' tabindex='-1'><div style='display: table'><div style='display: table-row'><div style='display: table-cell'>Канал: </div><div style='display: table-cell'><input type='number' id='channelNumber' value='1' /> Режим: ";
		select_str += "<select id='modeOption'>";
		$.each(swModeSelect, function(key, value) { 
			select_str += "<option value='" + key + "'>" + value + "</option>";
		});	
		select_str += "</select>";
		select_str += "<label id='chEnabledLabel'><input type='checkbox' id='channelEnabled' checked='checked' />Включен</label>" + "</div></div>" + "<div style='display: table-row'><div style='display: table-cell'>Команда: </div><div style='display: table-cell'>";
		select_str += "<select id='commandOption'>";
		$.each(swCommandSelect, function(key, value) { 
			select_str += "<option value='" + key + "'>" + value + "</option>";
		});	
		select_str += "</select>";
		select_str += "</div></div></div>" + "<p><input id='add_ok' type='button' value='OK'><input id='add_cancel' type='button' value='Отмена'></p></div>";
		
		$(this).after(select_str);
		
		var tabs = $(this).closest("tr").find("td");
		
		$("#channelNumber").val(tabs.eq(0).text());
		$("#modeOption").val(swModeToValue(tabs.eq(2).text()));
		$("#commandOption").val(tabs.eq(3).text());
		if (tabs.eq(1).html().indexOf("on.png") > 0) {
			$("#channelEnabled").prop("checked", true);
		}
		else {
			$("#channelEnabled").prop("checked", false);
		}
		
		tabs.addClass("selected");
		
		$('.selectbox').find(':button').click(function() {
			if ($(this).attr("id") == "add_ok") {
				tabs.eq(0).text($("#channelNumber").val());
				tabs.eq(2).text($("#modeOption option:selected").text());
				tabs.eq(3).text($("#commandOption").val());
				
				if ($("#channelEnabled").prop("checked")) {
					tabs.eq(1).html("<img src='../on.png' />");
				}
				else {
					tabs.eq(1).html("<img src='../off.png' />");
				}
			}
			$(".selectbox").remove();
			tabs.removeClass("selected");
		});
	});
}

$(':button#add_switch').click(function() {
	var select_str = "<div class='selectbox' tabindex='-1'><div style='display: table'><div style='display: table-row'><div style='display: table-cell'>Канал: </div><div style='display: table-cell'><input type='number' id='channelNumber' value='1' /> Режим: ";
	select_str += "<select id='modeOption'>";
	$.each(swModeSelect, function(key, value) { 
		select_str += "<option value='" + key + "'>" + value + "</option>";
	});	
	select_str += "</select>";
	select_str += "<label><input type='checkbox' id='channelEnabled' checked='checked' />Включен</label>" + "</div></div>" + "<div style='display: table-row'><div style='display: table-cell'>Команда: </div><div style='display: table-cell'>";
	select_str += "<select id='commandOption'>";
	$.each(swCommandSelect, function(key, value) { 
		select_str += "<option value='" + key + "'>" + value + "</option>";
	});	
	select_str += "</select>";
	select_str += "</div></div></div>" + "<p><input id='add_ok' type='button' value='OK'><input id='add_cancel' type='button' value='Отмена'></p></div>";
	
	$(this).after(select_str);
	$('.selectbox').find(':button').click(function() {
		if ($(this).attr("id") == "add_ok") {
			isEnabled = ($("#channelEnabled").prop("checked"))? "yes" : "no";

			$(".swtable").find("table").last().append("<tr class='headrow'><td class='switchcell'>" + $("#channelNumber").val() + "</td><td class='switchcell'>" + onOffButton(isEnabled) + "</td><td class='switchcell'>" + $("#modeOption option:selected").text() + "</td><td class='switchcell'>" + $("#commandOption").val() + "</td><td class='switchcell'><img class='showlamps' src='img/expand.png' height='22' width='22' /></td><td class='switchcell'><img class='editswitchsign' src='img/edit.png'></td><td class='switchcell'><img class='delswitchsign' src='img/delete.png' /></td></tr>");
			
			$(".swtable").find('table').last().append("<tr class='lamprow addlamp'><td class='lampright' colspan='5'>Добавить лампу</td><td class='lampchange'><img src='img/plus.png' class='addlampsign' /></td><td class='lampchange'></td><td class='lampchange'></td></tr>");

			swTableEdited();
		}
		$(".selectbox").remove();
	});
});

$(':button#save_switches').click(function() {

	var xml = '<?xml version="1.0" encoding="utf-8"?>\n';
	xml += '<channels>\n';
	$(".swtable tr").each(function () {
		var cells = $("td", this);
		var cellstype = $(this).attr("class");
		
		if (cells.length > 0) {
			if (cellstype.indexOf("headrow") >= 0) {
				xml += '\t<channel id="' + cells.eq(0).text() + '" ';
				xml +=(cells.eq(1).html().indexOf("on.png") >= 0)? 'enabled="yes" ' : 'enabled="no" ';
				xml += 'mode="' + swModeToValue(cells.eq(2).text()) + '" ';
				xml += 'command="' + cells.eq(3).text() + '">\n';
			}
			else if (cellstype.indexOf("addlamp") >= 0) {
				xml += '\t</channel>\n';
			}
			else if (cellstype.indexOf("lamprow") >= 0) {
				xml += '\t\t<lamp channel="' + cells.eq(1).text().match(/\d+/) + '" />\n';
			}
		} 
	});

	xml += '</channels>';
	
	GLR.messenger.inform({msg:"Saving file...", mode:"loading"});
	$.post("savexml.php", {xmlString:xml, xmlFilename:"../switch.xml"});
});

