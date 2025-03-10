'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/supabase/client';
import dynamic from 'next/dynamic';
import SkeletonCardRow from '@/components/SkeletonPost';
import { PostgrestError } from '@supabase/supabase-js';
import { Post } from '../lib/types';
import styles from '@/components/page.module.css';

const MasonryGrid = dynamic(() => import('@/components/MasonryGrid'), { ssr: false });

export default function Home() {
  const [posts, setPosts] = useState<Post[] | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or('endDate.is.null,endDate.gte.' + new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) {
        setError((error as PostgrestError).message);
        setLoading(false);
        return;
      }

      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen mx-auto max-w-[100rem] overflow-x-hidden">
        <div className={styles.container}>
          <SkeletonCardRow />
        </div>
      </main>
    );
  }

  if (error) {
    return <p>Error loading posts: {error}</p>;
  }

  return (
    <main className="min-h-screen mx-auto max-w-[100rem] overflow-x-hidden">
      <div className={styles.container}>
          <MasonryGrid posts={posts}/>
      </div>
      {/* block to for mobile toolbar to appear full */}
      <div className="fixed bottom-0 left-0 w-full h-12 bg-white p-4 shadow-md z-10 md:hidden"></div>
    </main>
  );
}
