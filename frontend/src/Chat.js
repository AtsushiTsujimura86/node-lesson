import Reat from 'react';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function Chat() {
    const [message, setMessage] = useState('');
    const [log, setLog] = useState([]);
    
    const handleSendMessage = ()=>{
        if(message.trim() === "")return;
        socket.emit("send_message",message);
        setMessage('');
    }

    useEffect(() =>{
        socket.on("receive_message", (data)=>{
            setLog((preLog) => [...preLog, data])
        })
        // Clean up the socket connection when the component unmounts
        return () => {
            socket.off("receive_message");
        }
    }, [])

    return(
        <div>
            <h2>Socket Chat</h2>
            <input type="text" value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Type your message here..." />
            <button onClick={handleSendMessage}>Send</button>

            <ul>
                {log.map((msg, i) => (
                    <li key={i}>{msg}</li>
                ))}
            </ul>
        </div>
    )
}

export default Chat;