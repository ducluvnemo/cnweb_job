import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { X, Send } from 'lucide-react';
import { Button } from './ui/button';
import { addMessage, setSelectedConversation } from './redux/chatSlice';
import useGetMessages from './hooks/useGetMessages';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from './ui/toast';

const CHAT_API_END_POINT = "http://localhost:3000/api/v1/message";

const ChatWindow = ({ onClose, hideBackdrop = false }) => {
    const dispatch = useDispatch();
    const { selectedConversation, messages } = useSelector(store => store.chat);
    const { user } = useSelector(store => store.auth);
    const [messageContent, setMessageContent] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch messages when conversation changes
    useGetMessages(selectedConversation?.user?._id);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!messageContent.trim()) {
            toast({
                title: "Message cannot be empty",
                status: "error",
            });
            return;
        }

        if (!selectedConversation?.user?._id) {
            toast({
                title: "Invalid conversation",
                status: "error",
            });
            return;
        }

        try {
            setLoading(true);
            const receiverId = selectedConversation.user._id;
            console.log("Sending message to:", receiverId);
            const res = await axios.post(
                `${CHAT_API_END_POINT}/send/${receiverId}`,
                { content: messageContent },
                { withCredentials: true }
            );

            if (res.data.success) {
                dispatch(addMessage(res.data.data));
                setMessageContent('');
            }
        } catch (error) {
            console.error("Error details:", error);
            console.error("Response data:", error.response?.data);
            toast({
                title: error.response?.data?.message || "Error sending message",
                status: "error",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!selectedConversation) {
        return null;
    }

    const otherUser = selectedConversation.user;
    const windowClass = hideBackdrop 
        ? "bg-white w-full h-full flex flex-col" 
        : "relative bg-white w-full h-full md:h-[600px] md:w-[450px] md:rounded-lg shadow-xl flex flex-col";

    const windowContent = (
        <div className={windowClass}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex items-center gap-3">
                    <img 
                        src={otherUser?.profile?.profilePhoto || 'https://via.placeholder.com/40'} 
                        alt={otherUser?.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-semibold">{otherUser?.fullName}</h3>
                        <p className="text-xs opacity-90">{otherUser?.email}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-full transition"
                    title="Close chat"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages && messages.length > 0 ? (
                    messages.map((msg, idx) => (
                        <div 
                            key={idx} 
                            className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                                className={`max-w-xs px-4 py-2 rounded-lg ${
                                    msg.sender?._id === user?._id
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-gray-300 text-black rounded-bl-none'
                                }`}
                            >
                                <p className="text-sm break-words">{msg.content}</p>
                                <p className={`text-xs mt-1 ${
                                    msg.sender?._id === user?._id ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No messages yet. Start a conversation!</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        disabled={loading || !messageContent.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2"
                    >
                        {loading ? '...' : <Send className="w-5 h-5" />}
                    </Button>
                </form>
            </div>
        </div>
    );

    if (hideBackdrop) {
        return windowContent;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end md:items-center md:justify-center">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/30"
                onClick={onClose}
            ></div>

            {/* Chat Window */}
            {windowContent}
        </div>
    );
};

export default ChatWindow;
