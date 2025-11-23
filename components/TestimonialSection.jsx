"use client";

import { Star } from 'lucide-react';

export default function TestimonialSection() {
  const reviews = [
    {
      initial: 'C',
      name: 'Cédric',
      title: 'Agency Owner',
      rating: 5,
      text: 'Finally found a tool that actually works. My clients are getting 10x more engagement since I started using Faceless Clip for their content.',
      bgColor: 'bg-teal-500', // পরিবর্তিত
    },
    {
      initial: 'A',
      name: 'Ange',
      title: 'Content Creator',
      rating: 5,
      text: 'I went from spending 8 hours editing one video to creating 20 videos in the same time. This is revolutionary for content creators!',
      bgColor: 'bg-indigo-500', // পরিবর্তিত
    },
    {
      initial: 'K',
      name: 'Karim',
      title: 'Street Interviewer',
      rating: 5,
      text: 'Perfect for my street interviews. The AI automatically creates engaging short clips from my long-form content. My TikTok is exploding!',
      bgColor: 'bg-purple-500', // পরিবর্তিত
    },
    {
      initial: 'C',
      name: 'Coraline',
      title: 'eCommerce Brand Owner',
      rating: 5,
      text: 'Our product videos get 5x more views now. The AI creates perfect product showcases without showing my face. Sales have doubled!',
      bgColor: 'bg-pink-500', // পরিবর্তিত
    },
    {
      initial: 'S',
      name: 'Sacha',
      title: 'Video Editing Agency Owner',
      rating: 5,
      text: 'I was worried this would replace my business, but it actually helps me serve more clients faster. Quality is incredible!',
      bgColor: 'bg-orange-500', // পরিবর্তিত
    },
  ];

  // রিভিউগুলো ডুপ্লিকেট করা হয়েছে
  const scrollingReviews = [...reviews, ...reviews, ...reviews, ...reviews];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        // --- পরিবর্তন: স্টার কালার ---
        className={`w-4 h-4 text-[#f97316] ${i < rating ? 'fill-current' : ''} mr-1`} 
      />
    ));
  };

  // অ্যানিমেশন স্টাইল (অপরিবর্তিত)
  const animationStyle = `
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(-21.5rem * 5)); } /* (width + gap) * number of original reviews */
    }
    @keyframes scroll-reverse {
      0% { transform: translateX(calc(-21.5rem * 5)); }
      100% { transform: translateX(0); }
    }
    .animate-scroll {
      animation: scroll 40s linear infinite;
    }
    .animate-scroll-reverse {
      animation: scroll-reverse 40s linear infinite;
    }
  `;

  return (
    <>
      <style>{animationStyle}</style>
      {/* --- পরিবর্তন: সেকশন ব্যাকগ্রাউন্ড --- */}
      <section id="reviews" className="py-20 bg-gradient-to-br from-orange-100 to-orange-200 text-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Trusted by creators worldwide</h2>
            {/* --- পরিবর্তন: সাব-হেডলাইন টেক্সট কালার --- */}
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Hear what Learner love about Micro Skills and how it has transformed their learning experience.
            </p>
          </div>

          <div className="relative space-y-6">
            {/* Row 1: হাইলাইটেড কার্ড (কমলা গ্র্যাডিয়েন্ট) */}
            <div className="flex gap-6 animate-scroll">
              {scrollingReviews.map((review, index) => (
                <div 
                  key={`r1-${index}`} 
                  // --- পরিবর্তন: কার্ড স্টাইল ---
                  className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-400/30"
                >
                  <div className="flex items-start mb-4">
                    <div className={`flex-shrink-0 w-12 h-12 ${review.bgColor} rounded-full flex items-center justify-center mr-3`}>
                      {/* --- পরিবর্তন: টেক্সট কালAR --- */}
                      <span className="text-lg font-bold text-white">{review.initial}</span>
                    </div>
                    <div>
                      {/* --- পরিবর্তন: টেক্সট কালার --- */}
                      <h4 className="font-bold text-gray-900">{review.name}</h4>
                      <p className="text-gray-500 text-sm">{review.title}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {renderStars(review.rating)}
                  </div>
                  {/* --- পরিবর্তন: টেক্সট কালার --- */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Row 2: স্ট্যান্ডার্ড কার্ড (সাদা) */}
            <div className="flex gap-6 animate-scroll-reverse">
              {scrollingReviews.map((review, index) => (
                <div 
                  key={`r2-${index}`} 
                  // --- পরিবর্তন: কার্ড স্টাইল ---
                  className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-400/30"
                >
                  <div className="flex items-start mb-4">
                    <div className={`flex-shrink-0 w-12 h-12 ${review.bgColor} rounded-full flex items-center justify-center mr-3`}>
                      {/* --- পরিবর্তন: টেক্সট কালAR --- */}
                      <span className="text-lg font-bold text-white">{review.initial}</span>
                    </div>
                    <div>
                      {/* --- পরিবর্তন: টেক্সট কালার --- */}
                      <h4 className="font-bold text-gray-900">{review.name}</h4>
                      <p className="text-gray-500 text-sm">{review.title}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {renderStars(review.rating)}
                  </div>
                  {/* --- পরিবর্তন: টেক্সট কালার --- */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}