import React, { useState } from "react";
import chatbotData from "../data/chatbot-faq.json";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    const reply = chatbotData.find(entry =>
      input.toLowerCase().includes(entry.keyword)
    );
    setMessages([...messages, { user: input, bot: reply ? reply.response : "Sorry, I don't understand." }]);
    setInput("");
  };

  return (
    <div className="chatbot">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i}>
            <b>You:</b> {msg.user}
            <br />
            <b>Bot:</b> {msg.bot}
          </div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
