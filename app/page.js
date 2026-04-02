import PopularClassSection from '@/components/CourseSection';
import HeroSection from '@/components/Hero';
import MeetTheHeroesSection from '@/components/MeetTheHeroesSection';
import RecentBlogsSection from '@/components/RecentBlogsSection';
import ServiceSection from '@/components/ServiceSection';
import TestimonialSection from '@/components/TestimonialSection';
import React from 'react';

const API_SERVER = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8006';

const Page = async () => {

  // ===== SERVER-SIDE DATA FETCH =====
  let initialCourses = [];
  let initialTutors = [];
  let initialPosts = [];

  try {
    const coursesRes = await fetch(`${API_SERVER}/api/courses`, { cache: 'no-store' });
    if (coursesRes.ok) {
      const data = await coursesRes.json();
      initialCourses = Array.isArray(data) ? data : (data.courses || []);
      console.log(`✅ SSR: ${initialCourses.length}টি কোর্স fetch হয়েছে`);
    }
  } catch (err) {
    console.error('❌ SSR courses fetch error:', err.message);
  }

  try {
    const tutorsRes = await fetch(`${API_SERVER}/api/teachers`, { cache: 'no-store' });
    if (tutorsRes.ok) {
      const data = await tutorsRes.json();
      initialTutors = Array.isArray(data) ? data.slice(0, 4) : [];
      console.log(`✅ SSR: ${initialTutors.length}টি tutor fetch হয়েছে`);
    }
  } catch (err) {
    console.error('❌ SSR tutors fetch error:', err.message);
  }

  try {
    const postsRes = await fetch(`${API_SERVER}/api/post?limit=3&status=PUBLISHED`, { cache: 'no-store' });
    if (postsRes.ok) {
      const data = await postsRes.json();
      const list = data?.posts ?? data?.content ?? data?.data ?? (Array.isArray(data) ? data : []);
      initialPosts = Array.isArray(list) ? list : [];
      console.log(`✅ SSR: ${initialPosts.length}টি post fetch হয়েছে`);
    }
  } catch (err) {
    console.error('❌ SSR posts fetch error:', err.message);
  }
  // ===== SERVER-SIDE DATA FETCH শেষ =====

  return (
   <div className="min-h-screen bg-gray-50">
      <HeroSection/>
      <ServiceSection/>
      <PopularClassSection initialCourses={initialCourses}/>
      <MeetTheHeroesSection initialTutors={initialTutors}/>
      <TestimonialSection/>
      <RecentBlogsSection initialPosts={initialPosts}/>
    </div>
  );
};

export default Page;