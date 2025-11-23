
import React from 'react';

// এটি একটি প্লে আইকনের জন্য, আপনি একটি SVG বা অন্য কোনো আইকন লাইব্রেরি ব্যবহার করতে পারেন
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-12 h-12 text-white opacity-90 group-hover:opacity-100 transition-opacity duration-300"
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.5 1.5 0 0 1 0 1.966l-6.25 3.5A1.5 1.5 0 0 1 7.5 15.197V8.803a1.5 1.5 0 0 1 2.274-1.293l6.25 3.5Z"
      clipRule="evenodd"
    />
  </svg>
);

const MentorsTestimonials = () => {
  // প্রতিটি ভিডিওর জন্য ডেটা। আপনি YouTube ভিডিও ID এবং অন্যান্য তথ্য এখানে দিতে পারেন।
  const videos = [
    {
      id: "dQw4w9WgXcQ", // YouTube ভিডিও ID
      title: "আমি চাই এটি একটা ডিমান্ডিং হোক",
      mentor: "প্রোগ্রামিং নিয়ে রিভিউ | সাইফুল",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", // YouTube থাম্বনেইল
    },
    {
      id: "anotherVideoId1",
      title: "সময় সময় যখন ভিডিও কোম্পানি হারাতো চায়",
      mentor: "প্রোগ্রামিং নিয়ে রিভিউ | সুজন",
      thumbnail: "https://img.youtube.com/vi/anotherVideoId1/hqdefault.jpg",
    },
    {
      id: "anotherVideoId2",
      title: "প্রোগ্রামিং যা এরকম টেম্প",
      mentor: "প্রোগ্রামিং নিয়ে রিভিউ | নূরল মুত্তাকীম",
      thumbnail: "https://img.youtube.com/vi/anotherVideoId2/hqdefault.jpg",
    },
    {
      id: "anotherVideoId3",
      title: "আমি বলবো যে এড-টেক ইন্ডাস্ট্রিতে",
      mentor: "প্রোগ্রামিং নিয়ে রিভিউ | আল-আমিন মুন্না",
      thumbnail: "https://img.youtube.com/vi/anotherVideoId3/hqdefault.jpg",
    },
    {
      id: "anotherVideoId4",
      title: "আমাদের দেশের স্টুডেন্টরা কেমন?",
      mentor: "প্রোগ্রামিং নিয়ে রিভিউ | রেদোয়ান রিমন",
      thumbnail: "https://img.youtube.com/vi/anotherVideoId4/hqdefault.jpg",
    },
    {
      id: "anotherVideoId5",
      title: "এর রকম কমিউনিটি আমাদের বাংলাদেশে দরকার",
      mentor: "প্রোগ্রামিং নিয়ে রিভিউ | শেখ সাঈদ",
      thumbnail: "https://img.youtube.com/vi/anotherVideoId5/hqdefault.jpg",
    },
    {
      id: "anotherVideoId6",
      title: "আমি সিম্পলেস কমিউনিকেশন কে মেসেজ",
      mentor: "প্রোগ্রামিং নিয়ে রিভিউ | আবু বকর রহমান",
      thumbnail: "https://img.youtube.com/vi/anotherVideoId6/hqdefault.jpg",
    },
    {
      id: "anotherVideoId7",
      title: "প্রস্তাবনা রিচার্জ বিজনেসের সাথে কাজ করে বুঝানো",
      mentor: "প্রোগ্রামিং নিয়ে রিভিউ | মোস্তফা রাজা",
      thumbnail: "https://img.youtube.com/vi/anotherVideoId7/hqdefault.jpg",
    },
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* হেডার সেকশন */}
        <div className="text-center lg:text-left mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            মেন্টরদের মন্তব্য
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            প্রজেক্টের সাথে কাজ করা মেন্টরদের অভিজ্ঞতা জানুন।
          </p>
        </div>

        {/* ভিডিও গ্রিড */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <div key={index} className="relative bg-white rounded-lg shadow-md overflow-hidden group">
              {/* YouTube Embed Player */}
              <div className="aspect-w-16 aspect-h-9 w-full">
                <iframe
                  className="w-full h-full object-cover"
                  src={`https://www.youtube.com/embed/${video.id}?controls=0&modestbranding=1&rel=0`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* থাম্বনেইল এবং প্লে বাটন ওভারলে (যদি আপনি iframe এর পরিবর্তে ক্লিক করে ভিডিও লোড করতে চান)
                  বর্তমানে, iframe সরাসরি লোড হচ্ছে। আপনি যদি ক্লিক করে লোড করতে চান, তাহলে নিচের অংশটি ব্যবহার করতে পারেন এবং iframe কে কন্ডিশনালি রেন্ডার করতে পারেন।
              */}
              {/* <div
                className="relative w-full aspect-video bg-gray-200 flex items-center justify-center cursor-pointer"
                onClick={() => alert(`Playing video: ${video.title}`)} // এখানে ভিডিও প্লে করার লজিক যুক্ত হবে
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <PlayIcon />
                </div>
              </div> */}

              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">{video.mentor}</p>
                <h3 className="text-base font-semibold text-gray-800">{video.title}</h3>
                {/* সাবস্ক্রাইব বাটন এবং শেয়ার আইকন */}
                <div className="flex items-center justify-between mt-2">
                  <button className="flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    Subscribe
                  </button>
                  <a href="#" className="text-gray-400 hover:text-gray-600">
                    {/* Share Icon - আপনি lucide-react থেকে 'Share2' আইকন ব্যবহার করতে পারেন */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorsTestimonials;