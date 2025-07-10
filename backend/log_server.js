const express = require("express");
const cors = require("cors");
const http = require("http");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

app.use(cors());
app.use(express.json());

//C++からのログ受信
app.post('/post', (req, res) => {
    const logData = req.body.log;
    console.log('[HTTP] ログ受信:', logData);
    io.emit("receive_message", logData);
    
    res.json({status:'ok', received: logData});
});

io.on('connection', (socket)=>{
     console.log('[WS] クライアント接続:', socket.id);

    socket.on('disconnect', () => {
        console.log('[WS] クライアント切断:', socket.id);
    });
})


server.listen(3000, () => {
  console.log('🚀 サーバー起動：http://localhost:3000');
});