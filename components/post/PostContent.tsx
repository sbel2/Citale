"use client";
import React, { useState } from "react";
import Linkify from 'react-linkify';
import { Post } from "@/app/lib/types";
import styles from "@/components/postComponent.module.css";
import Image from 'next/image';
import { IoIosMore } from 'react-icons/io';
import { useRouter } from "next/navigation";

interface PostContentProps {
  post: Post;
  comments: any[];
  deleteComment: (commentId: number) => void;
  userId?: string;
  likes: { [key: number]: number };
  userLikes: { [key: number]: boolean };
  toggleLike: (commentId: number) => void;
  showLoginPopup: boolean;
  setShowLoginPopup: (value: boolean) => void;
  likesFeed: any[];
}

const PostContent: React.FC<PostContentProps> = ({ post, comments, deleteComment, userId, likes, toggleLike, userLikes, showLoginPopup, setShowLoginPopup, likesFeed }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const address = post.mapUrl;
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(true); // State to toggle between comments and likes
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const formatTime = (date: Date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
      return `${hours}:${minutes} ${ampm}`;
    };

    if (isToday) {
      return `Today, ${formatTime(date)}`;
    } else if (isYesterday) {
      return `Yesterday, ${formatTime(date)}`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (date.getFullYear() === now.getFullYear()) {
      return `${date.toLocaleString("default", { month: "short" })}-${date.getDate()}`;
    } else {
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    }
  };

  const componentDecorator = (href: string | undefined, text: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined, key: React.Key | null | undefined) => (
    <a 
      href={href} 
      key={key} 
      className="text-blue-500 underline hover:text-blue-700"
      target="_blank" 
      rel="noopener noreferrer"
    >
      {text}
    </a>
  );

  return (
    <div className={`${styles.content} mt-8 mb-2`}>
      <h4 className="text-lg font-bold mb-4 text-black">{post.title}</h4>
      <div className={styles.preformattedtext}>
        <Linkify componentDecorator={componentDecorator}>{post.description}</Linkify>
      </div>

      {address && (
        <div className="flex justify-end w-full h-40 items-center bg-white rounded-lg pt-4">
          <iframe
            className="w-full h-36 border-none rounded-lg"
            src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}`}
          ></iframe>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-10">{post.created_at}</div>

      <div className="border-t border-gray-200 mt-8"></div>

      {/* Button Wrapper for Comments and Likes */}
      <div className="flex items-center justify-center mt-4">
        <button
          className={`p-4 text-sm w-full flex justify-center items-center focus:outline-none transition-all rounded-lg relative ${
            showComments ? "text-black font-bold" : "text-gray-300"
          }`}
          onClick={() => setShowComments(true)}
        >
          Comments
          {showComments && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 border-t-2 border-red-500"></div>
          )}
        </button>
        <button
          className={`p-4 text-sm w-full flex justify-center items-center focus:outline-none transition-all rounded-lg relative ${
            !showComments ? "text-black font-bold" : "text-gray-300"
          }`}
          onClick={() => setShowComments(false)}
        >
          Likes
          {!showComments && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 border-t-2 border-red-500"></div>
          )}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
  <div className="mt-4 mb-48 md:mb-20">
    {comments.length > 0 ? (
      comments.map((comment) => {
        const profile = comment.profiles || {};
        return (
          <div key={comment.id} className="mb-1 p-2 bg-white flex items-start">
           <button onClick={() => router.push(`/account/profile/${comment.user_id}`)} className="flex-shrink-0">
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pic/${profile.avatar_url || "avatar.png"}`}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full mr-3 object-cover"
              />
            </button>
          <div className="flex flex-col">
          <button
              className="font-semibold text-left whitespace-nowrap"
              onClick={() => router.push(`/account/profile/${comment.user_id}`)}
            >
              {profile.username || "Unknown User"}
            </button>

              <p>{comment.content}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDate(comment.comment_at)}</p>
              <button
                className="flex items-center p-1 pt-2 pr-2 gap-1"
                onClick={() => toggleLike(comment.id)}
              >
                {userLikes[comment.id] ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    color="red"
                    fill="red"
                  >
                    <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    color="#000000"
                    fill="none"
                  >
                    <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
                <span className="text-xs inline-block w-4 text-center">{likes[comment.id] || 0}</span>
              </button>
            </div>

            <div className="relative ml-auto">
              {comment.user_id === userId && (
                <button
                  onClick={() => setOpenMenu(openMenu === comment.id ? null : comment.id)}
                  className="ml-auto text-gray-600 hover:text-gray-800"
                >
                  <IoIosMore size={20} />
                </button>
              )}

              {openMenu === comment.id && (
                <div className="absolute right-0 mt-1 w-32 bg-white shadow-lg border rounded z-20">
                  <button
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      setOpenMenu(null);
                      setShowConfirm(comment.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            {showConfirm === comment.id && (
              <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                  <p className="text-base mb-6">Are you sure you want to delete this comment?</p>
                  <div className="flex justify-center gap-6">
                    <button
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                      onClick={() => setShowConfirm(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      onClick={() => {
                        deleteComment(comment.id);
                        setShowConfirm(null);
                      }}
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })
    ) : (
      <p className="text-sm text-gray-500">No comments yet :(</p>
    )}
  </div>
)}

      {/* Likes Section */}
      {!showComments && (
        <div className="mt-4 mb-48 md:mb-20">
          {likesFeed.length > 0 ? (
            <ul>
              {likesFeed.map((like) => {
                const profile = like.profiles || {};
                return (
                  <li key={like.id} className="mb-1 p-2 bg-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        className="flex items-center space-x-2"
                        onClick={() => router.push(`/account/profile/${like.user_id}`)}
                      >
                        <Image
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pic/${profile.avatar_url || "avatar.png"}`}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <p className="text-sm">
                          <span className="font-semibold">{profile.username || "Unknown User"}</span> liked
                        </p>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(like.liked_at)}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No likes yet :(</p>
          )}
        </div>
      )}

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
                onClick={() => router.push("/log-in")}
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
  );
};

export default PostContent;