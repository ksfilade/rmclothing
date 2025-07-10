'use client';

import { useState, useEffect, useRef } from 'react';
import { Quattrocento_Sans } from 'next/font/google';
import { saveEmailToFirestore } from '../services/emailService';

const quattrocentoSans = Quattrocento_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function Home() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Honeypot field
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const formLoadTime = useRef(Date.now()); // Track when form was loaded

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      // Time-based challenge - prevent submissions too quickly (likely bots)
      const timeSinceLoad = Date.now() - formLoadTime.current;
      if (timeSinceLoad < 3000) { // Less than 3 seconds
        setError('Please wait a moment before submitting.');
        return;
      }

      setIsLoading(true);
      setError('');
      
      try {
        // Get user agent for additional metadata
        const userAgent = navigator.userAgent;
        
        const result = await saveEmailToFirestore(email, honeypot, userAgent);
        
        if (result.success) {
          console.log('Email submitted:', email);
          setIsSubmitted(true);
          setEmail('');
          setHoneypot(''); // Reset honeypot
        } else {
          setError(result.error || 'Failed to save email. Please try again.');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
        console.error('Error submitting email:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`min-h-screen ${quattrocentoSans.className}`} style={{ backgroundColor: '#F4C2C2' }}>
      {/* Header */}
      <header className="p-6">
        <title>RM Clothing</title>
        <div className="flex items-center justify-center sm:justify-start sm:ml-10">
          <img src="/logo.avif" alt="Logo" className="w-[100px] h-[60px]" />
        </div>
      </header>

      {/* Full Width Image Section */}
      <section className="w-full">
        <div className="relative w-[100%] h-auto  bg-gradient-to-r from-gray-800 to-gray-600 flex items-center justify-center">
          {/* Placeholder for image - replace with actual image */}
          <img src="/banner.webp" alt="Hero Image" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Email Input Section */}
      <section className="py-16 px-6 flex justify-center items-center">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
          <h3 className="text-xl md:text-3xl text-gray-800 mb-4">
            Something Amazing is Coming!

          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed text-base">
          Our exclusive collection is launching soon. Be the first to know!
          </p>
          
          {!isSubmitted ? (
            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent page refresh
                handleSubmit(e);
              }}
              className="space-y-4 w-[350px] flex justify-center items-center flex-col"
            >
              {/* Honeypot field - hidden from real users */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  opacity: 0,
                  pointerEvents: 'none'
                }}
                tabIndex="-1"
                autoComplete="off"
                aria-hidden="true"
              />
              
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className={` sm:w-[350px] w-[250px] px-4 py-3 pr-12 rounded-lg border border-black-300 focus:outline-none focus:ring-1 focus:ring-black-300 focus:border-transparent text-black placeholder-black-400 ${quattrocentoSans.className}`}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  name="email"
                />
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-4-4m4 4l-4 4" />
                    </svg>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm mt-2 max-w-[350px] text-center">
                  {error}
                </div>
              )}
            </form>
          ) : (
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-green-600 text-xl mb-2">✓</div>
              <p className="text-gray-700 font-medium">
                Thank you! We'll notify you when we launch.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Social Media Links Section */}
      <section className="pb-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <p className=" mb-6 italic font-bold text-3xl text-black">Follow us!</p>
          <div className="flex justify-center md:space-x-4 flex-col md:flex-row items-center">
            <a
              href="https://www.facebook.com/rmclothing2017"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:w-[350px] w-[250px] py-3 border border-black bg-transparent text-black hover:border-2 hover:border-black transition-all duration-200 rounded-lg font-medium"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/rm__clothing"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:w-[350px] w-[250px] mt-4 md:mt-0  py-3 border border-black bg-transparent text-black hover:border-2 hover:border-black transition-all duration-200 rounded-lg font-medium"
            >
              Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
