import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { JOP_API_END_POINT } from '../utils/constant';
import { setAllAdminJob } from '../redux/jobSlice';

const UseGetAllJobsAdmin = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchAllJobsAdmin = async () => {
            try {
                // Check if user is admin
                const endpoint = user?.role === 'admin'
                    ? `${JOP_API_END_POINT}/getAllJobsForAdmin`
                    : `${JOP_API_END_POINT}/getAdminJob`;

                const res = await axios.get(endpoint, {
                    withCredentials: true
                });
                if (res.data.success) {
                    dispatch(setAllAdminJob(res.data.jobs));
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchAllJobsAdmin();
    }, [user])
    return null;
}

export default UseGetAllJobsAdmin