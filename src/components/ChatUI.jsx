"use client";
import React, { useState } from "react";
import { MessageCircle, Send, Bot, User as UserIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from '@/components/CustomComponents/apiRequest'

const ChatUI = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! How Can I Help You" }
  ]);
  console.log(messages,"messages")
  const [input, setInput] = useState("");
console.log(input,"input")
  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    try {
         const response = await apiRequest("parseAICommand", {
        method: "POST",
        body: JSON.stringify({ message: input })
      });

      const data = response
      console.log(data,"data")

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || data.message || "✅ Operation completed (backend integration pending)." }
      ]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Error contacting server." }]);
    }

    setInput("");
  };

  return (
    <>
      {/* Floating Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        {!open ? (
          <Button
            size="icon"
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => setOpen(true)}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        ) : (
<Card className="w-96 h-[500px] flex flex-col rounded-2xl shadow-xl">
<CardHeader className="bg-primary text-white rounded-t-2xl flex flex-row items-center justify-between py-3 px-4">
 <div></div>
  <div className="flex items-center gap-2">
    <Bot className="w-5 h-5" /> 
    <CardTitle className="text-base">AI Assistant</CardTitle>
  </div>
   <Button
      size="icon"
      variant="ghost"
      className="text-white hover:bg-primary/70"
      onClick={() => setOpen(false)}
    >
      <X className="w-5 h-5" />
    </Button>
</CardHeader>

  <CardContent className="flex-1 flex flex-col p-2 overflow-hidden">
    {/* Messages container */}
   <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
  {messages.map((msg, idx) => (
    <div
      key={idx}
      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm max-w-[70%] ${
          msg.sender === "user" ? "bg-primary text-white" : "bg-muted text-foreground"
        }`}
      >
        {msg.sender === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        <span>{msg.text}</span>
      </div>
    </div>
  ))}
</div>

    {/* Input */}
    <div className="flex gap-2 mt-2">
      <Input
        placeholder="Type your command..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <Button onClick={handleSend}>
        <Send className="w-4 h-4" />
      </Button>
    </div>
  </CardContent>
</Card>

        )}
      </div>
    </>
  );
};

export default ChatUI;
