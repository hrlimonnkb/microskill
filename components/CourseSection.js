"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Star, MoveRight, BookOpen } from 'lucide-react';

// Swiper-এর কম্পোনেন্ট এবং মডিউল Import করুন
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// Swiper-এর CSS Import করুন
import 'swiper/css';
import 'swiper/css/pagination';

// API Base URL
const API_BASE_URL = 'https://api.microskill.com.bd' || 'http://localhost:5000';

/**
 * Helper function to get full image URL
 */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/assets/placeholder.png";
  
  // যদি already absolute URL হয় (http:// বা https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // যদি leading slash থাকে
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // যদি relative path হয় (uploads/...)
  return `${API_BASE_URL}/${imagePath}`;
};

/**
 * Format duration to Bangla
 */
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  
  const mins = parseInt(minutes);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')} ঘন্টা ${remainingMins.toString().padStart(2, '0')} মিনিট`;
  }
  return `${remainingMins} মিনিট`;
};

/**
 * Get category name in Bangla
 */
const getCategoryName = (category) => {
  const categoryMap = {
    'web-development': 'ওয়েব ডেভেলপমেন্ট',
    'design': 'ডিজাইন',
    'programming': 'প্রোগ্রামিং',
    'marketing': 'মার্কেটিং',
    'business': 'ব্যবসা',
  };
  
  return categoryMap[category] || category;
};

/**
 * Reusable Course Card Component
 */
const PopularClassCard = ({ course }) => {
  const thumbnailUrl = getImageUrl(course.thumbnail);
  const instructorAvatarUrl = getImageUrl(course.instructor?.profilePhoto);
  const formattedDuration = formatDuration(course.duration);
  const categoryName = getCategoryName(course.category);
  const enrollmentCount = course._count?.enrollments || 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl h-full flex flex-col group">
      {/* ১. ছবি ও সময় */}
      <div className="relative">
        <Image
          src={thumbnailUrl}
          alt={course.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
          unoptimized
        />
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>{formattedDuration}</span>
        </div>
        
        {/* Free Badge */}
        {course.isFree && (
          <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            ফ্রি
          </div>
        )}
      </div>
      
      {/* ২. কার্ডের কনটেন্ট */}
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-[#f97316] font-medium text-sm">{categoryName}</p>
        
        <Link href={`/course/${course.slug}`} className="block mt-1">
          <h3 className="text-xl font-bold text-gray-900 flex justify-between items-center transition-colors duration-300 group-hover:text-[#f97316]">
            {course.title}
            <MoveRight className="w-5 h-5 text-gray-400 transition-colors duration-300 group-hover:text-[#f97316]" />
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mt-2 flex-grow line-clamp-2">
          {course.description || 'কোর্স বিবরণ নেই'}
        </p>
        
        {/* ৩. Lessons Count & Language */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {course.numberOfLessons} টি লেসন
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {course.language}
          </div>
        </div>
        
        <hr className="my-4 border-gray-100" />
        
        {/* ৪. প্রশিক্ষক ও মূল্য */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src={instructorAvatarUrl}
              alt={course.instructor?.fullName || "Instructor"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
              unoptimized
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {course.instructor?.fullName || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                {enrollmentCount.toLocaleString()} জন ভর্তি হয়েছে
              </p>
            </div>
          </div>
          
          {/* Price */}
          {course.isFree ? (
            <p className="text-2xl font-bold text-green-600">ফ্রি</p>
          ) : (
            <p className="text-2xl font-bold text-[#f97316]">
              ৳{course.price?.toLocaleString() || 0}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * The Main Popular Class Section Component
 */
const PopularClassSection = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // আপনার actual API endpoint
        const response = await fetch(`${API_BASE_URL}/api/courses`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        
        // যদি data array হয়, তাহলে সরাসরি use করুন
        // যদি data.courses থাকে, তাহলে সেটা use করুন
        setCoursesData(Array.isArray(data) ? data : (data.courses || []));
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching popular courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCourses();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Headings */}
        <p className="text-center text-[#f97316] font-semibold">
          কোর্স প্রোগ্রামসমূহ দেখুন
        </p>
        <h2 className="text-center text-3xl md:text-4xl font-bold text-gray-900 mt-2">
          আমাদের সবচেয়ে জনপ্রিয় ক্লাসসমূহ
        </h2>
        <p className="text-center text-base text-gray-600 mt-4 mb-12 max-w-lg mx-auto">
          আমাদের জনপ্রিয় কোর্সে যুক্ত হোন — শিখুন এমন দক্ষতা যা আপনার ভবিষ্যতে কাজে লাগবে।
        </p>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316]"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">কোর্স লোড করতে সমস্যা হয়েছে: {error}</p>
          </div>
        )}
        
        {/* Swiper Slider */}
        {!loading && !error && coursesData.length > 0 && (
          <>
            <Swiper
              modules={[Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{
                el: '.swiper-pagination-popular-class',
                clickable: true,
              }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 30 },
              }}
              className="pb-20"
            >
              {coursesData.map((course) => (
                <SwiperSlide key={course.id} style={{ height: 'auto' }}>
                  <PopularClassCard course={course} />
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Pagination Dots */}
            <div className="swiper-pagination-popular-class flex justify-center items-center gap-2"></div>
          </>
        )}
        
        {/* Empty State */}
        {!loading && !error && coursesData.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">কোনো কোর্স পাওয়া যায়নি।</p>
          </div>
        )}
        
        {/* "Explore All" Button */}
        {!loading && coursesData.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              href="/courses" 
              className="inline-block px-7 py-3 border border-gray-300 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              সব কোর্স দেখুন
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};

export default PopularClassSection;