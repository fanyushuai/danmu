var localStorage = null;
if(window.localStorage){
	localStorage = window.localStorage;
	if(!localStorage['uid']){
		localStorage.setItem("uid",guid());
	}	
}

//WebSocket
var wsServer = 'ws://localhost:8001';
var websocket= new WebSocket(wsServer);

String.prototype.format = function(args) {
	var result = this;
	if (arguments.length < 1) {
		return result;
	}
	var data = arguments;        
	if (arguments.length == 1 && typeof (args) == "object") {
		data = args;
	}
	for (var key in data) {
		var value = data[key];
		if (undefined != value) {
			result = result.replace("{" + key + "}", value);
		}
	}
	return result;
}

//唯一id
function guid() {  
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);  
		return v.toString(16);  
	});  
}  	

$(function() {
	$(".pick-a-color").pickAColor();

	//每条弹幕发送间隔
	var looper_time=3*1000;
	//是否首次执行
	var run_once=true;
	
	// do_barrager();
	function do_barrager(){
		if(run_once ){
			//如果是首次执行,则设置一个定时器,并且把首次执行置为false
			looper = setInterval(do_barrager,looper_time);                
			run_once = false;
		}
	}
	
	websocket.onopen = function (evt) {
		if(window.localStorage){
			websocket.send("{\"from\":\""+localStorage["uid"]+"\",\"to\":\"\",\"type\":\"join\",\"msg\":\"加入\"}");
			console.log(localStorage["uid"]+ " Connected to WebSocket server.");
		}
	};
	
	websocket.onclose = function (evt) {
		console.log("Disconnected");
	};
			
	websocket.onmessage = function (evt) {
		
		var data = JSON.parse(evt.data);
		
		//系统消息
		if("join" == data.type || "leave" == data.type){
			//用户列表
			if(data.userList){
				$("#userList").html("");
				var userList = data.userList.split(",");
				$.each(userList,function(index,item){
					if(localStorage["uid"] == item){
						$("#userList").append("<li id=\""+item+"\">自己</lli>");
					}else{
						$("#userList").append("<li id=\""+item+"\">"+item+"</lli>");
					}	
				});
				
				var uid = null;
				//点击用户 发私信
				$("#userList li").on("click",function(){
					if(uid == $("#uid").val()){
						$("#uid").val("");
					}else{
						uid = $(this).attr("id");
						$("#uid").val(uid);
					}
				});
			}
		}else{
			
			var item = data.msg;
			
			//自己发的
			if(data.from == localStorage["uid"]){
				item.info = "<span style='border:1px solid white;'>"+item.info+"</span>";
			}
			
			$('body').barrager(item);
			
			if("抖动" == item.info){
				$("body").addClass("shake shake-crazy");
			}
			if("反转" == item.info || "翻转" == item.info){
				var reversal = document.getElementById("reversal");
				reversal.innerHTML = "<style type='text/css'> html { filter: fliph; /* for ie */} body { transform: rotateY(180deg); /* css3 */ -moz-transform:skew(0deg, 180deg) scale(-1, 1); /* for ff */ -webkit-transform: rotateY(180deg); /* for chrome and safari */ -o-transform:skew(0deg, 180deg) scale(-1, 1); /* for opera */ overflow-x:hidden; }</style>";
			}
			if("恢复" == item.info){
				$("body").removeClass("shake shake-crazy");
				document.getElementById("reversal").innerHTML = "";
			}
		}		
	};
	
	websocket.onerror = function (evt, e) {
		console.log('Error occured: ' + evt.data);
	};
});

//发送弹幕
function send(){
	var info = $('input[name=info]').val();
	(info == '' ) ?  info='请填写弹幕文字' : info=info;
	var href = $('input[name=href]').val();
	var speed = parseInt($('input[name=speed]').val());
	var bottom = parseInt($('input[name=bottom]').val());
	var from = localStorage["uid"];
	var to = $("#uid").val();
	var type = "danmu";
	
	var img=$('input:radio[name=img]:checked').val();
	
	

	var item = {
		'img':'static/img/'+img,
		'info':info,
		'href':href,
		'close':true,
		'speed':speed,
		'bottom':bottom,
		'color':'#'+$('input[name=color').val(),
		'old_ie_color':'#'+$('input[name=color').val()
	};
	
	if($('input:radio[name=bottomradio]:checked').val() == 0){
		var window_height = $(window).height()-150;
		bottom = Math.floor(Math.random()*window_height+40);
		item.bottom = null;
	}
	
	if(img == 'none'){
		item.img = null;
	}

	if(!$('input[name=close]').is(':checked')){
		item.close = false;
	}
	
	var msg = {
		"from":from,
		"to":to,
		"type":type,
		"msg":item
	}

	websocket.send(JSON.stringify(msg));
}

function clear(){
	$.fn.barrager.removeAll();
}