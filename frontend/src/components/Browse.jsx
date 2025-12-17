import React, { useEffect } from 'react'
import Navbar from './share/Navbar'
import Job from './Job';
import { useSelector } from 'react-redux';
import UseGetAllJobsSearch from './hooks/UseGetAllJobsSearch';
import { motion } from 'framer-motion';
import { Search, Briefcase, MapPin, Building2 } from 'lucide-react';

const Browse = () => {
    UseGetAllJobsSearch();
    const { allJobs, searchJobByQuery } = useSelector(store => store.job);

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-orange-50'>
            <Navbar />

            <div className='max-w-7xl mx-auto px-4 py-8'>
                {/* Search Header */}
                <div className='bg-white rounded-2xl shadow-lg p-8 mb-8'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                                <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center'>
                                    <Search className='w-6 h-6 text-white' />
                                </div>
                                Kết quả tìm kiếm
                            </h1>
                            {searchJobByQuery && (
                                <p className='text-gray-600 text-lg ml-15'>
                                    Tìm kiếm cho: <span className='font-semibold text-orange-600'>"{searchJobByQuery}"</span>
                                </p>
                            )}
                        </div>
                        <div className='text-right'>
                            <p className='text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
                                {allJobs.length}
                            </p>
                            <p className='text-gray-600'>công việc tìm thấy</p>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {allJobs.length === 0 ? (
                    <div className='bg-white rounded-2xl shadow-lg p-16 text-center'>
                        <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                            <Briefcase className='w-12 h-12 text-gray-400' />
                        </div>
                        <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                            Không tìm thấy công việc phù hợp
                        </h3>
                        <p className='text-gray-600 mb-6'>
                            Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc của bạn
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className='px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300'
                        >
                            Quay về trang chủ
                        </button>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {allJobs.map((job, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                key={job._id || index}
                            >
                                <Job job={job} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Browse