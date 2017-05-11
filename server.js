var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var url = require('url');
var WebSocket = require('ws');

var server = http.createServer(app);
var wss = new WebSocket.Server({ server });
var client = [];
var wsClient = null;


app.use(bodyParser.json());
app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});

app.post('/sendMessage', function(req,res){
  var msg = req.body;
  console.log(msg);
  msg.type = "sendMessage";
  msg = JSON.stringify(msg);
  if(wsClient == null){
    res.send({type: "false", message: "message send failed"});
  }
  else{
    wsClient.send(msg);
    res.send({type: "true", message: "message send successful"});
  }
});

wss.on('connection', function connection(ws) {
  const location = url.parse(ws.upgradeReq.url, true);
  console.log("a user connected'");
  wsClient = ws;

  ws.on('message', function incoming(message) {
    if(IsJsonString(message)){
      var message = JSON.parse(message);
      switch(message.type) {
        case "connected":
          console.log("user connected");
          break;
        case "sendResponse":
          console.log("Message Send Successfully to: " + message.number);
          break;
      }
    }
    console.log('received: %s', message);
  });
  ws.onclose = () => {
    // connection closed
    console.log("connection closed")
    wsClient = null;
  };

});

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

server.listen(3000, function listening() {
  console.log('Listening on %d', server.address().port);
});
