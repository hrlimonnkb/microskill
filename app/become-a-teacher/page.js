import CourseCategorySection from '@/components/teacher/CourseCategorySection';
import FaqSection from '@/components/teacher/FaqSection';
import HeroSection from '@/components/teacher/Hero';
import HowToJoinSection from '@/components/teacher/HowToJoinSection';
import MentorsTestimonials from '@/components/teacher/MentorsTestimonials';
import WhyJoinUsSection from '@/components/teacher/WhyJoinUsSection';
import React from 'react';

const BecomeATeacher = () => {
    return (
        <div>
            <HeroSection/>
            <WhyJoinUsSection/>
            <MentorsTestimonials/>
            <CourseCategorySection/>
            <HowToJoinSection/>
            <FaqSection/>
        </div>
    );
};

export default BecomeATeacher;