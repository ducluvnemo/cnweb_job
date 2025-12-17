import React from 'react'
import { Badge } from './ui/badge'
import { MapPin, Briefcase, DollarSign, Building2, Clock, Users } from 'lucide-react'

const LatestJobCards = ({ job, onClick }) => {
    return (
        <div
            onClick={onClick}
            className='group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden hover:-translate-y-2'
        >
            {/* Gradient Border on Hover */}
            <div className='absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl'
                style={{ padding: '2px' }}>
                <div className='bg-white rounded-2xl h-full w-full'></div>
            </div>

            {/* Content */}
            <div className='relative p-6'>
                {/* Company Header */}
                <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center flex-shrink-0'>
                            {job?.company?.logo ? (
                                <img
                                    src={job.company.logo}
                                    alt={job?.company?.name}
                                    className='w-10 h-10 object-contain'
                                />
                            ) : (
                                <Building2 className='w-6 h-6 text-orange-600' />
                            )}
                        </div>
                        <div>
                            <h3 className='font-bold text-gray-900 group-hover:text-orange-600 transition-colors'>
                                {job?.company?.name}
                            </h3>
                            <p className='text-sm text-gray-500 flex items-center gap-1'>
                                <MapPin className='w-3 h-3' />
                                {job?.location}
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        className='w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 flex items-center justify-center transition-colors'
                        onClick={(e) => {
                            e.stopPropagation();
                            // Add save functionality
                        }}
                    >
                        <svg className='w-4 h-4 text-gray-600 hover:text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' />
                        </svg>
                    </button>
                </div>

                {/* Job Title & Description */}
                <div className='mb-4'>
                    <h2 className='font-bold text-xl text-gray-900 mb-2 line-clamp-1'>
                        {job?.title}
                    </h2>
                    <p className='text-sm text-gray-600 line-clamp-2 leading-relaxed'>
                        {job?.description}
                    </p>
                </div>

                {/* Job Details */}
                <div className='flex flex-wrap gap-2 mb-4'>
                    <Badge className='bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 px-3 py-1'>
                        <Users className='w-3 h-3 mr-1' />
                        {job?.position} vị trí
                    </Badge>
                    <Badge className='bg-green-50 text-green-700 hover:bg-green-100 border-0 px-3 py-1'>
                        <DollarSign className='w-3 h-3 mr-1' />
                        {job?.salary} triệu
                    </Badge>
                    <Badge className='bg-purple-50 text-purple-700 hover:bg-purple-100 border-0 px-3 py-1'>
                        <Clock className='w-3 h-3 mr-1' />
                        {job?.jobType}
                    </Badge>
                </div>

                {/* Footer - Apply Button */}
                <div className='pt-4 border-t border-gray-100'>
                    <button className='w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg group-hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2'>
                        <Briefcase className='w-4 h-4' />
                        Xem chi tiết
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LatestJobCards