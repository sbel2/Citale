'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/supabase/client';
import dynamic from 'next/dynamic';
import SkeletonCardRow from '@/components/SkeletonPost';
import { PostgrestError } from '@supabase/supabase-js';
import { Post } from '../../lib/types';
import styles from '@/components/page.module.css';
import { useAuth } from 'app/context/AuthContext';

const MasonryGrid = dynamic(() => import('@/components/MasonryGrid'), { ssr: false });

export default function FollowingPosts() {
  const [posts, setPosts] = useState<Post[] | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const [followingDetails, setFollowingDetails] = useState<{ id: string }[]>([]);


  useEffect(() => {
    const fetchFollowingData = async () => {
      const supabase = createClient();
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('relationships')
        .select('user_id, follower_id')
        .eq('user_id', user?.id);

      if (error) {
        setError((error as PostgrestError).message);
        setLoading(false);
        return;
      }
      if (data) {
        setFollowingDetails(data.map((item: { follower_id: string }) => ({ id: item.follower_id })));
      }
    };

    fetchFollowingData();
  }, [user]);

  useEffect(() => {
    if (followingDetails.length === 0) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      const supabase = createClient();

      const userIds = followingDetails.map(f => f.id);
      if(!userIds.length) return;

      const { data, error } = await supabase
        .from('posts')
        .select('post_id, title, description, is_video, mediaUrl, mapUrl, thumbnailUrl, user_id, created_at, post_action, favorite_count')
        .in('user_id', userIds)
        .order('created_at', { ascending: false })

      if (error) {
        setError((error as PostgrestError).message);
        setLoading(false);
        return;
      }

      setPosts(data);
      setLoading(false);
    };

    fetchPosts();
  }, [followingDetails]);

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
        <MasonryGrid posts={posts} />
      </div>
      {/* block to for mobile toolbar to appear full */}
      <div className="fixed bottom-0 left-0 w-full h-12 bg-white p-4 shadow-md z-10 md:hidden"></div>
    </main>
  );
}
