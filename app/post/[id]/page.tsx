'use client';

import { useEffect, useState } from 'react';
import PostComponent from "@/components/postComponent";
import { createClient } from "@/supabase/client";
import { notFound } from "next/navigation";

interface Post {
  post_id: number;
  title: string;
  description: string;
  imageUrl: string[];
  like_count: number;
  created_at: string;
  user_id: number;
}

const supabase = createClient();

export default function Page({ params }: { params: { id: string } }) {
  const { id: post_id } = params;
  const [postData, setPostData] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPostData = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("post_id, title, description, imageUrl, user_id, like_count, created_at")
        .eq("post_id", post_id)
        .single();

      if (error || !data) {
        console.error('Error fetching post data:', error);
        notFound();
      } else {
        console.log('Fetched post data:', data);
        setPostData(data as Post);
      }
    };

    fetchPostData();
  }, [post_id]);

  // Set the document title based on the post title
  useEffect(() => {
    if (postData?.title) {
      document.title = postData.title;  // This changes the browser tab title
    }
  }, [postData]);

  if (!postData) {
    return null;  // Optionally, you can show a loading spinner here
  }

  return (
    <div>
      <PostComponent {...postData} />
    </div>
  );
}