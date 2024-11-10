// Frontend - React (with Socket.io-client)
import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

const ChatRoom = () => {
  const [messages2, setMessages2] = useState([]);
  const [user, setUser] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const messagesEndRef = useRef(null);

  // Socket.io client setup
  const socket = useRef(null);

  const getMessages = async () => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/user/messages`;
      console.log(url);
      const response = await axios.get(url);
      console.log(response.data);
      setMessages2(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Connect to socket.io server
  useEffect(() => {
    socket.current = io(import.meta.env.VITE_BACKEND_URL); // Connect to backend
    socket.current.on("trigger re-render", getMessages); // Listen for re-render event

    return () => {
      socket.current.disconnect(); // Cleanup on component unmount
    };
  }, []);

  useEffect(() => {
    setUser(localStorage.getItem("username"));
    getMessages(); // Initial fetch
  }, [msgSent]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/add-msg`,
        {
          username: user,
          message: inputMessage,
        }
      );
      console.log(response.data.message);
      setMsgSent(true); // Trigger re-fetch on new message
      socket.current.emit("trigger re-render"); // Emit event to all clients to trigger re-render
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Chat Room</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages2.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.username === user ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md ${
                  message.username === user
                    ? "bg-black text-white"
                    : "bg-white text-black"
                } rounded-lg p-3 shadow-md animate-message-pop`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="font-bold">{message.username}</p>
                <p>{message.msg}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="bg-white p-4 shadow-lg">
          <div className="flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-r-lg hover:bg-gray-800 transition-colors duration-200 animate-pulse-subtle"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Component() {
  return <ChatRoom />;
}
