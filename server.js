//引入nodejs-websocket
const ws = require('nodejs-websocket');

//在线列表
const userList = new Set();

function broadcast(message){
	//接受客户端传来的消息
	server.connections.forEach((conn) => {
		//sendText 服务端发送给客户端方法
		let msg = JSON.parse(message);
		//只有from 没有to 群发
		if(!msg.to){
			conn.sendText(message);	
		}else{
			if(msg.to == conn.id){
				conn.sendText(message);  
			}
		}	
	});
	
}

const server = ws.createServer((conn) => {
	//接收消息
	conn.on('text', (str) => {
		let msg = JSON.parse(str);
		if(!msg.to){
			if("join" == msg.type){
				userList.add(msg.from);
				conn.id = msg.from;
				broadcast("{\"userList\":\""+Array.from(userList).toString()+"\",\"type\":\"join\"}");	
			}if("leave" == msg.type){
				userList.delete(msg.from);
				broadcast("{\"userList\":\""+Array.from(userList).toString()+"\",\"type\":\"leave\"}");	
			}else{
				broadcast(str);	
			}	
		}else{
			broadcast(str);	
		}
	});
	
	//退出
	conn.on("close", (str) => {
        
    });
	conn.on('error', (err) => {
		//判断错误，假如不判断的话 会断开连接
		console.log("err:"+err);
	});
}).listen(8001);

