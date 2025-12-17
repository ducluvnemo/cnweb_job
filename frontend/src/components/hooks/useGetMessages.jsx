import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setMessages, setLoading, setError } from '../redux/chatSlice';

const CHAT_API_END_POINT = "http://localhost:3000/api/v1/message";

export const useGetMessages = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;

        const fetchMessages = async () => {
            try {
                dispatch(setLoading(true));
                const res = await axios.get(`${CHAT_API_END_POINT}/get/${userId}`, { 
                    withCredentials: true 
                });
                if (res.data.success) {
                    dispatch(setMessages(res.data.messages));
                    dispatch(setError(null));
                }
            } catch (error) {
                console.error(error);
                dispatch(setError(error.response?.data?.message || "Error fetching messages"));
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchMessages();
    }, [userId, dispatch]);
};

export default useGetMessages;
