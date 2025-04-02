'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import SkeletonCardRow from '@/components/SkeletonPost';
import { Post, UserProfile } from '../../lib/types';
import {handlePostSearch, handleUserSearch} from '../../lib/searchUtils'
import styles from '@/components/page.module.css'
import { useRouter } from 'next/navigation';

// Dynamically import other components with Suspense handling
const MasonryGrid = dynamic(() => import('@/components/MasonryGrid'), { ssr: false });

const Search = () => {
  const searchParams = useSearchParams(); // Wrap this in a Suspense boundary
  const query = searchParams.get('query');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [activeButton, setActiveButton] = useState<string>('posts');
  const router = useRouter();

  useEffect(() => {
    document.title = query ? `${query} - Citale Search` : 'Citale Search';
  
    return () => {
    };
  }, [query]);

  useEffect(() => {
    const fetchPostData = async () => {
      if (query) {
        setLoading(true);
        const data = await handlePostSearch(query);
        setPosts(data || []); // Fallback to an empty array if data is null
        setError(data ? null : 'Failed to load posts'); // Set error if data is null
        setLoading(false);
        setFirstLoad(false);
      }
    };

    const fetchUserData = async () => {
      if (query) {
        setLoading(true);
        const userdata = await handleUserSearch(query);
        setUsers(userdata || []);
        setError(userdata ? null : 'Failed to load users');
        setLoading(false);
        setFirstLoad(false);
      }
    };

    fetchPostData();
    fetchUserData();
  }, [query]);

  if (loading && firstLoad) {
    return (
      <main className="min-h-screen mx-auto max-w-[100rem] overflow-x-hidden">
        <div className={styles.container}>
          <div className="mt-10">
          <SkeletonCardRow />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return <p>Error loading posts: {error}</p>;
  }

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
    console.log('Button clicked:', buttonName);
  };

  return (
    <main className="min-h-screen mx-auto max-w-[100rem] overflow-x-hidden">
      <div className="max-w-[100rem] px-3 md:px-6 mx-auto flex items-center">
      </div>
      <div className={styles.container}>
      {activeButton === 'posts' && posts.length === 0 ? (
        <p className="text-center">No posts found :(</p>
      ) : activeButton === 'users' && users.length === 0 ? (
        <p className="text-center">No users found :(</p>
      ) : activeButton === 'posts' ? (
        <div className='mt-10'>
          <MasonryGrid posts={posts} />
        </div>
      ) : (
        <div className='mt-10 w-full'>
          {/* Display users here, map over users array */}
          {users.map((user) => (
            <div key={user.id} className="w-full">
              <button onClick={() => router.push(`/account/profile/${user.id}`)
            } className="flex items-center p-4 hover:bg-gray-100 w-full">
                <img
                  src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/${user.avatar_url}` || `${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/avatar.png`}
                  alt={user.username}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <p>{user.username}</p>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </main>
  );
};

const SearchResult = () => {
  return (
    <Suspense fallback={<div>Loading search parameters...</div>}>
      <Search />
    </Suspense>
  );
};

export default SearchResult;
