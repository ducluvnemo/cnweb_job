import { Edit2, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import axios from 'axios';
import { JOP_API_END_POINT } from '../utils/constant';
import { message } from 'antd';
import { setAllAdminJob } from '../redux/jobSlice';

const JobsTable = () => {
    const dispatch = useDispatch();
    const { allAdminJob = [], searchJobByText } = useSelector(store => store.job);
    const [filterJob, setFilterJob] = useState([]);
    const navigate = useNavigate();

    const fetchAllJobsAdmin = async () => {
        try {
            const res = await axios.get(`${JOP_API_END_POINT}/getAdminJob`, {
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAllAdminJob(res.data.jobs));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredJob = allAdminJob.filter((job) => {
        if (!searchJobByText) return true;
        console.log("tri ngu",job?.company)
        return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || job?.company?.name.toLowerCase().includes(searchJobByText.toLowerCase());
    });

    useEffect(() => {
        setFilterJob(filteredJob);
    }, [allAdminJob, searchJobByText]);

    const handleDeleteJob = async (jobId, companyId) => {
        try {
            const res = await axios.delete(`${JOP_API_END_POINT}/deleteJob`, {
                data: { jobId, companyId },
                withCredentials: true
            });
            if (res.data.success) {
                message.success(res.data.message);
                fetchAllJobsAdmin();
            }
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message);
        }
    };

    return (
        <div className='max-w-6xl mx-auto my-10'>
            <Table>
                <TableCaption>A list of your recent registered jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Logo</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className='text-right'>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filterJob.length <= 0 ? (
                        <TableRow>
                            <TableCell colSpan="5" className="text-center">
                                No jobs registered
                            </TableCell>
                        </TableRow>
                    ) : (
                        filterJob.map((job, index) => {
                            const date = new Date(job?.createdAt).toISOString().split('T')[0];
                            return (
                                <TableRow key={index}>
                                    <TableCell>{job?.company?.name}</TableCell>
                                    <TableCell>
                                        <Button variant='outline' size='icon' className='p-6'>
                                            <Avatar>
                                                <AvatarImage src={job?.company?.logo} className='object-cover' alt={job?.company?.name} />
                                            </Avatar>
                                        </Button>
                                    </TableCell>
                                    <TableCell>{job?.title}</TableCell>
                                    <TableCell>{date}</TableCell>
                                    <TableCell>{job?.status}</TableCell>
                                    <TableCell className='cursor-pointer text-right'>
                                        <Popover>
                                            <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                            <PopoverContent className='w-30 p-0'>
                                                <div onClick={() => navigate(`/admin/jobs/${job?._id}`)} className='flex items-center w-full cursor-pointer gap-2 border-b p-4 hover:bg-gray-100'>
                                                    <Edit2 className='w-4' />
                                                    <span>Edit</span>
                                                </div>
                                                <div onClick={() => navigate(`/admin/jobs/${job?._id}/applicants`)} className='flex items-center w-full cursor-pointer gap-2 p-4 hover:bg-gray-100'>
                                                    <Eye className='w-4' />
                                                    <span>Applicants</span>
                                                </div>
                                                <div className='flex items-center w-full cursor-pointer gap-2 p-4 hover:bg-gray-100' onClick={() => handleDeleteJob(job?._id, job?.company._id)}>
                                                    <Trash2 className='w-4' />
                                                    <span>Delete Job</span>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default JobsTable;