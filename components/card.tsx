"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { useParams } from "next/navigation";  // Import useParams for dynamic routing

const Card: React.FC<{ post: Post, managePost?: (manageType: string, postId: number, postAction: string) => void }> = ({ post, managePost }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('avatar.png');
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null);


  const params = useParams();
  const postIdFromURL = params.postId;
  const currentUrl = window.location.href;

  // Function to extract filters from the URL (if any)
  const getFiltersFromURL = () => {
    const url = new URL(currentUrl);
    const filters = new URLSearchParams(url.search);
    return filters.toString(); // This will return filter query params as a string
  };

  // Check if the current post's ID matches the postId in the URL
  useEffect(() => {
    if (postIdFromURL && postIdFromURL === String(post.post_id)) {
      setIsOpen(true);  // Open the dialog if the postId matches
    } else {
      setIsOpen(false);  // Close the dialog if postId does not match
    }
  }, [postIdFromURL, post.post_id]);

  // Function to handle clicking on a post to show the popup
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();  // Prevent default navigation

    // Get the current filters from URL
    const filters = getFiltersFromURL();

    // Manually update the URL to include the post ID and filters (if any)
    window.history.pushState(
      {}, 
      '', 
      `/${post.post_action}/${post.post_id}${filters ? '?' + filters : ''}`
    );

    // Open the dialog (popup)
    setIsOpen(true);
  };

  // Function to close the dialog and reset the URL
  const handleClose = () => {
    router.back();
    // Close the dialog
    setIsOpen(false);
  };

  // Handle the like functionality
  const { liked, likesCount, toggleLike } = useLike({
    postId: post?.post_id || 0,
    userId: user?.id || ""
  });

  const handleLike = () => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    toggleLike();
  };

  // Fetch profile data (username and avatar URL)
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!post.user_id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url_small')
          .eq('id', post.user_id)
          .single();

        if (error) throw error;

        setUsername(data?.username || '');
        setAvatarUrl(data?.avatar_url_small || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfileData();
  }, [user, post.user_id, post.user_id]);

  const toggleButtonClick = () => {
    setButtonClicked((prevState) => !prevState);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setButtonClicked(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const manageDelete = () => {
      managePost ? managePost("delete", post.post_id, post.post_action) : null;
  }

  const bucketName = post.post_action == "post" ? "posts" : post.post_action == "draft" ? "drafts" : null;

  return (
    <>
      <div className={styles["card-container"]}>
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <DialogTrigger asChild>
          <div>
            <div className="cursor-pointer">
              <div onClick={handleClick} className={styles["image-container"]}>
                {post.is_video ? (
                  <>
                    <video
                      src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/${bucketName}/videos/${post.thumbnailUrl}`}
                      width={300}
                      height={200}
                      autoPlay
                      loop
                      muted
                      className="transition-transform duration-500 ease-in-out transform"
                      playsInline
                    />
                    <div className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 bg-black bg-opacity-35 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="24" height="24" className="text-white  bg-black bg-opacity-35 rounded-full">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/${bucketName}/images/${post.mediaUrl?.[0]}`}
                    alt={post.title}
                    width={300}
                    height={200}
                    className="transition-transform duration-500 ease-in-out transform"
                  />
                )}
                <div className={styles["overlay"]}></div>
              </div>
              <div className=" flex justify-between items-center px-2 pt-3">
                <div className="text-xs sm:text-sm text-black">{post.title}</div>
                {(post.user_id == user?.id) && (pathname == `/account/profile/${user?.id}`) && ( //ADDS more button if it's your post on your profile which can be used to edit/delete/archive posts
                      <button
                      className="pl-1 pr-1 focus:outline-none w-8 min-w-[32px] h-5"
                      aria-label="More options"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents the click event from propagating to the parent div
                        toggleButtonClick();  // Call your custom button function
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="gray"
                        viewBox="0 0 24 24"
                        className="text-gray-600 w-full h-full"
                      >
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="11" cy="12" r="1.5" />
                        <circle cx="17" cy="12" r="1.5" />
                      </svg>
                    </button>
                    )}
              </div>
              {buttonClicked && ( //more button functions
                    <div ref={dropdownRef} className="text-xs sm:text-sm right-0 mt-2 bg-white rounded-md shadow-lg border" style={{margin: "5px"}}>
                        <ul className="py-1">
                            <li
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {manageDelete(); e.stopPropagation();}}
                            >
                            Delete {post.post_action}
                            </li>
                            <li
                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => router.push(`/editpost/${post.post_action}/${post.post_id}`)}
                            >
                            Edit {post.post_action}
                            </li>
                        </ul>
                    </div>)}
            </div>
          </div>
          </DialogTrigger>

          <DialogContent>
            <VisuallyHidden>
              <h2>{post.title}</h2>
            </VisuallyHidden>
            <PostComponent post={post} context="popup" />
            <DialogClose onClick={handleClose} aria-label="Close" />
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between px-2 py-3">
          <button onClick={() => router.push(`/account/profile/${post.user_id}`)} className="flex items-center">
            <div className="flex items-center">
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/${avatarUrl}`}
                alt="Profile"
                width={20}
                height={20}
                className="rounded-full"
              />
              <p className="text-xs ml-2 truncate max-w-[100px] text-gray-600">{username}</p>
            </div>
          </button>

          <button className="flex items-center p-1" onClick={handleLike}>
            {liked ? (
              <svg fill="red" stroke="red" viewBox="0 0 24 24" className="w-4 h-4 mr-1">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg fill="none" stroke="black" viewBox="0 0 24 24" className="w-4 h-4 mr-1">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
            <span className="text-xs">{likesCount}</span>
          </button>

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
              
        </div>
      </div>
    </>
  );
};

export default Card;
