import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setConversations, setLoading, setError } from '../redux/chatSlice';

const CHAT_API_END_POINT = "http://localhost:3000/api/v1/message";

export const useGetConversations = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                dispatch(setLoading(true));
                const res = await axios.get(`${CHAT_API_END_POINT}/conversations`, { 
                    withCredentials: true 
                });
                if (res.data.success) {
                    dispatch(setConversations(res.data.conversations));
                    dispatch(setError(null));
                }
            } catch (error) {
                console.error(error);
                dispatch(setError(error.response?.data?.message || "Error fetching conversations"));
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchConversations();
    }, [dispatch]);
};

export default useGetConversations;
