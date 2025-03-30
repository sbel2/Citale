"use client";

import Link from "next/link";
import Image from "next/legacy/image";
import SearchBar from '@/components/SearchBar';
import FilterButton from '@/components/Filter';
import { useAuth } from 'app/context/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
// import { FaHome, FaUserFriends } from 'react-icons/fa';

export default function Header({ font }: { font?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const prevPathnameRef = useRef<string | null>(null);
  const [fromSearch, setFromSearch] = useState(false);
  const [fromFollowPost, setFromFollowPost] = useState(false);
  const { user, logout } = useAuth();
  const [activeButton, setActiveButton] = useState<string>('explore');
  const [fromProfile, setFromProfile] = useState(false);

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
    router.push(`/search-results?query=${encodeURIComponent(searchQuery)}`);
  };

  const filterRoute = async (option: string, location: string, price: string ) => {
    router.push(`/filter-results?option=${encodeURIComponent(option)}&location=${encodeURIComponent(location)}&price=${encodeURIComponent(price)}`);
  };


  const handleButtonClick = (buttonName: string, route: string) => {
    setActiveButton(buttonName);
    router.push(route);
  };

  return (
    <header className={`py-1 md:py-3 pt-4 md:pt-6 bg-gray-0 ${font}`}>

      <div className="max-w-[100rem] px-3 md:px-6 mx-auto flex items-center">
        <Link href="/" aria-label="Home" className = "pt-1.5 md:hidden">
          <Image
            src="/citale_header.svg"
            alt="Citale Logo"
            width={105}  // Reduced width
            height={35} // Reduced height
            priority
          />
        </Link>
        <div className="flex-grow flex justify-center">
          <div className="w-full max-w-sm p-1 sm:p-2">
            <SearchBar onSearch={searchRoute}/>
          </div>
        </div>
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
