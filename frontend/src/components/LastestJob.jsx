import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp } from 'lucide-react';

const LastestJob = () => {
    const { allJobs } = useSelector(store => store.job);
    const navigate = useNavigate();

    return (
        <div className='max-w-7xl mx-auto my-20 px-4'>
            {/* Section Header */}
            <div className='text-center mb-12'>
                <div className='inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-4'>
                    <TrendingUp className='w-5 h-5 text-orange-600' />
                    <span className='text-orange-600 font-semibold'>Việc làm mới nhất</span>
                </div>
                <h1 className='text-5xl font-extrabold mb-4'>
                    <span className='bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>Cơ hội nghề nghiệp</span>
                    {' '}hàng đầu
                </h1>
                <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
                    Khám phá những vị trí việc làm hot nhất từ các công ty hàng đầu
                </p>
            </div>

            {/* Jobs Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {allJobs.length <= 0 ? (
                    <div className='col-span-3 text-center py-16'>
                        <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <Briefcase className='w-12 h-12 text-gray-400' />
                        </div>
                        <p className='text-xl text-gray-500'>Chưa có công việc nào</p>
                    </div>
                ) : (
                    allJobs.slice(0, 6).map((item, index) => (
                        <LatestJobCards
                            onClick={() => navigate(`/description/${item?._id}`)}
                            key={item?._id || index}
                            job={item}
                        />
                    ))
                )}
            </div>

            {/* View All Button */}
            {allJobs.length > 6 && (
                <div className='text-center mt-12'>
                    <button
                        onClick={() => navigate('/jobs')}
                        className='px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300'
                    >
                        Xem tất cả {allJobs.length} công việc
                    </button>
                </div>
            )}
        </div>
    )
}

export default LastestJob