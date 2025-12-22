import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { APPLICATION_API_END_POINT } from '../utils/constant';
import { setAllAppliedJobs } from '../redux/jobSlice';

const UseGetAllAppliedJob = () => {
    const dispatch = useDispatch();

    useEffect(()=>{
        const fetchAppliedJobs = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/get`,{
                    withCredentials: true
                });
                
                if(res.data.message){
                    dispatch(setAllAppliedJobs(res.data.application))
                }       
            } catch (error) {
                console.error(error);
            }
        }
        fetchAppliedJobs();
    },[dispatch])
}

export default UseGetAllAppliedJob