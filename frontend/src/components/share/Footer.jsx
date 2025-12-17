import React from 'react'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react'

const Footer = () => {
    return (
        <footer className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300'>
            <div className='container mx-auto px-8 py-12'>
                {/* Main Footer Content */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
                    {/* Company Info */}
                    <div>
                        <h2 className='text-3xl font-bold mb-4'>
                            <span className='text-white'>Job</span>
                            <span className='bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>Portal</span>
                        </h2>
                        <p className='text-gray-400 mb-4 leading-relaxed'>
                            Nền tảng tuyển dụng hàng đầu Việt Nam, kết nối hàng nghìn nhà tuyển dụng và ứng viên.
                        </p>
                        <div className='flex gap-3'>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className='w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110'
                            >
                                <Facebook className='w-5 h-5' />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className='w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110'
                            >
                                <Twitter className='w-5 h-5' />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className='w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110'
                            >
                                <Linkedin className='w-5 h-5' />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className='w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110'
                            >
                                <Instagram className='w-5 h-5' />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className='text-white font-bold text-lg mb-4'>Liên kết nhanh</h3>
                        <ul className='space-y-2'>
                            <li>
                                <a href="/jobs" className='hover:text-orange-500 transition-colors duration-300 flex items-center gap-2'>
                                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                                    Tìm việc làm
                                </a>
                            </li>
                            <li>
                                <a href="/brower" className='hover:text-orange-500 transition-colors duration-300 flex items-center gap-2'>
                                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                                    Duyệt công việc
                                </a>
                            </li>
                            <li>
                                <a href="/profile" className='hover:text-orange-500 transition-colors duration-300 flex items-center gap-2'>
                                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                                    Hồ sơ của tôi
                                </a>
                            </li>
                            <li>
                                <a href="/" className='hover:text-orange-500 transition-colors duration-300 flex items-center gap-2'>
                                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                                    Về chúng tôi
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* For Employers */}
                    <div>
                        <h3 className='text-white font-bold text-lg mb-4'>Dành cho nhà tuyển dụng</h3>
                        <ul className='space-y-2'>
                            <li>
                                <a href="/admin/companies" className='hover:text-orange-500 transition-colors duration-300 flex items-center gap-2'>
                                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                                    Đăng tin tuyển dụng
                                </a>
                            </li>
                            <li>
                                <a href="/admin/jobs" className='hover:text-orange-500 transition-colors duration-300 flex items-center gap-2'>
                                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                                    Quản lý tuyển dụng
                                </a>
                            </li>
                            <li>
                                <a href="/" className='hover:text-orange-500 transition-colors duration-300 flex items-center gap-2'>
                                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                                    Giải pháp tuyển dụng
                                </a>
                            </li>
                            <li>
                                <a href="/" className='hover:text-orange-500 transition-colors duration-300 flex items-center gap-2'>
                                    <span className='w-1 h-1 bg-orange-500 rounded-full'></span>
                                    Bảng giá dịch vụ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className='text-white font-bold text-lg mb-4'>Liên hệ</h3>
                        <ul className='space-y-3'>
                            <li className='flex items-start gap-3'>
                                <MapPin className='w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5' />
                                <span className='text-sm'>123 Đường ABC, Quận XYZ, TP. Hà Nội</span>
                            </li>
                            <li className='flex items-center gap-3'>
                                <Phone className='w-5 h-5 text-orange-500 flex-shrink-0' />
                                <a href="tel:+84123456789" className='text-sm hover:text-orange-500 transition-colors'>
                                    +84 123 456 789
                                </a>
                            </li>
                            <li className='flex items-center gap-3'>
                                <Mail className='w-5 h-5 text-orange-500 flex-shrink-0' />
                                <a href="mailto:contact@jobportal.vn" className='text-sm hover:text-orange-500 transition-colors'>
                                    contact@jobportal.vn
                                </a>
                            </li>
                        </ul>

                        {/* Newsletter */}
                        <div className='mt-6'>
                            <p className='text-sm text-gray-400 mb-2'>Đăng ký nhận thông báo việc làm</p>
                            <div className='flex gap-2'>
                                <input
                                    type="email"
                                    placeholder="Email của bạn"
                                    className='flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-orange-500 transition-colors'
                                />
                                <button className='px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105'>
                                    <Mail className='w-4 h-4' />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className='border-t border-gray-800 pt-8'>
                    <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
                        <p className='text-sm text-gray-400'>
                            © 2025 <span className='text-orange-500 font-semibold'>JobPortal</span>. All rights reserved.
                        </p>
                        <div className='flex gap-6 text-sm'>
                            <a href="/" className='hover:text-orange-500 transition-colors'>Chính sách bảo mật</a>
                            <span className='text-gray-700'>|</span>
                            <a href="/" className='hover:text-orange-500 transition-colors'>Điều khoản sử dụng</a>
                            <span className='text-gray-700'>|</span>
                            <a href="/" className='hover:text-orange-500 transition-colors'>Câu hỏi thường gặp</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer