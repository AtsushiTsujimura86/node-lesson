const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin: "*",
        methods: ["GET", "POST"],
    }
})

app.use(cors());
app.use(express.json());


app.post('/post', (req, res) => {
  console.log('POST受信:', req.body);
  res.json({ message: '受け取りました', received: req.body });
});


io.on("connection",(socket)=>{
    console.log("client connected:", socket.id);

    socket.on("send_message", (data) => {
        console.log("受信メッセージ:", data);
        io.emit("receive_message", data);
    });

    socket.on("disconnect",()=>{
        console.log("client disconnected:", socket.id);
    })
})

server.listen(3000, () => {
    console.log('🚀 サーバー起動中：http://localhost:3000');
})