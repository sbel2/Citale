"use client";

import Link from "next/link";
import Image from "next/legacy/image";
import SearchBar from '@/components/SearchBar';
import FilterButton from '@/components/Filter';
import { useAuth } from 'app/context/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header({ font }: { font?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const prevPathnameRef = useRef<string | null>(null);
  const [fromSearch, setFromSearch] = useState(false);
  const [fromFollowPost, setFromFollowPost] = useState(false);
  const { user, logout } = useAuth();
  const [activeButton, setActiveButton] = useState<string>('explore');
  const [fromProfile, setFromProfile] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check if the previous pathname was "/search-results"
    if (prevPathnameRef.current === '/search-results' && pathname.startsWith('/post')) {
      setFromSearch(true);
    } else {
      setFromSearch(false);
    }

    // Check if the previous pathname was "/account/profile/"
    if (prevPathnameRef.current?.startsWith('/account/profile/')) {
      setFromProfile(true);
    } else {
      setFromProfile(false);
    }

    // Check if the previous pathname was "/following-post"
    if (prevPathnameRef.current?.startsWith('/following-post')) {
      setFromFollowPost(true);
    } else {
      setFromFollowPost(false);
    }

    // Update the ref with the current pathname
    prevPathnameRef.current = pathname;
  }, [pathname]);


  const searchRoute = async (searchQuery: string) => {
    setShowMobileSearch(false);
    router.push(`/search-results?query=${encodeURIComponent(searchQuery)}`);
  };

  const filterRoute = async (option: string, location: string, price: string ) => {
    router.push(`/filter-results?option=${encodeURIComponent(option)}&location=${encodeURIComponent(location)}&price=${encodeURIComponent(price)}`);
  };


  const handleButtonClick = (buttonName: string, route: string) => {
    setActiveButton(buttonName);
    router.push(route);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    setIsMenuOpen(false);
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setShowMobileSearch(false);
  };
  
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <header className={`py-1 md:py-3 pt-4 md:pt-6 bg-gray-0 ${font}`}>

      {/* Desktop Header */}
      <div className="max-w-[100rem] px-3 md:px-6 mx-auto hidden md:flex items-center">
        <div className="flex-grow flex justify-center">
          <div className="w-full max-w-sm p-1 sm:p-2">
            <SearchBar onSearch={searchRoute}/>
          </div>
        </div>
      </div>

      <div className="relative max-w-[100rem] px-3 md:px-6 mx-auto md:hidden">
      {/* Header Row - Always visible */}
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Home" className="pt-1.5">
          <Image
            src="/citale_header.svg"
            alt="Citale Logo"
            width={105}
            height={35}
            priority
          />
        </Link>
        
        <div className="flex items-center space-x-4">
          {!showMobileSearch && (
            <>
              <button onClick={toggleMobileSearch} className="p-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24"
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button onClick={toggleMenu} className="p-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24"
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar - Overlays header when active */}
      {showMobileSearch && (
        <div className="absolute inset-0 bg-white flex items-center px-3 z-10">
          <SearchBar 
            onSearch={searchRoute}
          />
          <button 
            onClick={() => setShowMobileSearch(false)}
            className="text-gray-500 p-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Mobile Menu - Overlays content */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 left-0 bg-white shadow-lg rounded-lg mx-3 z-30 mt-1">
          {user ? (
            <button 
              onClick={handleLogout}
              className="block w-full text-left p-4 hover:bg-gray-100 text-red-600"
            >
              Log out
            </button>
          ) : (
            <Link 
              href="/log-in" 
              className="block p-4 hover:bg-gray-100 text-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Log in
            </Link>
          )}
          <Link
            href="https://forms.gle/kfWJA5HCBMne8dND7"
            className="block p-4 hover:bg-gray-100 text-black"
            target="_blank"
            onClick={() => setIsMenuOpen(false)}
          >
            Report Content/User
          </Link>
          <Link
            href="/support"
            className="block p-4 hover:bg-gray-100 text-black"
            target="_blank"
            onClick={() => setIsMenuOpen(false)}
          >
            Customer Support
          </Link>
          <Link
            href="/privacy-policy"
            className="block p-4 hover:bg-gray-100 text-black"
            target="_blank"
            onClick={() => setIsMenuOpen(false)}
          >
            Privacy Policy
          </Link>
          <Link 
            href="/terms" 
            className="block p-4 hover:bg-gray-100 text-black" 
            target="_blank"
            onClick={() => setIsMenuOpen(false)}
          >
            Terms of Use
          </Link>
        </div>
      )}
    </div>

      {!pathname.startsWith("/search-results") &&
        !pathname.startsWith("/account/profile/") &&
        !fromSearch && user &&(
        <div className="max-w-[100rem] px-3 md:px-6 mx-auto flex items-center">
          <button
            className={`p-4 text-base md:text-lg w-full flex justify-center items-center focus:outline-none transition-all rounded-lg relative ${
              activeButton === 'explore'
                ? '' // Expand the underline
                : 'text-gray-300' // Hide the underline
            }`}
            onClick={() => handleButtonClick('explore', '/')}
          >
          Explore
          {activeButton === 'explore' && (
            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 border-t-4 border-black'></div>
          )}
          </button>
          
          <button
            className={`p-4 text-base md:text-lg w-full flex justify-center items-center focus:outline-none transition-all rounded-lg relative ${
              activeButton === 'following'
                ? '' // Expand the underline
                : 'text-gray-300' // Hide the underline
            }`}
          onClick={() => handleButtonClick('following', '/following-post')}
        >
          Following
          {activeButton === 'following' && (
            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 border-t-4 border-black'></div>
          )}
          </button>
      </div>
      )}

      
      {!pathname.startsWith("/search-results") &&
        !pathname.startsWith("/account/profile/") &&
        !pathname.startsWith("/following-post") &&
        !fromSearch &&
        !fromProfile &&
        !fromFollowPost && (
          <div className="w-full p-1">
            <FilterButton onFilter={filterRoute} />
          </div>
      )}
      
    </header>
  );
}
