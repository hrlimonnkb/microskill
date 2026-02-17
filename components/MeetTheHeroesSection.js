"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Twitter, Linkedin } from 'lucide-react';

// API Base URL
const API_BASE_URL = 'https://api.microskill.com.bd' || 'http://localhost:8006';

/**
 * Helper function to get full image URL
 */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/assets/placeholder-avatar.png";
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  return `${API_BASE_URL}/${imagePath}`;
};

/**
 * Helper function to extract social media URLs
 */
const getSocialLinks = (socialLinksArray) => {
  const links = { twitter: '#', linkedin: '#' };
  
  if (!socialLinksArray || socialLinksArray.length === 0) return links;
  
  socialLinksArray.forEach(link => {
    const lowerLink = link.toLowerCase();
    if (lowerLink.includes('twitter.com') || lowerLink.includes('x.com')) {
      links.twitter = link;
    } else if (lowerLink.includes('linkedin.com')) {
      links.linkedin = link;
    }
  });
  
  return links;
};

/**
 * Reusable Tutor Card Component
 */
const TutorCard = ({ tutor }) => {
  const socialLinks = getSocialLinks(tutor.socialLinks);
  const profilePhotoUrl = getImageUrl(tutor.profilePhoto);
  
  return (
    <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl">
      <Image
        src={profilePhotoUrl}
        alt={tutor.fullName}
        width={96}
        height={96}
        className="w-24 h-24 rounded-full object-cover"
        unoptimized
      />
      <h3 className="text-xl font-bold text-gray-900 mt-4">
        {tutor.fullName}
      </h3>
      
      {/* Display subjects or skills as title */}
      {tutor.subjects && tutor.subjects.length > 0 && (
        <p className="text-[#f97316] font-semibold mt-1">
          {tutor.subjects.slice(0, 2).join(', ')}
        </p>
      )}
      
      {/* Short Bio */}
      <p className="text-gray-600 text-sm mt-4 flex-grow line-clamp-3">
        {tutor.shortBio || tutor.detailedBio || 'কোনো বিবরণ নেই'}
      </p>
      
      {/* Skills badges */}
      {tutor.skills && tutor.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {tutor.skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index} 
              className="text-xs bg-white px-2 py-1 rounded-full text-gray-600"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      
      {/* Social Links */}
      <div className="flex items-center gap-4 mt-4 pt-2">
        {socialLinks.twitter !== '#' && (
          <Link href={socialLinks.twitter} passHref target="_blank" rel="noopener noreferrer">
            <span className="text-gray-400 hover:text-[#f97316] transition-colors cursor-pointer">
              <Twitter className="w-5 h-5" />
            </span>
          </Link>
        )}
        {socialLinks.linkedin !== '#' && (
          <Link href={socialLinks.linkedin} passHref target="_blank" rel="noopener noreferrer">
            <span className="text-gray-400 hover:text-[#f97316] transition-colors cursor-pointer">
              <Linkedin className="w-5 h-5" />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

/**
 * The Main "Meet the Heroes" Section
 */
const MeetTheHeroesSection = () => {
  const [tutorsData, setTutorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/teachers`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch teachers');
        }
        
        const data = await response.json();
        
        // Limit to 4 teachers for the homepage
        setTutorsData(data.slice(0, 4));
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching teachers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Headings */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[#f97316] font-semibold">
            প্রশিক্ষকগণ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            আমাদের নায়কদের সঙ্গে পরিচিত হোন
          </h2>
          <p className="text-lg text-gray-600 mt-4 mb-12">
            Micro Skill-এ বিশ্বের বিভিন্ন স্থান থেকে প্রশিক্ষকরা লক্ষাধিক শিক্ষার্থীকে প্রশিক্ষণ দেন।
            আমরা জ্ঞান ও দক্ষতা ভাগাভাগি করি।
          </p>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316]"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">প্রশিক্ষক লোড করতে সমস্যা হয়েছে: {error}</p>
          </div>
        )}
        
        {/* Tutors Grid */}
        {!loading && !error && tutorsData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {tutorsData.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!loading && !error && tutorsData.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">কোনো প্রশিক্ষক পাওয়া যায়নি।</p>
          </div>
        )}
        
        {/* View All Teachers Button (optional) */}
        {!loading && tutorsData.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              href="/teachers" 
              className="inline-block px-7 py-3 border border-gray-300 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              সকল প্রশিক্ষক দেখুন
            </Link>
          </div>
        )}
        
      </div>
    </section>
  );
};

export default MeetTheHeroesSection;