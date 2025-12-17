import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Bookmark, BookmarkCheck, MapPin, Building2, DollarSign, Briefcase, Clock, Users } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { JOB_LATER_API_END_POINT } from './utils/constant'
import { message } from 'antd'
import GetAllLaterJob from './hooks/GetAllLaterJob'
import { useSelector } from 'react-redux'

const Job = ({ job }) => {
  const [save, setSave] = useState(false);
  const { AllSaveForLater } = useSelector(store => store.saveForLater);
  const navigate = useNavigate();
  const jobId = job?._id;

  const dateString = job?.createdAt;
  const date = new Date(dateString);
  const day = date.getUTCDate();
  const now = new Date();
  const daynow = now.getUTCDate();

  const handleAddLaterJob = (jobId, companyId) => {
    try {
      const fetchApiPostLaterJob = async () => {
        const res = await axios.post(`${JOB_LATER_API_END_POINT}/post`, {
          jobId,
          companyId
        }, {
          withCredentials: true
        })
        if (res.data.success) {
          message.success(res.data.message);
          setSave(true);
          GetAllLaterJob();
        }
      }
      fetchApiPostLaterJob();
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message);
    }
  }

  useEffect(() => {
    setSave(AllSaveForLater.some(item => item?.job?._id === jobId));
  }, [AllSaveForLater, jobId]);

  return (
    <div className='group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden hover:-translate-y-1'>
      {/* Gradient Border on Hover */}
      <div className='absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl' 
           style={{padding: '2px'}}>
        <div className='bg-white rounded-2xl h-full w-full'></div>
      </div>
      
      {/* Content */}
      <div className='relative p-6'>
        {/* Header - Date & Bookmark */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
            <p className='text-sm text-gray-500 font-medium'>
              {daynow - day === 0 ? <span className='text-green-600'>Hôm nay</span> : `-${daynow - day} ngày trước`}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!save) handleAddLaterJob(job?._id, job?.company?._id);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              save 
                ? 'bg-orange-100 text-orange-600' 
                : 'bg-gray-100 hover:bg-orange-100 hover:text-orange-600'
            }`}
          >
            {save ? <BookmarkCheck className='w-5 h-5' /> : <Bookmark className='w-5 h-5' />}
          </button>
        </div>

        {/* Company Info */}
        <div className='flex items-start gap-3 mb-4'>
          <div className='w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden'>
            {job?.company?.logo ? (
              <Avatar className='w-12 h-12'>
                <AvatarImage src={job?.company?.logo} className='object-contain' alt={job?.company?.name} />
              </Avatar>
            ) : (
              <Building2 className='w-7 h-7 text-orange-600' />
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1 truncate'>
              {job?.company?.name}
            </h3>
            <p className='text-sm text-gray-500 flex items-center gap-1 truncate'>
              <MapPin className='w-3 h-3 flex-shrink-0' />
              {job?.location}
            </p>
          </div>
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

        {/* Job Details Badges */}
        <div className='flex flex-wrap gap-2 mb-4'>
          <Badge className='bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 px-3 py-1.5 font-medium'>
            <Users className='w-3 h-3 mr-1' />
            {job?.position} vị trí
          </Badge>
          <Badge className='bg-green-50 text-green-700 hover:bg-green-100 border-0 px-3 py-1.5 font-medium'>
            <DollarSign className='w-3 h-3 mr-1' />
            {job?.salary} triệu
          </Badge>
          <Badge className='bg-purple-50 text-purple-700 hover:bg-purple-100 border-0 px-3 py-1.5 font-medium'>
            <Clock className='w-3 h-3 mr-1' />
            {job?.jobType}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-3 pt-4 border-t border-gray-100'>
          <Button 
            variant='outline' 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/description/${jobId}`);
            }}
            className='flex-1 border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 font-semibold transition-all duration-300'
          >
            <Briefcase className='w-4 h-4 mr-2' />
            Chi tiết
          </Button>
          {!save && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleAddLaterJob(job?._id, job?.company?._id);
              }}
              className='flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
            >
              <BookmarkCheck className='w-4 h-4 mr-2' />
              Lưu sau
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Job