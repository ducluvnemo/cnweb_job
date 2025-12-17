import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, User, Mail, Phone, FileText, Award, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser, setLoading } from './redux/authSlice';
import { ToastAction } from './ui/toast';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { USER_API_END_POINT } from './utils/constant';

const UpdateProfileDialog = ({ open, setOpen }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { user, loading } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const [dataUser, setdataUser] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.join(', ') || "",
        file: user?.profile?.resume || ""
    });

    const onSubmit = async (data) => {
        const formData = new FormData();

        // Only append file if it exists and is selected
        if (data.resume && data.resume[0]) {
            console.log('Uploading file:', data.resume[0]);
            formData.append('file', data.resume[0]);
        }

        formData.append('fullName', data.fullName);
        formData.append('email', data.email);
        formData.append('phoneNumber', data.phoneNumber);
        formData.append('bio', data.bio);
        formData.append('skills', data.skills);

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                toast({
                    title: res.data.message,
                    status: "success",
                    action: (
                        <ToastAction altText="OK">
                            OK
                        </ToastAction>
                    ),
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: error.response?.data?.message || 'Cập nhật thất bại',
                status: "error",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
        } finally {
            setOpen(false);
            dispatch(setLoading(false));
        }
    };


    const handleInputChange = (e) => {
        const { name, defaultValue } = e.target;
        setdataUser(prev => ({
            ...prev,
            [name]: defaultValue,
        }));
    };

    return (
        <Dialog open={open}>
            <DialogContent className='sm:max-w-[500px] p-0 overflow-hidden' onInteractOutside={() => setOpen(false)}>
                <DialogHeader className='bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white'>
                    <DialogTitle className='text-2xl font-bold flex items-center gap-2'>
                        <User className='w-6 h-6' />
                        Cập nhật hồ sơ
                    </DialogTitle>
                    <p className='text-orange-50 text-sm mt-2'>Điền thông tin của bạn để cập nhật hồ sơ</p>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className='p-6'>
                    <div className='space-y-5'>
                        {/* Full Name */}
                        <div className='space-y-2'>
                            <Label htmlFor='fullName' className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                <User className='w-4 h-4 text-orange-600' />
                                Họ và tên
                            </Label>
                            <Input
                                type='text'
                                id='fullName'
                                name='fullName'
                                defaultValue={dataUser.fullName}
                                onChange={handleInputChange}
                                {...register("fullName")}
                                className='w-full focus:ring-2 focus:ring-orange-500 border-gray-300'
                                placeholder='Nhập họ và tên'
                            />
                        </div>

                        {/* Email */}
                        <div className='space-y-2'>
                            <Label htmlFor='email' className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                <Mail className='w-4 h-4 text-orange-600' />
                                Email
                            </Label>
                            <Input
                                type='email'
                                id='email'
                                name='email'
                                defaultValue={dataUser.email}
                                onChange={handleInputChange}
                                {...register("email")}
                                className='w-full focus:ring-2 focus:ring-orange-500 border-gray-300'
                                placeholder='email@example.com'
                            />
                        </div>

                        {/* Phone Number */}
                        <div className='space-y-2'>
                            <Label htmlFor='phoneNumber' className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                <Phone className='w-4 h-4 text-orange-600' />
                                Số điện thoại
                            </Label>
                            <Input
                                type='text'
                                id='phoneNumber'
                                name='phoneNumber'
                                defaultValue={dataUser.phoneNumber}
                                onChange={handleInputChange}
                                {...register("phoneNumber")}
                                className='w-full focus:ring-2 focus:ring-orange-500 border-gray-300'
                                placeholder='0123456789'
                            />
                        </div>

                        {/* Bio */}
                        <div className='space-y-2'>
                            <Label htmlFor='bio' className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                <Briefcase className='w-4 h-4 text-orange-600' />
                                Giới thiệu
                            </Label>
                            <Input
                                type='text'
                                id='bio'
                                name='bio'
                                defaultValue={dataUser.bio}
                                onChange={handleInputChange}
                                {...register("bio")}
                                className='w-full focus:ring-2 focus:ring-orange-500 border-gray-300'
                                placeholder='Giới thiệu ngắn về bản thân'
                            />
                        </div>

                        {/* Skills */}
                        <div className='space-y-2'>
                            <Label htmlFor='skills' className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                <Award className='w-4 h-4 text-orange-600' />
                                Kỹ năng
                            </Label>
                            <Input
                                type='text'
                                id='skills'
                                name='skills'
                                defaultValue={dataUser.skills}
                                onChange={handleInputChange}
                                {...register("skills")}
                                className='w-full focus:ring-2 focus:ring-orange-500 border-gray-300'
                                placeholder='React, Node.js, Python (phân cách bằng dấu phẩy)'
                            />
                        </div>

                        {/* Resume */}
                        <div className='space-y-2'>
                            <Label htmlFor="file" className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                <FileText className='w-4 h-4 text-orange-600' />
                                Hồ sơ CV
                            </Label>
                            <Input
                                type="file"
                                accept="application/pdf"
                                id="file"
                                name="resume"
                                {...register("resume")}
                                className='w-full focus:ring-2 focus:ring-orange-500 border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100'
                            />
                            <p className='text-xs text-gray-500'>Chỉ chấp nhận file PDF</p>
                        </div>
                    </div>

                    <DialogFooter className='mt-6 gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => setOpen(false)}
                            className='flex-1 hover:bg-gray-100'
                        >
                            Hủy
                        </Button>
                        {loading ? (
                            <Button className='flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' disabled>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Đang cập nhật...
                            </Button>
                        ) : (
                            <Button className='flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg' type="submit">
                                Cập nhật
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateProfileDialog;
