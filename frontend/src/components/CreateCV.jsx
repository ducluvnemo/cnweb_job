import React, { useState, useRef } from 'react';
import Navbar from './share/Navbar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  FileText, Download, Plus, X, User, Mail, Phone, MapPin,
  Briefcase, GraduationCap, Award, Globe, Calendar, Trash2, Save, ImageUp
} from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { CV_API_END_POINT } from './utils/cvConstant';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from './ui/toast';
import { useNavigate } from 'react-router-dom';

const CVTemplates = {
  simple: 'Simple',
  professional: 'Professional',
  creative: 'Creative'
};

const CreateCV = () => {
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const cvPreviewRef = useRef();
  const avatarInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [cvData, setCvData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: '',
    website: '',
    objective: '',
    experiences: [{
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false
    }],
    education: [{
      degree: '',
      school: '',
      startDate: '',
      endDate: '',
      description: ''
    }],
    skills: user?.profile?.skills || [],
    newSkill: '',
    certifications: [{
      name: '',
      issuer: '',
      date: ''
    }]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCvData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
        current: false
      }]
    }));
  };

  const removeExperience = (index) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index, field, value) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        school: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }));
  };

  const removeEducation = (index) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index, field, value) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addSkill = () => {
    if (cvData.newSkill.trim()) {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const removeSkill = (index) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setCvData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuer: '',
        date: ''
      }]
    }));
  };

  const removeCertification = (index) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index, field, value) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const handleDownload = () => {
    window.print();
  };

  const handleSaveCV = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!cvData.fullName || !cvData.email) {
        toast({
          title: "Vui lòng điền đầy đủ họ tên và email",
          status: "error",
        });
        return;
      }

      const cvPayload = {
        templateType: selectedTemplate,
        personalInfo: {
          fullName: cvData.fullName,
          email: cvData.email,
          phone: cvData.phone,
          address: cvData.address,
          website: cvData.website,
          objective: cvData.objective
        },
        experiences: cvData.experiences.filter(exp => exp.title && exp.company),
        education: cvData.education.filter(edu => edu.degree && edu.school),
        skills: cvData.skills,
        certifications: cvData.certifications.filter(cert => cert.name)
      };

      const res = await axios.post(`${CV_API_END_POINT}/create`, cvPayload, {
        withCredentials: true
      });

      if (res.data.success) {
        toast({
          title: "CV đã được lưu thành công!",
          status: "success",
          action: <ToastAction altText="OK">OK</ToastAction>,
        });

        // Navigate to CV list or profile after save
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: error.response?.data?.message || "Lỗi khi lưu CV",
        status: "error",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const printContent = cvPreviewRef.current;
    const originalContents = document.body.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');

    printWindow.document.write('<html><head><title>CV - ' + cvData.fullName + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; margin: 20px; }
      .cv-container { max-width: 800px; margin: 0 auto; }
      h1 { font-size: 24px; text-align: center; text-transform: uppercase; border-bottom: 3px solid #f97316; padding-bottom: 10px; }
      h2 { font-size: 16px; color: #f97316; border-bottom: 1px solid #d1d5db; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; }
      h3 { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
      .contact-info { text-align: center; font-size: 12px; color: #666; margin-bottom: 20px; }
      .contact-info span { margin: 0 10px; }
      .section { margin-bottom: 20px; }
      .experience-item, .education-item, .cert-item { margin-bottom: 15px; }
      .date { float: right; color: #666; font-size: 12px; }
      .description { font-size: 12px; color: #555; line-height: 1.5; margin-top: 5px; }
      .skills { display: flex; flex-wrap: wrap; gap: 8px; }
      .skill-badge { background: #fed7aa; color: #9a3412; padding: 4px 12px; border-radius: 4px; font-size: 11px; }
      p { margin: 5px 0; font-size: 13px; }
      .company { color: #666; font-size: 13px; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<div class="cv-container">');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</div></body></html>');

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className='bg-gradient-to-b from-gray-50 to-white min-h-screen'>
      <Navbar />

      {/* Header */}
      <div className='bg-gradient-to-r from-orange-500 to-red-500 py-12'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-white mb-3 flex items-center gap-3'>
                <FileText className='w-10 h-10' />
                Tạo CV Chuyên Nghiệp
              </h1>
              <p className='text-orange-50 text-lg'>
                Chọn mẫu CV ưa thích và tạo hồ sơ xin việc hoàn hảo của bạn
              </p>
            </div>
            <div className='flex gap-3'>
              <Button
                onClick={handleSaveCV}
                disabled={loading}
                className='bg-white text-orange-600 hover:bg-orange-50 shadow-xl px-6 py-6 text-lg font-semibold'
              >
                <Save className='w-5 h-5 mr-2' />
                {loading ? 'Đang lưu...' : 'Lưu CV'}
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className='bg-green-600 hover:bg-green-700 text-white shadow-xl px-6 py-6 text-lg font-semibold'
              >
                <Download className='w-5 h-5 mr-2' />
                Tải PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Side - Form Input */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Template Selection */}
            <div className='bg-white rounded-2xl shadow-xl p-6 border border-gray-200'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <FileText className='w-6 h-6 text-orange-600' />
                Chọn mẫu CV
              </h2>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {Object.entries(CVTemplates).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${selectedTemplate === key
                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                        : 'border-gray-200 hover:border-orange-300'
                      }`}
                  >
                    <div className='aspect-[3/4] bg-white rounded-lg mb-2 overflow-hidden border border-gray-200 relative'>
                      {/* Template Thumbnails */}
                      {key === 'simple' && (
                        <div className='p-2 text-[6px] leading-tight'>
                          <div className='text-center mb-1'>
                            <div className='font-bold text-[8px]'>HỌ TÊN</div>
                            <div className='text-gray-500 text-[5px]'>Email • SĐT</div>
                          </div>
                          <div className='border-t border-gray-300 my-1'></div>
                          <div className='space-y-1'>
                            <div className='font-bold text-[6px]'>KINH NGHIỆM</div>
                            <div className='h-2 bg-gray-200 rounded'></div>
                            <div className='h-2 bg-gray-200 rounded w-3/4'></div>
                          </div>
                        </div>
                      )}
                      {key === 'professional' && (
                        <div className='p-2 text-[6px] leading-tight'>
                          <div className='text-center border-b-2 border-orange-400 pb-1 mb-1'>
                            <div className='font-bold text-[8px]'>HỌ TÊN</div>
                            <div className='text-[5px]'>📧 📱 📍</div>
                          </div>
                          <div className='space-y-1'>
                            <div className='font-bold text-orange-600 text-[6px] border-b'>KINH NGHIỆM</div>
                            <div className='h-2 bg-orange-100 rounded'></div>
                            <div className='h-1 bg-gray-200 rounded'></div>
                          </div>
                        </div>
                      )}
                      {key === 'creative' && (
                        <div className='p-2 text-[6px] leading-tight bg-gradient-to-br from-purple-50 to-pink-50 h-full'>
                          <div className='flex items-center gap-1 mb-1'>
                            <div className='w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400'></div>
                            <div>
                              <div className='font-bold text-[7px]'>HỌ TÊN</div>
                              <div className='text-[5px] text-purple-600'>Chức danh</div>
                            </div>
                          </div>
                          <div className='space-y-1'>
                            <div className='h-1 bg-purple-200 rounded'></div>
                            <div className='h-1 bg-pink-200 rounded w-3/4'></div>
                            <div className='flex gap-0.5'>
                              <div className='h-1 w-1 bg-purple-400 rounded'></div>
                              <div className='h-1 w-1 bg-pink-400 rounded'></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className='font-semibold text-gray-900 text-sm'>{name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className='bg-white rounded-2xl shadow-xl p-6 border border-gray-200'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <User className='w-6 h-6 text-orange-600' />
                Thông tin cá nhân
              </h2>

              {/* Avatar Upload - Only for Creative */}
              {selectedTemplate === 'creative' && (
                <div className='mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200'>
                  <Label className='text-sm font-semibold text-gray-700 mb-3 block items-center gap-2'>
                    <User className='w-4 h-4 text-orange-600' />
                    Ảnh đại diện (Bắt buộc cho mẫu Creative)
                  </Label>
                  <div className='flex items-center gap-4'>
                    <div
                      onClick={handleAvatarClick}
                      className='w-24 h-24 bg-gradient-to-br from-orange-200 to-red-200 rounded-full flex items-center justify-center cursor-pointer hover:from-orange-300 hover:to-red-300 transition-all border-4 border-white shadow-lg overflow-hidden'
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className='w-full h-full object-cover' />
                      ) : (
                        <User className='w-12 h-12 text-white' />
                      )}
                    </div>
                    <div className='flex-1'>
                      <input
                        type='file'
                        ref={avatarInputRef}
                        accept='image/*'
                        onChange={handleAvatarChange}
                        className='hidden'
                      />
                      <Button
                        type='button'
                        onClick={handleAvatarClick}
                        className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                      >
                        <ImageUp className='w-4 h-4 mr-2' />
                        Tải ảnh lên
                      </Button>
                      <p className='text-xs text-gray-500 mt-2'>
                        Ảnh sẽ hiển thị trong CV. Khuyến nghị: ảnh vuông, nền trơn
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='fullName' className='flex items-center gap-2'>
                    <User className='w-4 h-4 text-gray-500' />
                    Họ và tên
                  </Label>
                  <Input
                    id='fullName'
                    name='fullName'
                    value={cvData.fullName}
                    onChange={handleInputChange}
                    placeholder='Nguyễn Văn A'
                    className='focus:ring-2 focus:ring-orange-500'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email' className='flex items-center gap-2'>
                    <Mail className='w-4 h-4 text-gray-500' />
                    Email
                  </Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={cvData.email}
                    onChange={handleInputChange}
                    placeholder='email@example.com'
                    className='focus:ring-2 focus:ring-orange-500'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='phone' className='flex items-center gap-2'>
                    <Phone className='w-4 h-4 text-gray-500' />
                    Số điện thoại
                  </Label>
                  <Input
                    id='phone'
                    name='phone'
                    value={cvData.phone}
                    onChange={handleInputChange}
                    placeholder='0123456789'
                    className='focus:ring-2 focus:ring-orange-500'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='address' className='flex items-center gap-2'>
                    <MapPin className='w-4 h-4 text-gray-500' />
                    Địa chỉ
                  </Label>
                  <Input
                    id='address'
                    name='address'
                    value={cvData.address}
                    onChange={handleInputChange}
                    placeholder='Hà Nội, Việt Nam'
                    className='focus:ring-2 focus:ring-orange-500'
                  />
                </div>
                <div className='md:col-span-2 space-y-2'>
                  <Label htmlFor='website' className='flex items-center gap-2'>
                    <Globe className='w-4 h-4 text-gray-500' />
                    Website / LinkedIn
                  </Label>
                  <Input
                    id='website'
                    name='website'
                    value={cvData.website}
                    onChange={handleInputChange}
                    placeholder='linkedin.com/in/profile'
                    className='focus:ring-2 focus:ring-orange-500'
                  />
                </div>
                <div className='md:col-span-2 space-y-2'>
                  <Label htmlFor='objective'>Mục tiêu nghề nghiệp</Label>
                  <Textarea
                    id='objective'
                    name='objective'
                    value={cvData.objective}
                    onChange={handleInputChange}
                    placeholder='Mô tả ngắn gọn về mục tiêu nghề nghiệp của bạn...'
                    rows={4}
                    className='focus:ring-2 focus:ring-orange-500'
                  />
                </div>
              </div>
            </div>

            {/* Work Experience */}
            <div className='bg-white rounded-2xl shadow-xl p-6 border border-gray-200'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                  <Briefcase className='w-6 h-6 text-orange-600' />
                  Kinh nghiệm làm việc
                </h2>
                <Button
                  onClick={addExperience}
                  className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  size='sm'
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Thêm
                </Button>
              </div>
              <div className='space-y-4'>
                {cvData.experiences.map((exp, index) => (
                  <div key={index} className='p-4 border-2 border-gray-200 rounded-xl relative'>
                    <Button
                      onClick={() => removeExperience(index)}
                      variant='ghost'
                      size='sm'
                      className='absolute top-2 right-2 text-red-500 hover:text-red-700'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label>Vị trí</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          placeholder='Senior Developer'
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Công ty</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder='ABC Company'
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Từ ngày</Label>
                        <Input
                          type='month'
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Đến ngày</Label>
                        <Input
                          type='month'
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          disabled={exp.current}
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                        <label className='flex items-center gap-2 text-sm'>
                          <input
                            type='checkbox'
                            checked={exp.current}
                            onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                            className='rounded'
                          />
                          Hiện tại
                        </label>
                      </div>
                      <div className='md:col-span-2 space-y-1'>
                        <Label>Mô tả công việc</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          placeholder='Mô tả chi tiết về công việc và thành tích...'
                          rows={3}
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className='bg-white rounded-2xl shadow-xl p-6 border border-gray-200'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                  <GraduationCap className='w-6 h-6 text-orange-600' />
                  Học vấn
                </h2>
                <Button
                  onClick={addEducation}
                  className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  size='sm'
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Thêm
                </Button>
              </div>
              <div className='space-y-4'>
                {cvData.education.map((edu, index) => (
                  <div key={index} className='p-4 border-2 border-gray-200 rounded-xl relative'>
                    <Button
                      onClick={() => removeEducation(index)}
                      variant='ghost'
                      size='sm'
                      className='absolute top-2 right-2 text-red-500 hover:text-red-700'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <Label>Bằng cấp / Chuyên ngành</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder='Cử nhân Công nghệ thông tin'
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Trường học</Label>
                        <Input
                          value={edu.school}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          placeholder='Đại học ABC'
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Từ năm</Label>
                        <Input
                          type='month'
                          value={edu.startDate}
                          onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Đến năm</Label>
                        <Input
                          type='month'
                          value={edu.endDate}
                          onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                      <div className='md:col-span-2 space-y-1'>
                        <Label>Thành tích / Môn học nổi bật</Label>
                        <Textarea
                          value={edu.description}
                          onChange={(e) => updateEducation(index, 'description', e.target.value)}
                          placeholder='GPA: 3.7/4.0, Thành tích nổi bật...'
                          rows={2}
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className='bg-white rounded-2xl shadow-xl p-6 border border-gray-200'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <Award className='w-6 h-6 text-orange-600' />
                Kỹ năng
              </h2>
              <div className='space-y-4'>
                <div className='flex gap-2'>
                  <Input
                    value={cvData.newSkill}
                    onChange={(e) => setCvData(prev => ({ ...prev, newSkill: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder='Thêm kỹ năng...'
                    className='focus:ring-2 focus:ring-orange-500'
                  />
                  <Button
                    onClick={addSkill}
                    className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  >
                    <Plus className='w-4 h-4' />
                  </Button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {cvData.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className='bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 hover:from-orange-200 hover:to-red-200 px-3 py-2 text-sm flex items-center gap-2'
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(index)}
                        className='hover:text-red-600'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className='bg-white rounded-2xl shadow-xl p-6 border border-gray-200'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                  <Award className='w-6 h-6 text-orange-600' />
                  Chứng chỉ
                </h2>
                <Button
                  onClick={addCertification}
                  className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  size='sm'
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Thêm
                </Button>
              </div>
              <div className='space-y-4'>
                {cvData.certifications.map((cert, index) => (
                  <div key={index} className='p-4 border-2 border-gray-200 rounded-xl relative'>
                    <Button
                      onClick={() => removeCertification(index)}
                      variant='ghost'
                      size='sm'
                      className='absolute top-2 right-2 text-red-500 hover:text-red-700'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                      <div className='space-y-1'>
                        <Label>Tên chứng chỉ</Label>
                        <Input
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          placeholder='AWS Certified'
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Tổ chức cấp</Label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          placeholder='Amazon'
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                      <div className='space-y-1'>
                        <Label>Ngày cấp</Label>
                        <Input
                          type='month'
                          value={cert.date}
                          onChange={(e) => updateCertification(index, 'date', e.target.value)}
                          className='focus:ring-2 focus:ring-orange-500'
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - CV Preview */}
          <div className='lg:col-span-1'>
            <div className='sticky top-4'>
              <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200'>
                <div className='bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white'>
                  <h3 className='font-bold text-lg'>Xem trước CV</h3>
                  <p className='text-sm text-orange-50'>Mẫu: {CVTemplates[selectedTemplate]}</p>
                </div>

                {/* CV Preview Content */}
                <div ref={cvPreviewRef} className='p-6 bg-white' style={{ fontSize: '10px' }}>
                  {/* Simple Template */}
                  {selectedTemplate === 'simple' && (
                    <div className='space-y-4'>
                      <div className='text-center pb-3 border-b border-gray-400'>
                        <h1 className='text-2xl font-bold text-gray-900'>{cvData.fullName || 'HỌ VÀ TÊN'}</h1>
                        <div className='text-xs text-gray-600 mt-1 space-y-0.5'>
                          {cvData.email && <div>{cvData.email}</div>}
                          {cvData.phone && <div>{cvData.phone}</div>}
                          {cvData.address && <div>{cvData.address}</div>}
                        </div>
                      </div>

                      {cvData.objective && (
                        <div>
                          <h2 className='text-sm font-bold text-gray-900 mb-1'>MỤC TIÊU</h2>
                          <p className='text-xs text-gray-700'>{cvData.objective}</p>
                        </div>
                      )}

                      {cvData.experiences.some(exp => exp.title) && (
                        <div>
                          <h2 className='text-sm font-bold text-gray-900 mb-2'>KINH NGHIỆM</h2>
                          {cvData.experiences.filter(exp => exp.title).map((exp, i) => (
                            <div key={i} className='mb-2'>
                              <div className='font-bold text-xs'>{exp.title} - {exp.company}</div>
                              <div className='text-xs text-gray-600'>{exp.startDate} - {exp.current ? 'Hiện tại' : exp.endDate}</div>
                              {exp.description && <p className='text-xs mt-0.5'>{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {cvData.education.some(edu => edu.degree) && (
                        <div>
                          <h2 className='text-sm font-bold text-gray-900 mb-2'>HỌC VẤN</h2>
                          {cvData.education.filter(edu => edu.degree).map((edu, i) => (
                            <div key={i} className='mb-2'>
                              <div className='font-bold text-xs'>{edu.degree}</div>
                              <div className='text-xs text-gray-600'>{edu.school}</div>
                              <div className='text-xs text-gray-600'>{edu.startDate} - {edu.endDate}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {cvData.skills.length > 0 && (
                        <div>
                          <h2 className='text-sm font-bold text-gray-900 mb-1'>KỸ NĂNG</h2>
                          <p className='text-xs'>{cvData.skills.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Professional Template */}
                  {selectedTemplate === 'professional' && (
                    <div className='space-y-4'>
                      {/* Header */}
                      <div className='text-center border-b-2 border-orange-500 pb-4'>
                        <h1 className='text-2xl font-bold text-gray-900 uppercase'>{cvData.fullName || 'HỌ VÀ TÊN'}</h1>
                        <div className='flex flex-wrap justify-center gap-2 mt-2 text-xs text-gray-600'>
                          {cvData.phone && <span className='flex items-center gap-1'><Phone className='w-3 h-3' />{cvData.phone}</span>}
                          {cvData.email && <span className='flex items-center gap-1'><Mail className='w-3 h-3' />{cvData.email}</span>}
                          {cvData.address && <span className='flex items-center gap-1'><MapPin className='w-3 h-3' />{cvData.address}</span>}
                        </div>
                      </div>

                      {/* Objective */}
                      {cvData.objective && (
                        <div>
                          <h2 className='text-sm font-bold text-orange-600 uppercase mb-1 border-b border-gray-300'>Mục tiêu nghề nghiệp</h2>
                          <p className='text-xs text-gray-700 leading-relaxed'>{cvData.objective}</p>
                        </div>
                      )}

                      {/* Experience */}
                      {cvData.experiences.some(exp => exp.title) && (
                        <div>
                          <h2 className='text-sm font-bold text-orange-600 uppercase mb-2 border-b border-gray-300'>Kinh nghiệm làm việc</h2>
                          {cvData.experiences.filter(exp => exp.title).map((exp, i) => (
                            <div key={i} className='mb-3'>
                              <div className='flex justify-between items-start'>
                                <div>
                                  <h3 className='text-xs font-bold text-gray-900'>{exp.title}</h3>
                                  <p className='text-xs text-gray-600'>{exp.company}</p>
                                </div>
                                <span className='text-xs text-gray-500'>{exp.startDate} - {exp.current ? 'Hiện tại' : exp.endDate}</span>
                              </div>
                              {exp.description && <p className='text-xs text-gray-700 mt-1 leading-relaxed'>{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Education */}
                      {cvData.education.some(edu => edu.degree) && (
                        <div>
                          <h2 className='text-sm font-bold text-orange-600 uppercase mb-2 border-b border-gray-300'>Học vấn</h2>
                          {cvData.education.filter(edu => edu.degree).map((edu, i) => (
                            <div key={i} className='mb-2'>
                              <div className='flex justify-between items-start'>
                                <div>
                                  <h3 className='text-xs font-bold text-gray-900'>{edu.degree}</h3>
                                  <p className='text-xs text-gray-600'>{edu.school}</p>
                                </div>
                                <span className='text-xs text-gray-500'>{edu.startDate} - {edu.endDate}</span>
                              </div>
                              {edu.description && <p className='text-xs text-gray-700 mt-1'>{edu.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skills */}
                      {cvData.skills.length > 0 && (
                        <div>
                          <h2 className='text-sm font-bold text-orange-600 uppercase mb-2 border-b border-gray-300'>Kỹ năng</h2>
                          <div className='flex flex-wrap gap-1'>
                            {cvData.skills.map((skill, i) => (
                              <span key={i} className='text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded'>{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {cvData.certifications.some(cert => cert.name) && (
                        <div>
                          <h2 className='text-sm font-bold text-orange-600 uppercase mb-2 border-b border-gray-300'>Chứng chỉ</h2>
                          {cvData.certifications.filter(cert => cert.name).map((cert, i) => (
                            <div key={i} className='mb-2'>
                              <h3 className='text-xs font-bold text-gray-900'>{cert.name}</h3>
                              <p className='text-xs text-gray-600'>{cert.issuer} • {cert.date}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Creative Template */}
                  {selectedTemplate === 'creative' && (
                    <div className='bg-gradient-to-br from-purple-50 to-pink-50 -m-6 p-6 space-y-4'>
                      <div className='flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg'>
                        <div className='w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0'>
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className='w-full h-full object-cover' />
                          ) : (
                            <User className='w-10 h-10 text-white' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h1 className='text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent break-words'>
                            {cvData.fullName || 'HỌ VÀ TÊN'}
                          </h1>
                          <p className='text-sm text-purple-600 font-semibold'>
                            {cvData.experiences[0]?.title || 'Chức danh'}
                          </p>
                        </div>
                      </div>

                      <div className='bg-white p-5 rounded-2xl shadow space-y-4'>
                        <div className='flex flex-wrap gap-3 text-xs'>
                          {cvData.phone && (
                            <div className='flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-full'>
                              <Phone className='w-3 h-3 text-purple-600' />
                              <span>{cvData.phone}</span>
                            </div>
                          )}
                          {cvData.email && (
                            <div className='flex items-center gap-1 bg-pink-50 px-3 py-1.5 rounded-full'>
                              <Mail className='w-3 h-3 text-pink-600' />
                              <span className='break-all'>{cvData.email}</span>
                            </div>
                          )}
                          {cvData.address && (
                            <div className='flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-full'>
                              <MapPin className='w-3 h-3 text-purple-600' />
                              <span>{cvData.address}</span>
                            </div>
                          )}
                        </div>

                        {cvData.objective && (
                          <div>
                            <h2 className='text-sm font-bold text-purple-700 mb-2 flex items-center gap-2'>
                              <span className='text-lg'>💡</span> Giới thiệu
                            </h2>
                            <p className='text-xs leading-relaxed text-gray-700'>{cvData.objective}</p>
                          </div>
                        )}

                        {cvData.experiences.some(exp => exp.title) && (
                          <div>
                            <h2 className='text-sm font-bold text-pink-700 mb-3 flex items-center gap-2'>
                              <span className='text-lg'>💼</span> Kinh nghiệm
                            </h2>
                            {cvData.experiences.filter(exp => exp.title).map((exp, i) => (
                              <div key={i} className='mb-3 pl-4 border-l-3 border-purple-300 bg-gradient-to-r from-purple-50 to-transparent p-2 rounded-r'>
                                <h3 className='text-xs font-bold text-gray-900'>{exp.title}</h3>
                                <p className='text-xs text-purple-600 font-semibold'>{exp.company}</p>
                                <p className='text-xs text-pink-600'>{exp.startDate} - {exp.current ? 'Hiện tại' : exp.endDate}</p>
                                {exp.description && (
                                  <p className='text-xs text-gray-700 mt-1 leading-relaxed'>{exp.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {cvData.education.some(edu => edu.degree) && (
                          <div>
                            <h2 className='text-sm font-bold text-purple-700 mb-3 flex items-center gap-2'>
                              <span className='text-lg'>🎓</span> Học vấn
                            </h2>
                            {cvData.education.filter(edu => edu.degree).map((edu, i) => (
                              <div key={i} className='mb-2 pl-4 border-l-3 border-pink-300'>
                                <h3 className='text-xs font-bold text-gray-900'>{edu.degree}</h3>
                                <p className='text-xs text-purple-600'>{edu.school}</p>
                                <p className='text-xs text-gray-500'>{edu.startDate} - {edu.endDate}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {cvData.skills.length > 0 && (
                          <div>
                            <h2 className='text-sm font-bold text-purple-700 mb-2 flex items-center gap-2'>
                              <span className='text-lg'>🎯</span> Kỹ năng
                            </h2>
                            <div className='flex flex-wrap gap-2'>
                              {cvData.skills.map((skill, i) => (
                                <span key={i} className='text-xs bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800 px-3 py-1.5 rounded-full font-medium'>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateCV;
