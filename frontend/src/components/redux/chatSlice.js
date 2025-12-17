import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        conversations: [],
        selectedConversation: null,
        messages: [],
        loading: false,
        error: null
    },
    reducers: {
        setConversations: (state, action) => {
            state.conversations = action.payload;
        },
        setSelectedConversation: (state, action) => {
            state.selectedConversation = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearChat: (state) => {
            state.messages = [];
            state.selectedConversation = null;
        }
    }
});

export const {
    setConversations,
    setSelectedConversation,
    setMessages,
    addMessage,
    setLoading,
    setError,
    clearChat
} = chatSlice.actions;

export default chatSlice.reducer;
