$.ajax({
    type: "GET",
    url: "../lamps.xml",
    dataType: "xml",
    cache: false,
    success: function (xml) {
		$(xml).find("channels").each(function() {
			$(".lmptable").append("<table><tr class='headrow'><th class='headcol'>Канал</th><th class='headcol'>Название</th><th class='headcol'>Тип</th><th class='headcol'>Изменить</th><th class='headcol'>Удалить</th><th style='display:none'>X</th><th style='display:none'>Y</th></tr>");
			
			$(this).find("channel").each(function() {
				var trContent = "<tr class='headrow'><td class='switchcell'>" + $(this).attr("id") + "</td><td class='switchcell'>" + $(this).attr("title") + "</td><td class='switchcell'>";
				switch ($(this).attr("type")) {
					case "other": trContent += "Другое"; imgsrc = "wallsocket-on.png"; break;
					default: trContent += "Лампа"; imgsrc = "lightbulb-on.png"; break;
				}
				trContent += "</td><td class='switchcell'><img class='editlampsign' src='img/edit.png'></td><td class='switchcell'><img class='dellampsign' src='img/delete.png' /></td><td class='switchcell'><div style='height: 22px; width: 14px;'><img class='drag smalllamp' src='../" + imgsrc + "' title='" + $(this).attr("title") + "' /></div></td>";
							
				$(this).find("image").each(function() {
					trContent += "<td style='display:none'>" + $(this).attr("x") + "</td><td style='display:none'>" + $(this).attr("y") + "</td>";
				});
				
				trContent += "</tr>";
				$(".lmptable").find('table').last().append(trContent);
			});
			$(".lmptable").find('table').last().after("</table>");
		});
		lmptableEdited();
		$(".nodisplay").show(200, function() {
			$(".drag").each(function() {
				lampX = $(this).closest("td").next();
				lampY = lampX.next();

				if ((parseInt(lampX.text()) >= 0) && (parseInt(lampY.text()) >= 0)) {
					lampOffset = $(this).offset();
					imgOffset = $("#apartmentsimg").offset();
					var deltaX = imgOffset.left - lampOffset.left;
					deltaY = imgOffset.top - lampOffset.top;
				
					$(this).removeClass("smalllamp");
					$(this).css("left", parseInt(lampX.text()) + deltaX);
					$(this).css("top", parseInt(lampY.text()) + deltaY);
				}
			});
		});
    }
});

$(document).mouseup(function (e) {
	var container = $(".selectbox");
	if (!container.is(e.target) && container.has(e.target).length === 0) { // if the target of the click isn't the container nor it's descendant
		container.remove();
		$(".selected").removeClass("selected");
	}
});

function lmptableEdited() {
	$(".dellampsign").off("click");
	$(".dellampsign").click(function () {
		var tr = $(this).closest("tr");
		if (confirm("Вы уверены, что хотите удалить эту лампу?")) {
			tr.fadeOut(400, function(){
				tr.remove();
			});
		}
	});
	
	$(".editlampsign").off("click");
	$(".editlampsign").click(function () {
		var select_str = "<div class='selectbox' tabindex='-1'><div style='display: table'><div style='display: table-row'><div style='display: table-cell'>Канал: </div><div style='display: table-cell'><input type='number' id='channelNumber' value='1' /> Тип: <select id='lampType'><option value='lamp'>Лампа</option><option value='other'>Другое</option></select><br /></div></div><div style='display: table-row'><div style='display: table-cell'>Название: </div><div style='display: table-cell'><input type='text' id='lampName' size=28></div></div></div>" + "<p><input id='add_ok' type='button' value='OK'><input id='add_cancel' type='button' value='Отмена'></p></div>";
		
		$(this).after(select_str);
		
		var tabs = $(this).closest("tr").find("td");
		
		$("#channelNumber").val(tabs.eq(0).text());
		$("#lampName").val(tabs.eq(1).text());
		switch (tabs.eq(2).text()) {
			case "Другое": $("#lampType").val("other"); break;
			default: $("#lampType").val("lamp"); break;
		}
		
		tabs.addClass("selected");
		
		$('.selectbox').find(':button').click(function() {
			if ($(this).attr("id") == "add_ok") {
				updateLampValues();
			}
			$(".selectbox").remove();
			tabs.removeClass("selected");
		});
		
		$('.selectbox').keypress(function(e) {
			if (e.which == 13) {
				updateLampValues();
				$(".selectbox").remove();
				tabs.removeClass("selected");
			}
		});
		
		function updateLampValues() {
			tabs.eq(0).text($("#channelNumber").val());
			tabs.eq(2).text($("#lampType option:selected").text());
			tabs.eq(1).text($("#lampName").val());
			tabs.eq(5).find("img").attr("title", $("#lampName").val());
			
			imgsrc = ($("#lampType option:selected").text() == "Другое" )? "../wallsocket-on.png" : "../lightbulb-on.png";
			tabs.eq(5).find("img").attr("src", imgsrc);
		}
	});
}

$(':button#add_lamp').click(function() {
	var select_str = "<div class='selectbox' tabindex='-1'><div style='display: table'><div style='display: table-row'><div style='display: table-cell'>Канал: </div><div style='display: table-cell'><input type='number' id='channelNumber' value='1' /> Тип: <select id='lampType'><option value='lamp'>Лампа</option><option value='other'>Другое</option></select><br /></div></div><div style='display: table-row'><div style='display: table-cell'>Название: </div><div style='display: table-cell'><input type='text' id='lampName' size=28></div></div></div>" + "<p><input id='add_ok' type='button' value='OK'><input id='add_cancel' type='button' value='Отмена'></p></div>";
	
	$(this).after(select_str);
	$('.selectbox').find(':button').click(function() {
		if ($(this).attr("id") == "add_ok") {
			imgsrc = ($("#lampType option:selected").text() == "Другое" )? '../wallsocket-on.png' : '../lightbulb-on.png';
		
			$(".lmptable").find("table").last().append("<tr class='headrow'><td class='switchcell'>" + $("#channelNumber").val() + "</td><td class='switchcell'>" + $("#lampName").val() + "</td><td class='switchcell'>" + $("#lampType option:selected").text() + "</td><td class='switchcell'><img class='editlampsign' src='img/edit.png'></td><td class='switchcell'><img class='dellampsign' src='img/delete.png' /></td><td class='switchcell'><div style='height: 22px; width: 14px;'><img class='drag smalllamp' src='" + imgsrc + "' title='" + $("#lampName").val() + "'/></div><td style='display:none'>-1</td><td style='display:none'>-1</td></tr>");
			lmptableEdited();
		}
		$(".selectbox").remove();
	});
});

$(':button#save_lamps').click(function() {
	var xml = '<?xml version="1.0" encoding="utf-8"?>\n';
	xml += '<channels>\n';
	$(".lmptable tr").each(function () {
		var cells = $("td", this);
		var cellstype = $(this).attr("class");
		
		if (cells.length > 0) {
			xml += '\t<channel id="' + cells.eq(0).text() + '" ';
			xml += 'title="' + cells.eq(1).text() + '" ';
			switch (cells.eq(2).text()) {
				case "Другое": xml += 'type="other"'; break;
				default: xml += 'type="lamp"'; break;
			}
			xml += '>\n\t\t<image x="' + cells.eq(6).text() + '" y="' + cells.eq(7).text() + '"/>';
			xml += '\n\t</channel>\n';
		} 
	});

	xml += '</channels>';
	GLR.messenger.inform({msg:"Saving file...", mode:"loading"});
	$.post("savexml.php", {xmlString:xml, xmlFilename:"../lamps.xml"});
});

$(':button#upload').click(function() {
	$("input[id='apartmentsupload']").click();
});

$(':input#apartmentsupload').change(function(e){
	var formData = new FormData();
	formData.append('apartments', this.files[0]);
	$.ajax({
		url: 'upload.php',
		type: 'POST',
		data: formData,
		contentType: false,
		processData: false,
		success: function(reply){
			if (typeof reply.error != 'undefined') {
				alert("Error: " + reply.error);
			}
			else {
				$("#apartmentsimg").attr("src", "../apartments.png?" + new Date().getTime());
			}
		}
	});
	e.preventDefault();
});

/* drag-n-drop support: http://luke.breuer.com/tutorial/javascript-drag-and-drop-tutorial.aspx */

var _startX = 0;            // mouse starting positions
var _startY = 0;
var _offsetX = 0;           // current element offset
var _offsetY = 0;
var _dragElement;           // needs to be passed from OnMouseDown to OnMouseMove
var _oldZIndex = 0;         // we temporarily increase the z-index during drag

$(document).ready( function()
{
    document.onmousedown = OnMouseDown;
    document.onmouseup = OnMouseUp;
});

function OnMouseDown(e)
{
    // IE is retarded and doesn't pass the event object
    if (e == null) 
        e = window.event; 
    
    // IE uses srcElement, others use target
    var target = e.target != null ? e.target : e.srcElement;

    // for IE, left click == 1
    // for Firefox, left click == 0
    if ((e.button == 1 && window.event != null || 
        e.button == 0) && 
        (target.className.indexOf('drag') >= 0))
    {
        // grab the mouse position
        _startX = e.clientX;
        _startY = e.clientY;
        
        // grab the clicked element's position
        _offsetX = ExtractNumber(target.style.left);
        _offsetY = ExtractNumber(target.style.top);
        
        // bring the clicked element to the front while it is being dragged
        _oldZIndex = target.style.zIndex;
        target.style.zIndex = 10000;
        
        // we need to access the element in OnMouseMove
        _dragElement = target;
		
        // tell our code to start moving the element with the mouse
        document.onmousemove = OnMouseMove;
        
        // cancel out any text selections
        document.body.focus();

        // prevent text selection in IE
        document.onselectstart = function () { return false; };
        // prevent IE from trying to drag an image
        target.ondragstart = function() { return false; };
        
		// remove class 'smalllamp' to resize lamp image back to full size
		$(target).removeClass('smalllamp');
		
        // prevent text selection (except IE)
        return false;
    }
}

function OnMouseMove(e)
{
    if (e == null) 
        var e = window.event; 

    // this is the actual "drag code"
    _dragElement.style.left = (_offsetX + e.clientX - _startX) + 'px';
    _dragElement.style.top = (_offsetY + e.clientY - _startY) + 'px';
}

function OnMouseUp(e)
{
    if (_dragElement != null)
    {
        _dragElement.style.zIndex = _oldZIndex;

        // we're done with these events until the next OnMouseDown
        document.onmousemove = null;
        document.onselectstart = null;
        _dragElement.ondragstart = null;
		
		// calculate position relative to image
		var imgRect = document.getElementById("apartmentsimg").getBoundingClientRect(),
		elemRect = _dragElement.getBoundingClientRect(),
		lampY = elemRect.top - imgRect.top;
		lampX = elemRect.left - imgRect.left;	
		if ((lampY < 0) || (lampX < 0) || (lampY > imgRect.height) || (lampX > imgRect.width)) {
			_dragElement.style.left = 0;
			_dragElement.style.top = 0;
			$(_dragElement).addClass('smalllamp');
			lampX = -1;
			lampY = -1;
		}
		tdX = $(_dragElement).closest("td").next();
		tdX.text(lampX);
		tdX.next().text(lampY);
		
        // this is how we know we're not dragging      
        _dragElement = null;
    }
}

function ExtractNumber(value)
{
    var n = parseInt(value);
    return n == null || isNaN(n) ? 0 : n;
}
