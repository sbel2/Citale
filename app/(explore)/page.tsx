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
        .select('post_id, title, description, is_video, mediaUrl, mapUrl, thumbnailUrl, user_id, like_count, created_at')
        .order('created_at', { ascending: false })
        .order('like_count', { ascending: false });

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
      <main className="min-h-screen mx-auto max-w-[100rem] overflow-x-hidden position-relative z-[2]">
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
    <main className="min-h-screen mx-auto max-w-[100rem] overflow-x-hidden position-relative z-[2]">
      <div className={styles.container}>
          <MasonryGrid posts={posts}/>
      </div>
    </main>
  );
}
