// === server/index.js ===
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

let messageHistory = [];

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    // Send existing message history
    socket.emit("messageHistory", messageHistory);

    socket.on("sendMessage", (data) => {
        messageHistory.push(data);
        io.emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: " + socket.id);
    });
});

server.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});


// === client/src/App.jsx ===
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState("");

    useEffect(() => {
        socket.on("messageHistory", (history) => {
            setMessages(history);
        });

        socket.on("receiveMessage", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.off("messageHistory");
            socket.off("receiveMessage");
        };
    }, []);

    const sendMessage = () => {
        if (message.trim() && username.trim()) {
            const newMsg = { username, text: message };
            socket.emit("sendMessage", newMsg);
            setMessage("");
        }
    };

    return (
        <div className="flex flex-col h-screen w-full items-center p-4 bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-4 flex flex-col flex-1 overflow-hidden">
                <h1 className="text-2xl font-bold mb-2 text-center">Live Chat</h1>
                <div className="mb-2">
                    <input type="text" placeholder="Enter your name" value={username} onChange={(e) =>
                        setUsername(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                    />
                </div>
                <div className="flex-1 overflow-y-auto mb-2">
                    {messages.map((msg, index) => (
                        <div key={index} className="mb-1">
                            <strong>{msg.username}:</strong> {msg.text}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="Type a message" value={message} onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 p-2 border rounded"
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}


// === client/src/index.js ===
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />);


// === client/src/index.css ===
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
    @apply bg - gray - 200;
}
