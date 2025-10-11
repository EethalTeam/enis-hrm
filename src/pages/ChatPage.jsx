import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Send, Users, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils"; // Assuming you have a utility for classnames

// --- Mock Data (Replace with your API/WebSocket data) ---
const mockUsers = {
  'user-1': { name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice' },
  'user-2': { name: 'Bob (HR)', avatar: 'https://i.pravatar.cc/150?u=bob' },
  'user-3': { name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie' },
};

const initialMessages = {
  'hr_group': [
    { id: 1, senderId: 'user-2', text: 'Hi team, please remember to submit your quarterly reviews by Friday.', timestamp: '4:30 PM' },
    { id: 2, senderId: 'user-1', text: 'Got it, thanks for the reminder!', timestamp: '4:31 PM' },
  ],
  'employees_group': [
    { id: 1, senderId: 'user-3', text: "Hey everyone, who's up for lunch today?", timestamp: '12:05 PM' },
    { id: 2, senderId: 'user-1', text: "I'm in! Thinking of trying that new cafe.", timestamp: '12:06 PM' },
    { id: 3, senderId: 'user-3', text: 'Sounds great!', timestamp: '12:07 PM' },
    { id: 4, senderId: 'user-1', text: 'Perfect. See you all at 1 PM.', timestamp: '12:08 PM' },
    { id: 5, senderId: 'user-2', text: 'Count me in too!', timestamp: '12:15 PM' },
    { id: 6, senderId: 'user-3', text: 'Awesome!', timestamp: '12:16 PM' },
  ],
};

// ===================================================================================
// CHAT PAGE COMPONENT
// ===================================================================================
const ChatPage = () => {
  const { user } = useAuth(); // Assuming user object has _id and name
  const [activeGroup, setActiveGroup] = useState('employees_group');
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const endOfMessagesRef = useRef(null);
  
  const currentUser = user || { _id: 'user-1', name: 'You' }; // Fallback for demonstration

  const groups = [
    { id: 'employees_group', name: 'Employees Group', icon: Users, access: ['Super Admin', 'Admin', 'Employee'] },
    { id: 'hr_group', name: 'HR Group', icon: Shield, access: ['Super Admin', 'Admin'] },
  ];

  const visibleGroups = groups.filter(g => g.access.includes(user.role || 'Employee'));

  // Auto-scroll to the latest message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeGroup]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message = {
      id: Date.now(),
      senderId: currentUser._id,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages(prevMessages => ({
      ...prevMessages,
      [activeGroup]: [...prevMessages[activeGroup], message],
    }));
    setNewMessage('');
  };

  const currentChatMessages = messages[activeGroup] || [];

  return (
    <>
      <Helmet><title>Chat - ENIS-HRMS</title></Helmet>
      <div className="space-y-8 h-[calc(100vh-100px)] flex flex-col">
        {/* --- Header --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="text-3xl font-bold text-white">Group Chat</h1>
            <p className="text-gray-400">Communicate with your team in real-time.</p>
          </div>
        </motion.div>

        {/* --- Main Chat Layout --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            // THIS IS THE CORRECTED LINE: `min-h-0` is added to constrain the flex container's height
            className="flex-grow flex gap-6 min-h-0"
        >
          {/* Group List Sidebar */}
          <Card className="glass-effect border-white/10 w-1/4">
            <CardHeader>
              <CardTitle className="text-white">Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {visibleGroups.map(group => (
                <Button
                  key={group.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3",
                    activeGroup === group.id && "bg-white/10"
                  )}
                  onClick={() => setActiveGroup(group.id)}
                >
                  <group.icon className="w-5 h-5 text-gray-400" />
                  {group.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="glass-effect border-white/10 w-3/4 flex flex-col">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-3">
                 <MessageSquare/> {visibleGroups.find(g => g.id === activeGroup)?.name}
              </CardTitle>
            </CardHeader>
            
            {/* Messages Area */}
            <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
                {currentChatMessages.map((msg) => {
                    const sender = mockUsers[msg.senderId] || { name: 'Unknown' };
                    const isCurrentUser = msg.senderId === currentUser._id;
                    return (
                        <div key={msg.id} className={cn("flex items-end gap-3", isCurrentUser && "justify-end")}>
                           {!isCurrentUser && (
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={sender.avatar} />
                                    <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                           )}
                           <div className={cn(
                                "max-w-xs md:max-w-md p-3 rounded-lg",
                                isCurrentUser ? "bg-blue-600 rounded-br-none" : "bg-slate-700 rounded-bl-none"
                            )}>
                                {!isCurrentUser && <p className="text-xs font-bold text-purple-300 mb-1">{sender.name}</p>}
                                <p className="text-sm text-white">{msg.text}</p>
                                <p className="text-xs text-gray-400 text-right mt-1">{msg.timestamp}</p>
                           </div>
                           {isCurrentUser && (
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={mockUsers[currentUser._id]?.avatar} />
                                    <AvatarFallback>Y</AvatarFallback>
                                </Avatar>
                           )}
                        </div>
                    )
                })}
              <div ref={endOfMessagesRef} />
            </CardContent>

            {/* Message Input Form */}
            <div className="p-4 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow glass-effect"
                        autoComplete="off"
                    />
                    <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600" size="icon">
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ChatPage;