import Link from 'next/link';
import CoursePageClient from './CoursePageClient';

const API_BASE_URL = 'https://api.microskill.com.bd';

export default async function CoursePage({ params }) {
    const { slug } = await params; // Next.js 15-এ params await করতে হয়

    // SSR DEBUG - পরে মুছে দিও
    console.log('🖥️ CoursePage SSR:', typeof window === 'undefined' ? 'Server ✅' : 'Client ❌');
    console.log('📍 Slug:', slug);

    let course = null;
    let relatedCourses = [];

    try {
        const response = await fetch(`${API_BASE_URL}/api/courses/${slug}`, {
            cache: 'no-store',
        });

        if (!response.ok) throw new Error('Course not found.');

        course = await response.json();
        console.log('✅ Server-এ course fetch হয়েছে:', course.title);

        // Related courses server-এই fetch করো
        const relRes = await fetch(`${API_BASE_URL}/api/courses`, { cache: 'no-store' });
        if (relRes.ok) {
            const allCourses = await relRes.json();
            relatedCourses = allCourses.filter(c =>
                (c.category === course.category || c.instructorId === course.instructorId) && c.id !== course.id
            ).slice(0, 3);
        }
    } catch (err) {
        console.error('❌ Server fetch error:', err.message);
        return (
            <div className="flex flex-col justify-center items-center h-screen text-center px-4">
                <p className="text-red-600 text-xl mb-4">{err.message}</p>
                <Link href="/courses" className="text-blue-600 hover:underline">কোর্সের পেজে ফিরে যান</Link>
            </div>
        );
    }

    // ✅ Server-fetched data → Client Component-এ prop হিসেবে পাঠাও
    return <CoursePageClient course={course} relatedCourses={relatedCourses} slug={slug} />;
}
