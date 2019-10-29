const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");
const firmata = require("firmata");

const wss = new WebSocket.Server({ port: 8888 });

let board = new firmata.Board("/dev/ttyACM0", () => {
  board.pinMode(2, board.MODES.OUTPUT);
  board.pinMode(3, board.MODES.PWM);
});

fs.readFile("./index.html", (err, html) => {
  if (!err) {
    http
      .createServer((req, res) => {
        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end();
      })
      .listen(8080, "192.168.1.223", () => {
        console.log("Server running ...");
      });
  } else {
    console.log("Error loading file !");
  }
});

wss.on("connection", ws => {
  ws.on("message", PMWValue => {
    switch (PMWValue) {
      case "left":
        console.log("turn left");
        board.digitalWrite(2, board.HIGH);
        break;
      case "right":
        console.log("turn right");
        board.digitalWrite(2, board.LOW);
        break;
      case "stop":
        console.log("stop");
        board.analogWrite(3, 0);
        break;
      default:
        console.log(PMWValue);
        board.analogWrite(3, PMWValue);
    }
  });
});
