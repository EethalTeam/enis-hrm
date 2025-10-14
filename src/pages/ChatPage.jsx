import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
// Added ShieldCheck icon
import { Send, Users, MessageSquare, Plus, UserPlus, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";
import { apiRequest } from '@/components/CustomComponents/apiRequest';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8001';

// =======================================================
// HELPER COMPONENT: Create Group Dialog (Existing)
// =======================================================
const CreateGroupDialog = ({ open, setOpen, allEmployees, onCreateGroup }) => {
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const handleToggleMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!groupName || selectedMembers.length === 0) {
            toast({ variant: "destructive", title: "Validation Error", description: "Group name and at least one member are required." });
            return;
        }
        onCreateGroup({ groupName, description, memberIds: selectedMembers });
        setOpen(false);
        setGroupName('');
        setDescription('');
        setSelectedMembers([]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-effect border-white/10 text-white">
                <DialogHeader><DialogTitle>Create New Group</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><Label>Group Name</Label><Input value={groupName} onChange={e => setGroupName(e.target.value)} required className="glass-effect" /></div>
                    <div><Label>Description (Optional)</Label><Input value={description} onChange={e => setDescription(e.target.value)} className="glass-effect" /></div>
                    <div>
                        <Label>Select Members</Label>
                        <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border border-white/10 p-2 mt-2 scrollbar-thin scrollbar-thumb-slate-700">
                            {allEmployees.map(emp => (
                                <div key={emp._id} className="flex items-center justify-between rounded-md p-2 hover:bg-white/10 cursor-pointer" onClick={() => handleToggleMember(emp._id)}>
                                    <Label htmlFor={`member-${emp._id}`}>{emp.name}</Label>
                                    <input type="checkbox" id={`member-${emp._id}`} checked={selectedMembers.includes(emp._id)} readOnly className="form-checkbox h-5 w-5 text-blue-500 bg-transparent border-gray-300 rounded focus:ring-blue-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter><Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Create Group</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// =======================================================
// HELPER COMPONENT: Add Members Dialog (Existing)
// =======================================================
const AddMembersDialog = ({ open, setOpen, allEmployees, currentGroup, onAddMembers }) => {
    const [selectedMembers, setSelectedMembers] = useState([]);
    
    const availableEmployees = allEmployees.filter(emp => !currentGroup?.members.some(member => member._id === emp._id));

    const handleToggleMember = (memberId) => {
        setSelectedMembers(prev => prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedMembers.length === 0) {
            toast({ variant: "destructive", title: "No members selected." });
            return;
        }
        onAddMembers({ groupId: currentGroup._id, memberIds: selectedMembers });
        setOpen(false);
        setSelectedMembers([]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-effect border-white/10 text-white">
                <DialogHeader><DialogTitle>Add Members to "{currentGroup?.groupName}"</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Select Employees to Add</Label>
                        <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border border-white/10 p-2 mt-2 scrollbar-thin scrollbar-thumb-slate-700">
                            {availableEmployees.length > 0 ? availableEmployees.map(emp => (
                                <div key={emp._id} className="flex items-center justify-between rounded-md p-2 hover:bg-white/10 cursor-pointer" onClick={() => handleToggleMember(emp._id)}>
                                    <Label htmlFor={`add-member-${emp._id}`}>{emp.name}</Label>
                                    <input type="checkbox" id={`add-member-${emp._id}`} checked={selectedMembers.includes(emp._id)} readOnly className="form-checkbox h-5 w-5 text-blue-500 bg-transparent border-gray-300 rounded focus:ring-blue-500" />
                                </div>
                            )) : <p className="text-gray-400 text-center p-4">All employees are already in this group.</p>}
                        </div>
                    </div>
                    <DialogFooter><Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Add Members</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// =======================================================
// HELPER COMPONENT: Manage Members Dialog (MODIFIED)
// =======================================================
const ManageMembersDialog = ({ open, setOpen, group, currentUser, onRemoveMember, onMakeAdmin }) => {
    const [confirmRemove, setConfirmRemove] = useState(null);

    const isCurrentUserAdmin = group?.admins.some(admin => admin._id === currentUser._id);

    const handleRemoveClick = (member) => {
        setConfirmRemove(member);
    };

    const confirmAndRemove = () => {
        if (confirmRemove) {
            onRemoveMember(group._id, confirmRemove._id);
        }
        setConfirmRemove(null);
        setOpen(false);
    };
    
    // New handler for the Make Admin action
    const handleMakeAdminClick = (memberId) => {
        onMakeAdmin(group._id, memberId);
    };

    useEffect(() => {
        if (!open) {
            setConfirmRemove(null);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-effect border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Members of "{group?.groupName}"</DialogTitle>
                    <DialogDescription>{group?.members?.length} members</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-4 scrollbar-thin scrollbar-thumb-slate-700">
                    {group?.members.map(member => {
                        const isAdmin = group.admins.some(admin => admin._id === member._id);
                        const isConfirming = confirmRemove?._id === member._id;
                        
                        return (
                            <div key={member._id} className={cn("flex items-center justify-between p-2 rounded-md", isConfirming ? "bg-red-900/50" : "hover:bg-white/5")}>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8"><AvatarImage src={member.avatar} /><AvatarFallback>{member.name.charAt(0)}</AvatarFallback></Avatar>
                                    <div>
                                        <p className="font-medium text-white">{member.name}</p>
                                        {isAdmin && <span className="text-xs text-purple-400">Admin</span>}
                                    </div>
                                </div>
                                
                                {isConfirming ? (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="destructive" onClick={confirmAndRemove}>Confirm</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setConfirmRemove(null)}>Cancel</Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        {/* ===== NEW BUTTON: Make Admin ===== */}
                                        {isCurrentUserAdmin && !isAdmin && (
                                            <Button title="Make Admin" size="icon" variant="ghost" className="h-8 w-8 text-green-400 hover:bg-green-500/20" onClick={() => handleMakeAdminClick(member._id)}>
                                                <ShieldCheck className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {isCurrentUserAdmin && member._id !== currentUser._id && group.createdBy !== member._id && (
                                            <Button title="Remove Member" size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/20" onClick={() => handleRemoveClick(member)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
};


// ===================================================================================
// MAIN CHAT PAGE COMPONENT
// ===================================================================================
const ChatPage = () => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [groups, setGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [allEmployees, setAllEmployees] = useState([]);
    
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);

    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);
        
        newSocket.on('connect', () => {
            console.log("Socket connected:", newSocket.id);
            newSocket.emit('joinRoom', { employeeId: user._id });
        });

        fetchUserGroups();
        fetchAllEmployees();

        newSocket.on('receive_group_message', (incomingMessage) => {
            setActiveGroup(currentActiveGroup => {
                if (currentActiveGroup && currentActiveGroup._id === incomingMessage.groupId) {
                    setMessages(prevMessages => [...prevMessages, incomingMessage]);
                }
                return currentActiveGroup;
            });
        });

        return () => newSocket.disconnect();
    }, [user._id]);

    useEffect(() => {
        if (!socket || !activeGroup) return;
        fetchMessages(activeGroup._id);
        socket.emit('join_group_chat', activeGroup._id);
        return () => {
            if (socket && activeGroup) {
                socket.emit('leave_group_chat', activeGroup._id);
            }
        };
    }, [activeGroup, socket]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchUserGroups = async () => {
        try {
            const response = await apiRequest("Group/getGroupByUsers", { method: 'POST', body: JSON.stringify({}) });
            if (response.success) {
                setGroups(response.groups || []);
                setActiveGroup(prevActiveGroup => {
                    const updatedActiveGroup = response.groups.find(g => g._id === prevActiveGroup?._id);
                    return updatedActiveGroup || response.groups[0] || null;
                });
            }
        } catch (error) { console.error("Failed to fetch groups:", error); }
    };

    const fetchAllEmployees = async () => {
        try {
            const response = await apiRequest("Employee/getAllEmployees/", { method: 'POST', body: JSON.stringify({}) });
            setAllEmployees(response.filter(emp => emp._id !== user._id) || []);
        } catch (error) { console.error("Failed to fetch employees:", error); }
    };

    const fetchMessages = async (groupId) => {
        try {
            const response = await apiRequest("Group/getMessages", { method: 'POST', body: JSON.stringify({ groupId }) });
            if (response.success) {
                setMessages(response.messages || []);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            setMessages([]);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !socket || !activeGroup) return;
        const optimisticMessage = {
            _id: `optimistic-${Date.now()}`,
            content: newMessage,
            groupId: activeGroup._id,
            senderId: { _id: user._id, name: user.name, avatar: user.avatar },
            createdAt: new Date().toISOString()
        };
        setMessages(prevMessages => [...prevMessages, optimisticMessage]);
        socket.emit('send_group_message', {
            groupId: activeGroup._id,
            senderId: user._id,
            content: newMessage,
        });
        setNewMessage('');
    };

    const handleCreateGroup = async (groupData) => {
        try {
            await apiRequest('Group/createGroup', { method: 'POST', body: JSON.stringify(groupData) });
            toast({ title: "Group Created!", description: `"${groupData.groupName}" has been created.` });
            fetchUserGroups();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create group." });
        }
    };

    const handleAddMembers = async (membersData) => {
        try {
            await apiRequest(`Group/AddMembers`, { method: 'POST', body: JSON.stringify(membersData) });
            toast({ title: "Members Added!", description: "New members have been added." });
            fetchUserGroups();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add members." });
        }
    };
    
    const handleRemoveMember = async (groupId, memberIdToRemove) => {
        try {
            await apiRequest('Group/RemoveMember', {
                method: 'POST',
                body: JSON.stringify({ groupId, memberIdToRemove })
            });
            toast({ title: "Member Removed", description: "The member has been removed from the group." });
            fetchUserGroups();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to remove member." });
        }
    };

    // ===== NEW FUNCTION: Handle Making a Member an Admin =====
    const handleMakeAdmin = async (groupId, memberIdToPromote) => {
        try {
            await apiRequest('Group/makeMemberAdmin', {
                method: 'POST',
                body: JSON.stringify({ groupId, memberIdToPromote })
            });
            toast({ title: "Admin Promoted", description: "The member has been promoted to an admin." });
            fetchUserGroups(); // Refresh data to show the new "Admin" badge
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to promote member." });
        }
    };

    const isCurrentUserAdmin = activeGroup?.admins.some(admin => admin._id === user._id);

    return (
        <>
            <Helmet><title>Chat - ENIS-HRMS</title></Helmet>
            
            <AnimatePresence>
                {isCreateGroupOpen && <CreateGroupDialog open={isCreateGroupOpen} setOpen={setIsCreateGroupOpen} allEmployees={allEmployees} onCreateGroup={handleCreateGroup} />}
                {isAddMemberOpen && <AddMembersDialog open={isAddMemberOpen} setOpen={setIsAddMemberOpen} allEmployees={allEmployees} currentGroup={activeGroup} onAddMembers={handleAddMembers} />}
                
                {/* Pass the new onMakeAdmin handler to the dialog */}
                {isManageMembersOpen && <ManageMembersDialog open={isManageMembersOpen} setOpen={setIsManageMembersOpen} group={activeGroup} currentUser={user} onRemoveMember={handleRemoveMember} onMakeAdmin={handleMakeAdmin} />}
            </AnimatePresence>

            <div className="space-y-8 h-[calc(100vh-100px)] flex flex-col">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                    <div><h1 className="text-3xl font-bold text-white">Group Chat</h1><p className="text-gray-400">Communicate with your team in real-time.</p></div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-grow flex gap-6 min-h-0">
                    {/* Group List Sidebar */}
                    <Card className="glass-effect border-white/10 w-1/4 flex flex-col">
                        <CardHeader className="flex-row justify-between items-center">
                            <CardTitle className="text-white">Groups</CardTitle>
                            {/* <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsCreateGroupOpen(true)}><Plus className="w-4 h-4" /></Button> */}
                        </CardHeader>
                        <CardContent className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                            {groups.map(group => (
                                <Button key={group._id} variant="ghost" className={cn("w-full justify-start gap-3", activeGroup?._id === group._id && "bg-white/10")} onClick={() => setActiveGroup(group)}>
                                    <Users className="w-5 h-5 text-gray-400" />{group.groupName}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Chat Window */}
                    <Card className="glass-effect border-white/10 w-3/4 flex flex-col">
                        {activeGroup ? (
                            <>
                                <CardHeader className="border-b border-white/10 flex-row justify-between items-center">
                                    <CardTitle className="text-white flex items-center gap-3"><MessageSquare /> {activeGroup.groupName}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" className="border-white/20" onClick={() => setIsManageMembersOpen(true)}>
                                            <Users className="w-4 h-4 mr-2" />View Members
                                        </Button>
                                        {isCurrentUserAdmin && (
                                            <Button size="sm" variant="outline" className="border-white/20" onClick={() => setIsAddMemberOpen(true)}>
                                                <UserPlus className="w-4 h-4 mr-2" />Add
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                                    {messages.map((msg) => {
                                        const sender = msg.senderId;
                                        if (!sender) {
                                            return (
                                                <div key={msg._id} className={cn("flex items-end gap-3")}>
                                                    <Avatar className="w-8 h-8"><AvatarFallback>?</AvatarFallback></Avatar>
                                                    <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", "bg-slate-800 rounded-bl-none")}>
                                                        <p className="text-xs font-bold text-gray-500 mb-1">Deleted User</p>
                                                        <p className="text-sm text-gray-300 italic">{msg.content}</p>
                                                        <p className="text-xs text-gray-400 text-right mt-1">{new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        const isCurrentUser = sender._id === user._id;
                                        const isSenderStillMember = activeGroup.members.some(member => member._id === sender._id);
                                        return (
                                            <div key={msg._id} className={cn("flex items-end gap-3", isCurrentUser && "justify-end")}>
                                                {!isCurrentUser && (<Avatar className="w-8 h-8"><AvatarImage src={sender.avatar} /><AvatarFallback>{sender.name.charAt(0)}</AvatarFallback></Avatar>)}
                                                <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", isCurrentUser ? "bg-blue-600 rounded-br-none" : "bg-slate-700 rounded-bl-none")}>
                                                    {!isCurrentUser && (
                                                        <p className="text-xs font-bold text-purple-300 mb-1 flex items-center">
                                                            {sender.name}
                                                            {!isSenderStillMember && (<span className="ml-2 text-xs font-normal bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">removed</span>)}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-white">{msg.content}</p>
                                                    <p className="text-xs text-gray-400 text-right mt-1">{new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</p>
                                                </div>
                                                {isCurrentUser && (<Avatar className="w-8 h-8"><AvatarImage src={user.avatar} /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>)}
                                            </div>
                                        );
                                    })}
                                    <div ref={endOfMessagesRef} />
                                </CardContent>
                                <div className="p-4 border-t border-white/10">
                                    <form onSubmit={handleSendMessage} className="flex gap-4">
                                        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-grow glass-effect" autoComplete="off" />
                                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600" size="icon"><Send className="w-5 h-5" /></Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                {groups.length > 0 ? <p>Select a group to start chatting.</p> : <p>Create a group to start chatting.</p>}
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </>
    );
};

export default ChatPage;