"use client";
import React, { useState, useRef, useEffect } from "react";
import Linkify from 'react-linkify';
import Image from 'next/image';
import styles from "./postComponent.module.css";
import {useRouter} from 'next/navigation';
import { Post } from "@/app/lib/types";
import { supabase } from "@/app/lib/definitions";
import { useAuth } from 'app/context/AuthContext';
import { useLike } from 'app/lib/useLikes';
import { useFavorite } from 'app/lib/useFavorites';

//defining the variables
interface PostComponentProps {
  post: Post; 
  context: 'popup' | 'static'; 
}

// making the link in post clickable
const linkDecorator = (href: string, text: string, key: number): React.ReactNode => {
  // Validate the URL
  if (!isValidUrl(href)) {
    return <span key={key}>{text}</span>;  // Just return text if URL is invalid
  }

  return (
    <a href={href} key={key} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
      {text}
    </a>
  );
};

// Simple URL validation function
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
  } catch (_) {
    return false;  // Malformed URL
  }
  return true;
}

const PostComponent: React.FC<PostComponentProps> = ({ post, context }) => {

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('avatar.png');
  const headerClass = context === 'popup' ? styles.popup : styles.static;
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const address = post.mapUrl;
  const { user, logout } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handlePrevious = () => {
    const newIndex =
      currentImageIndex > 0 ? currentImageIndex - 1 : post.mediaUrl.length - 1;
    setCurrentImageIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex =
      currentImageIndex < post.mediaUrl.length - 1 ? currentImageIndex + 1 : 0;
    setCurrentImageIndex(newIndex);
  };


  const handleBack = () => {
    setTimeout(() => {
        router.push('/');
    }, 0);
};

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext(); // Swipe left to move to the next image
    }

    if (touchEndX.current - touchStartX.current > 50) {
      handlePrevious(); // Swipe right to move to the previous image
    }
  }

  useEffect(() => {
    const handleFetchUserProfile = async () => {
      // Fetch user profile data from the server
      const {data, error} = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', post.user_id)
        .single();
      if (error) {
        console.error('Error fetching user profile:', error.message);
        return;
      }
      if(data){
        setUsername(data?.username || '');
        setAvatarUrl(data?.avatar_url || '');
        console.log(data);
      }
    };
    handleFetchUserProfile();
  }, [post.user_id]);

  const { liked, likesCount, toggleLike } = useLike({
    postId: post.post_id,
    userId: user?.id,
    initialLikeCount: post.like_count
  });

  const { favorited, favoritesCount, toggleFavorite } = useFavorite({
    postId: post.post_id,
    userId: user?.id,
    initialFavoriteCount: post.favorite_count
  });

  const handleLike = () => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    toggleLike();
  };

  const handleFavorite = () => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    toggleFavorite();
  };


  return (
    <>
      <div className={`${styles.card} ${headerClass}`}>
        <div 
          className={post.is_video ? styles.videocontainer : styles.imagecontainer}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {post.is_video ? (
            // Video display if the post is a video
            <video
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/video/${post.mediaUrl[currentImageIndex]}`}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain filter brightness-95"
              playsInline
            />
          ) : (
            // Image display if the post is an image
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${post.mediaUrl[currentImageIndex]}`}
              alt={post.title}
              fill
              style={{ objectFit: "contain" }}
            />
          )}
          {post.mediaUrl.length > 1 && !post.is_video && (
            <div className={styles.navigation}>
              <button className={styles.navbutton} onClick={handlePrevious} aria-label="Previous Image">
                &lt;
              </button>
              <button className={styles.navbutton} onClick={handleNext} aria-label="Next Image">
                &gt;
              </button>
            </div>
          )}
          {!post.is_video && (
            <span className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {`${currentImageIndex + 1}/${post.mediaUrl.length}`}
            </span>
          )}
        </div>
        {/* element for the text, header, and footer */}
        <div className={`${styles.textcontainer} p-4 md:p-10`}>
          <div className={styles.header}>
            <div className="flex items-center ml-8">
              <button onClick={()=>router.push(`/account/profile/${post.user_id}`)} className="flex items-center">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pic/${avatarUrl}`}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full mr-5"
                />
                <p>{username}</p>
              </button>
            </div>
          </div>
          <div className={`${styles.content} mt-8 mb-2`}>
            <h4 className='text-lg font-bold mb-4 text-black'>
              {post.title}
            </h4>
            <div className={styles.preformattedtext}>
              <Linkify componentDecorator={linkDecorator}>{post.description}</Linkify>
            </div>
            {/* map visualization code */}
            {address && (
              <div className="flex justify-end w-full h-40 items-center bg-white rounded-lg pt-4">
              {(() => {
                const encodedAddress = encodeURIComponent(address);
                const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`;
                return (
                  <iframe
                    className="w-full h-36 border-none rounded-lg"
                    src={mapUrl}
                  ></iframe>
                );
              })()}
              </div>
            )}
            <div className='text-xs text-gray-500 mt-10 mb-20'>{post.created_at}</div>
          </div>
          <div className={styles.footer}>
            <button className="flex items-center p-1 pr-3" onClick={handleLike}>
              {liked ? (
                <svg
                  fill="red"
                  stroke="red"
                  viewBox="0 0 24 24"
                  className={styles.icon}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg
                  fill="none"
                  stroke="black"
                  viewBox="0 0 24 24"
                  className={styles.icon}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
              <span className="text-xs inline-block w-4 text-center">{likesCount}</span>
            </button>

            <button className="flex items-center p-1 pr-7" onClick={handleFavorite}>
              {favorited ? (
                <svg
                  fill="#FFD700"
                  stroke="#FFD700"
                  viewBox="0 0 24 24"
                  className={styles.icon}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ) : (
                <svg
                  fill="none"
                  stroke="black"
                  viewBox="0 0 24 24"
                  className={styles.icon}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              )}
              <span className="text-xs inline-block w-4 text-center">{favoritesCount}</span>
            </button>

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
          </div>

          </div>
        </div>
        {context === 'static' && (
              <button
                className='fixed top-5 right-5 bg-gray-600 bg-opacity-50 text-white p-1 rounded-full flex items-center justify-center'
                style={{ width: "30px", height: "30px", lineHeight: "30px" }}
                onClick={handleBack}
                aria-label='Close Post'
              >
                &#x2715;
              </button>
            )}
    </>
  );
};

export default PostComponent;
