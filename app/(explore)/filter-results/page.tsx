//testing merge
'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import SkeletonCardRow from '@/components/SkeletonPost';
import { Post } from '../../lib/types';
import {handleFilter} from '../../lib/filterUtils'
import styles from '@/components/page.module.css'

const MasonryGrid = dynamic(() => import('@/components/MasonryGrid'), { ssr: false });

const Filter = () => {
  const searchParams = useSearchParams(); 
  const selectedOption = searchParams.get('option');
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  useEffect(() => {
    document.title = selectedOption ? `${selectedOption} - Citale Search` : 'Citale Search';
  
    return () => {
    };
  }, [selectedOption]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedOption) {
        setLoading(true);
        const data = await handleFilter(selectedOption);
        setPosts(data || []); // Fallback to an empty array if data is null
        setError(data ? null : 'Failed to load posts'); // Set error if data is null
        setLoading(false);
        setFirstLoad(false);
      }
    };

    fetchData();
  }, [selectedOption]);

  if (loading && firstLoad) {
    return (
      <main className="min-h-screen mx-auto max-w-[100rem] overflow-x-hidden position-relative z-[2]">
        <div className={styles.container}>
          <SkeletonCardRow />
        </div>
      </main>
    );
  }

  if (error) {
    return <p>Error loading filter posts: {error}</p>;
  }

  return (
    <main className="min-h-screen mx-auto max-w-[100rem] overflow-x-hidden position-relative z-[2]">
      <div className={styles.container}>
      {posts.length === 0 ? (
        <p className="text-center">No posts found :) </p>
      ) : (
        <MasonryGrid posts={posts} />
      )}
    </div>
    </main>
  );
};

const FilterResult = () => {
  return (
    <Suspense fallback={<div>Loading search parameters...</div>}>
      <Filter />
    </Suspense>
  );
};

export default FilterResult;