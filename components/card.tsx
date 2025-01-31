"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PostComponent from "@/components/postComponent"; 
import styles from "./card.module.css";
import Image from "next/image";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Post } from "@/app/lib/types";
import { supabase } from "@/app/lib/definitions";
import { useAuth } from 'app/context/AuthContext';
import { usePathname, useRouter } from "next/navigation";
import { useLike } from "@/app/lib/useLikes";

const Card: React.FC<{ post: Post }> = ({ post }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('avatar.png');
  const { user, logout } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.title = post.title;
    } else {
      document.title = "Citale | Explore Boston";
    }

    return () => {
      document.title = "Citale | Explore Boston"; // Cleanup on unmount
    };
  }, [isOpen, post.title]);

  const handleClick = () => {
    window.history.pushState(null, '', `/post/${post.post_id}`);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false); // Close the post dialog or component
    
    if (pathname.startsWith('/account/profile/')) {
      router.push(pathname);
      return;
    }
    router.back();
  };

  const { liked, likesCount, toggleLike } = useLike({
    postId: post.post_id,
    userId: user?.id,
    initialLikeCount: post.like_count
  });

  const handleLike = () => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    toggleLike();
  };


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', post.user_id)
          .single();

        if (error) throw error;
        
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfileData();
  }, [post.user_id]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open !== isOpen) {
        setIsOpen(open);
        if (!open) {
          handleClose();
        }
      }
    }}>
      <DialogTrigger asChild>
        <div>
          <div onClick={handleClick} className="cursor-pointer">
            <div className={styles['image-container']}>
              {post.is_video ? (
                <>
                  <video
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/video/${post.thumbnailUrl}`}
                    width={300}
                    height={200}
                    autoPlay
                    loop
                    muted
                    className="transition-transform duration-500 ease-in-out transform filter brightness-95"
                    playsInline
                  />
                  <div className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 bg-black bg-opacity-35 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="white"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="text-white"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </>
              ) : (
                // Otherwise, display the image
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${post.mediaUrl[0]}`}
                  alt={post.title}
                  width={300}
                  height={200}
                  className="transition-transform duration-500 ease-in-out transform"
                />
              )}
              <div className={styles['overlay']}></div>
            </div>
            <div className="px-2 pt-3">
              <div className="text-xs sm:text-sm line-clamp-3 text-black">
                {post.title}
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <VisuallyHidden>
          <DialogTitle>{post.title}</DialogTitle>
          <DialogDescription>
            {post.description}
          </DialogDescription>
        </VisuallyHidden>
        <PostComponent post={post} context="popup" />
        <DialogClose 
          onClick={handleClose}
          aria-label="Close"
        />
      </DialogContent>
      <div className="flex items-center justify-between px-2 py-3">
        {/* Profile section */}
        <button onClick={()=>router.push(`/account/profile/${post.user_id}`)} className="flex items-center">
          <div className="flex items-center">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pic/${avatarUrl}`}
              alt="Profile"
              width={20}
              height={20}
              className="rounded-full"
            />
            <p className="text-xs ml-2 truncate max-w-[100px] text-gray-600">{username}</p>
          </div>
        </button>

        {/* Like button */}
        <button className="flex items-center p-1" onClick={handleLike}>
          {liked ? (
            <svg
              fill="red"
              stroke="red"
              viewBox="0 0 24 24"
              className="w-4 h-4 mr-1"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              fill="none"
              stroke="black"
              viewBox="0 0 24 24"
              className="w-4 h-4 mr-1"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
          <span className="text-xs">{likesCount}</span>
        </button>
      </div>

      {/* Login popup */}
      {showLoginPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="flex justify-center mb-3">
              <Image src="/citale_header.svg" alt="Citale Logo" width={100} height={60} priority />
            </div>
            <p className="text-sm text-gray-600 mb-6">
              We are so glad you like Citale! <br /><br />
              Please sign in or sign up to interact with the community.
            </p>
            <div className="flex justify-center gap-6">
              <button
                className="bg-[#fd0000] hover:bg-[#fd0000] text-white px-4 py-2 rounded mr-2"
                onClick={() => router.push('/log-in')}
              >
                Log in
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                onClick={() => setShowLoginPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default Card;
