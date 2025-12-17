import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, X } from 'lucide-react';
import { setSelectedConversation } from './redux/chatSlice';
import useGetConversations from './hooks/useGetConversations';
import ChatWindow from './ChatWindow';

const ConversationList = ({ onClose, onSelectConversation }) => {
    const dispatch = useDispatch();
    const { conversations, selectedConversation } = useSelector(store => store.chat);

    // Fetch conversations
    useGetConversations();
    
    console.log("Conversations loaded:", conversations);

    const handleSelectConversation = (conversation) => {
        dispatch(setSelectedConversation(conversation));
        onSelectConversation(conversation);
    };

    const handleCloseChat = () => {
        dispatch(setSelectedConversation(null));
    };

    const formatLastMessageTime = (time) => {
        const date = new Date(time);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end md:items-center md:justify-end">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/30"
                onClick={onClose}
            ></div>

            {/* Container for both list and chat */}
            <div className="relative flex gap-0 w-full h-full md:h-[600px] md:w-auto md:rounded-lg shadow-xl">
                {/* Conversation List */}
                <div className="bg-white w-full md:w-[350px] h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-6 h-6" />
                            <h2 className="text-lg font-semibold">Messages</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-full transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations && conversations.length > 0 ? (
                            conversations.map((conversation, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectConversation(conversation)}
                                    className={`p-4 border-b hover:bg-gray-100 cursor-pointer transition active:bg-gray-200 ${
                                        selectedConversation?.user?._id === conversation.user?._id ? 'bg-gray-100' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={conversation.user?.profile?.profilePhoto || 'https://via.placeholder.com/48'} 
                                            alt={conversation.user?.fullName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate">
                                                {conversation.user?.fullName}
                                            </h3>
                                            <p className="text-xs text-gray-600 truncate">
                                                {conversation.isLastMessageFromMe ? 'You: ' : ''}
                                                {conversation.lastMessage}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatLastMessageTime(conversation.lastMessageTime)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>No conversations yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Window - shown on desktop when conversation selected */}
                {selectedConversation && (
                    <div className="hidden md:flex bg-white w-[450px] h-full flex-col border-l">
                        <ChatWindow onClose={handleCloseChat} hideBackdrop={true} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
