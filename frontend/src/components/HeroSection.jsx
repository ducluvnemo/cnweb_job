import { Search } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { useDispatch } from 'react-redux';
import { setSearchJobByQuery } from './redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleSearchJob = () => {
        dispatch(setSearchJobByQuery(query));
        navigate('/brower')
    }

    return (
        <div className='relative overflow-hidden'>
            {/* Background Gradient */}
            <div className='absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 -z-10'></div>

            {/* Decorative Elements */}
            <div className='absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob'></div>
            <div className='absolute top-40 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000'></div>
            <div className='absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000'></div>

            <div className='text-center relative z-10'>
                <div className='flex flex-col gap-8 my-16 px-4'>
                    {/* Badge */}
                    <span className='mx-auto px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer'>
                        🏆 Nền tảng tuyển dụng #1 Việt Nam
                    </span>

                    {/* Main Heading */}
                    <h1 className='text-6xl font-extrabold leading-tight'>
                        Tìm kiếm, Ứng tuyển & <br />
                        Nhận được <span className='bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>Công việc Mơ ước</span>
                    </h1>

                    {/* Subtitle */}
                    <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
                        Khám phá hàng nghìn cơ hội việc làm hấp dẫn từ các công ty hàng đầu.
                        Bắt đầu hành trình sự nghiệp của bạn ngay hôm nay!
                    </p>

                    {/* Search Box */}
                    <div className='flex w-full max-w-2xl shadow-2xl border-2 border-gray-200 rounded-full items-center gap-2 mx-auto bg-white hover:border-orange-300 transition-all duration-300 overflow-hidden'>
                        <div className='flex items-center gap-3 pl-6 flex-1'>
                            <Search className='text-gray-400 w-5 h-5' />
                            <input
                                type='text'
                                placeholder='Nhập vị trí công việc, kỹ năng hoặc công ty...'
                                className='w-full py-4 focus:outline-none outline-none border-none text-lg'
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchJob()}
                            />
                        </div>
                        <Button
                            onClick={handleSearchJob}
                            className='rounded-r-full h-full px-8 py-6 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl'
                        >
                            Tìm kiếm
                        </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className='flex items-center justify-center gap-12 mt-8'>
                        <div className='text-center'>
                            <p className='text-3xl font-bold text-orange-600'>10K+</p>
                            <p className='text-gray-600'>Việc làm</p>
                        </div>
                        <div className='w-px h-12 bg-gray-300'></div>
                        <div className='text-center'>
                            <p className='text-3xl font-bold text-red-600'>500+</p>
                            <p className='text-gray-600'>Công ty</p>
                        </div>
                        <div className='w-px h-12 bg-gray-300'></div>
                        <div className='text-center'>
                            <p className='text-3xl font-bold text-pink-600'>50K+</p>
                            <p className='text-gray-600'>Ứng viên</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection