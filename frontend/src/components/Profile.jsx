import React, { useRef, useState } from 'react'
import Navbar from './share/Navbar'
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Contact, ImageUp, Mail, Pen, FileText, Briefcase, Award, Phone, User, Edit3 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import AppliedJobTable from './AppliedJobTable';
import UpdateProfileDialog from './UpdateProfileDialog';
import UseGetAllAppliedJob from './hooks/UseGetAllAppliedJob';
import { Image } from 'antd';
import axios from 'axios';
import { USER_API_END_POINT } from './utils/constant';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from './ui/toast';
import { setAuthUser } from './redux/authSlice';
import LaterJobTable from './LaterJobTable';

const isResume = true;

const Profile = () => {
    const { user } = useSelector(store => store.auth);
    const [open, setOpen] = useState(false);
    UseGetAllAppliedJob();
    const dispatch = useDispatch();
    const fileInputRef = useRef(null); //lay ra o input
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file)
            const fetchApiUploadImage = async () => {
                try {
                    const res = await axios.post(`${USER_API_END_POINT}/profile/update/img`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        withCredentials: true
                    })
                    if (res.data.success) {
                        toast({
                            title: res.data.message,
                            status: "success",
                            action: (
                                <ToastAction altText="OK">
                                    OK
                                </ToastAction>
                            ),
                        });
                        dispatch(setAuthUser(res.data.user))
                    }
                } catch (error) {
                    console.error(error);
                    toast({
                        title: error.response?.data?.message || 'Cập nhật thất bại',
                        status: "error",
                        action: <ToastAction altText="Try again">Try again</ToastAction>,
                    });
                }
            }
            fetchApiUploadImage();
        }
    };
    return (
        <div className='bg-gradient-to-b from-gray-50 to-white min-h-screen'>
            <Navbar />
            
            {/* Hero Section with Gradient Banner */}
            <div className='relative w-full h-48 bg-gradient-to-r from-orange-500 to-red-500 mb-[-80px]'>
                <div className='absolute inset-0 bg-black/10'></div>
                <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent'></div>
            </div>

            {/* Profile Card */}
            <div className='max-w-6xl mx-auto px-4'>
                <div className='relative bg-white border border-gray-200 rounded-3xl shadow-2xl p-8 mb-6'>
                    {/* Edit Button */}
                    <Button 
                        onClick={() => setOpen(true)} 
                        className='absolute top-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'
                    >
                        <Edit3 className='w-4 h-4 mr-2' />
                        Chỉnh sửa
                    </Button>

                    {/* Profile Header */}
                    <div className='flex flex-col md:flex-row gap-8 items-start'>
                        {/* Avatar Section */}
                        <div className='flex flex-col items-center gap-4'>
                            <div className='relative group'>
                                <div className='absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur opacity-50 group-hover:opacity-75 transition duration-300'></div>
                                <div className='relative'>
                                    <Image
                                        width={120}
                                        height={120}
                                        className='object-cover rounded-full ring-4 ring-white'
                                        src={user.profile.profilePhoto ? (user.profile.profilePhoto) : ("https://github.com/shadcn.png")}
                                    />
                                </div>
                            </div>
                            <Button 
                                variant='outline' 
                                className='gap-2 hover:border-orange-500 hover:text-orange-600 transition-all' 
                                onClick={handleButtonClick}
                            >
                                <ImageUp className='w-4 h-4' />
                                <span>Đổi ảnh</span>
                            </Button>
                            <input
                                type='file'
                                accept='image/*'
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Info Section */}
                        <div className='flex-1 space-y-6'>
                            {/* Name & Bio */}
                            <div>
                                <h1 className='font-bold text-3xl text-gray-900 mb-2 flex items-center gap-2'>
                                    {user.fullName}
                                </h1>
                                <p className='text-gray-600 text-lg leading-relaxed'>
                                    {user?.profile?.bio || 'Chưa có thông tin giới thiệu'}
                                </p>
                            </div>

                            {/* Contact Info Grid */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100'>
                                    <div className='w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                                        <Mail className='w-5 h-5 text-white' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-xs text-gray-500 font-medium'>Email</p>
                                        <p className='text-sm text-gray-900 truncate'>{user?.email}</p>
                                    </div>
                                </div>
                                
                                <div className='flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100'>
                                    <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                                        <Phone className='w-5 h-5 text-white' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-xs text-gray-500 font-medium'>Số điện thoại</p>
                                        <p className='text-sm text-gray-900'>{user?.phoneNumber || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className='space-y-3'>
                                <div className='flex items-center gap-2'>
                                    <Award className='w-5 h-5 text-orange-600' />
                                    <h2 className='text-lg font-bold text-gray-900'>Kỹ năng</h2>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    {user?.profile?.skills.length !== 0 ? (
                                        user?.profile?.skills.map((item, index) => (
                                            <Badge 
                                                key={index}
                                                className='bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 hover:from-orange-200 hover:to-red-200 border-0 px-4 py-2 text-sm font-medium'
                                            >
                                                {item}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className='text-gray-500 italic'>Chưa có kỹ năng nào</span>
                                    )}
                                </div>
                            </div>

                            {/* Resume Section */}
                            <div className='space-y-3'>
                                <div className='flex items-center gap-2'>
                                    <FileText className='w-5 h-5 text-orange-600' />
                                    <h2 className='text-lg font-bold text-gray-900'>Hồ sơ CV</h2>
                                </div>
                                {isResume && user?.profile?.resume ? (
                                    <a 
                                        href={user?.profile?.resume} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl group'
                                    >
                                        <FileText className='w-4 h-4' />
                                        <span className='font-medium'>{user?.profile?.resumeOriginalName}</span>
                                    </a>
                                ) : (
                                    <span className='text-gray-500 italic'>Chưa tải lên CV</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applied Jobs Section */}
                <div className='bg-white rounded-3xl border border-gray-200 shadow-xl p-8 mb-6'>
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center'>
                            <Briefcase className='w-5 h-5 text-white' />
                        </div>
                        <h1 className='font-bold text-2xl text-gray-900'>Công việc đã ứng tuyển</h1>
                    </div>
                    <AppliedJobTable />
                </div>

                {/* Saved Jobs Section */}
                <div className='bg-white rounded-3xl border border-gray-200 shadow-xl p-8 mb-6'>
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center'>
                            <FileText className='w-5 h-5 text-white' />
                        </div>
                        <h1 className='font-bold text-2xl text-gray-900'>Công việc đã lưu</h1>
                    </div>
                    <LaterJobTable />
                </div>
            </div>

            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile