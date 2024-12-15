"use client";

import Link from "next/link";
import Image from "next/legacy/image";
import SearchBar from '@/components/SearchBar';
import FilterButton from '@/components/Filter';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PostingButton from '@/components/PostForm';

export default function Header( {handlePostAction, font}: {handlePostAction: () => void; font?: string })  {
  const pathname = usePathname();
  const router = useRouter();
  const prevPathnameRef = useRef<string | null>(null);
  const [fromSearch, setFromSearch] = useState(false);

  useEffect(() => {
    // Check if the previous pathname was "/search-results"
    if (prevPathnameRef.current === '/search-results' && pathname.startsWith('/post')) {
      setFromSearch(true);
    } else {
      setFromSearch(false);
    }

    // Update the ref with the current pathname
    prevPathnameRef.current = pathname;
  }, [pathname]);


  const searchRoute = async (searchQuery: string) => {
    router.push(`/search-results?query=${encodeURIComponent(searchQuery)}`);
  };

  const filterRoute = async (option: string) => {
    router.push(`/filter-results?option=${encodeURIComponent(option)}`);
  };

  return (
    <header className={`py-1 md:py-3 pt-4 md:pt-6 bg-gray-0 ${font}`}>
      <div className="max-w-[100rem] px-3 md:px-6 mx-auto flex items-center">
        <Link href="/" aria-label="Home" className = "pt-1.5">
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
        <button onClick={handlePostAction} className="btn-light flex flex-grow justify-end items-center col-3">
          <Image
            src="/plus.svg"
            alt='Add post sign'
            width={35}
            height={35}
          />
          <p className="mr-5">Create a Post</p>
        </button>
        <a
          href="https://forms.gle/fr4anWBWRkeCEgSN6"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block ml-3 text-blue-600 underline hover:text-blue-800 transition-colors duration-200 text-base"
        >
          How do you like Citale?
        </a>
      </div>
      
      {pathname !== "/search-results" && !fromSearch && (
        <div className="w-full p-1">
          <FilterButton onFilter={filterRoute} />
        </div>
      )}
      
    </header>
  );
}
