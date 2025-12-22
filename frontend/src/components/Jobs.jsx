import React, { useEffect, useState } from 'react'
import Navbar from './share/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import GetAllLaterJob from './hooks/GetAllLaterJob';
import UseGetAllJobs from './hooks/UseGetAllJobs';

const Jobs = () => {
  const { allJobs, selectedValueFilter } = useSelector(store => store.job);
  const [fiterJob, setFilterJob] = useState([]);
  GetAllLaterJob();

  useEffect(() => {
    const filteredJobs = allJobs.length > 0 && allJobs.filter((job) => {
      if (!selectedValueFilter || Object.keys(selectedValueFilter).length === 0) return true;

      // Check title filter
      const titleMatch = !selectedValueFilter.title ||
        job?.title?.toLowerCase().includes(selectedValueFilter.title.toLowerCase());

      // Check location filter - flexible matching
      const locationMatch = !selectedValueFilter.location ||
        job?.location?.toLowerCase().includes(selectedValueFilter.location.toLowerCase()) ||
        selectedValueFilter.location.toLowerCase().includes(job?.location?.toLowerCase());

      return titleMatch && locationMatch;
    });
    setFilterJob(filteredJobs);
  }, [selectedValueFilter, allJobs])

  return (
    <div>
      <UseGetAllJobs /> 
      <Navbar />

      <div className='mx-auto max-w-7xl mt-5'>
        <div className='flex gap-5'>
          <div className='w-20%'>
            <FilterCard />
          </div>
          {
            fiterJob.length <= 0 ? (
              <span>Không tìm thấy job</span>
            ) : (
              <div className='flex-1 h-[88vh] overflow-y-auto pb-5'>
                <div className='grid grid-cols-3 gap-4'>
                  {
                    fiterJob.map((item, index) => (
                      <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        key={index}
                      >
                        <Job job={item} />
                      </motion.div>
                    ))
                  }
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default Jobs