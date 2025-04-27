'use client';

import { useEffect, useState } from 'react';
import PostComponent from "@/components/postComponent";
import { createClient } from "@/supabase/client";
import { Post } from '../../../lib/types';

export default function Page({ params }: { params: { post: string, id: string } }) {
  const { post: postType, id: post_id } = params;
  const [postData, setPostData] = useState<Post | null>(null);
  const [loading, setloading] = useState<boolean>(true);
  const postTable = postType == "post" ? "posts" : postType == "draft" ? "drafts" : "";
  useEffect(() => {
    const supabase = createClient();

    const fetchPostData = async () => {
      const { data, error } = await supabase
        .from(postTable)
        .select("*")
        .eq("post_id", post_id)
        .single();

      if (error || !data) {
        console.error('Error fetching post data:', error);
        setPostData(null);
        setloading(false);
        return;
      } else {
        setPostData(data);
        document.title = data.title;
        setloading(false);
      }
    };

    fetchPostData();
  }, [postType, post_id, postTable]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-grey-500"></div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">No post found :(</p>
      </div>
    );
  }

  return (
    <div className="post-container md:w-[750px] md:h-[600px] lg:w-[850px] lg:h-[678px] md:left-[calc(50%+8rem)] md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
      <PostComponent post={postData} context="static" />
      <style jsx>{`
        .post-container {
          position: absolute;
          border: 0.5px solid #d1d5db;
        }

        @media (max-width: 768px) {
          .post-container {
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
}
