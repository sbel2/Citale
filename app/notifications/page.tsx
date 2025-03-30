'use client';

import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/definitions";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Router } from "lucide-react";

interface Post {
  post_id: string;
  title: string;
  created_at: string;
  user_id: string;
}

interface Profile {
  username: string;
  avatar_url: string;
}

interface Comment {
  id: number;
  content: string;
  comment_at: string;
  user_id: string;
  post_id: string;
  profiles: Profile;
  read: boolean;
}

interface Like {
  id: number;
  user_id: string;
  post_id: string;
  liked_at: string;
  profiles: Profile;
  read: boolean;
}

interface CommentLike {
  id: number;
  user_id: string;
  comment_id: number;
  liked_at: string;
  profiles: Profile;
  read: boolean;
  comment?: {
    content: string;
    post_id: string;
  };
}

type Notification = Comment | Like | CommentLike;

const NotificationsPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const storedReadStatus = localStorage.getItem('notificationReadStatus');
        const readStatusMap = storedReadStatus ? JSON.parse(storedReadStatus) : {};

        const { data: userPosts, error: postsError } = await supabase
          .from("posts")
          .select("post_id, title, created_at, user_id")
          .eq("user_id", user.id);

        if (postsError) throw postsError;
        setPosts(userPosts || []);

        if (userPosts?.length) {
          const postIds = userPosts.map((post) => post.post_id);

          // Fetch comments
          const { data: userComments, error: commentsError } = await supabase
            .from("comments")
            .select("id, content, comment_at, user_id, post_id, profiles (username, avatar_url)")
            .in("post_id", postIds)
            .order("comment_at", { ascending: false });

          if (commentsError) throw commentsError;

          const formattedComments: Comment[] = (userComments || []).map(comment => ({
            ...comment,
            profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles,
            read: readStatusMap[comment.id] || false
          }));

          // Fetch likes
          const { data: userLikes, error: likesError } = await supabase
            .from("likes")
            .select("id, user_id, post_id, liked_at, profiles (username, avatar_url)")
            .in("post_id", postIds)
            .order("liked_at", { ascending: false });

          if (likesError) throw likesError;

          const formattedLikes: Like[] = (userLikes || []).map(like => ({
            ...like,
            profiles: Array.isArray(like.profiles) ? like.profiles[0] : like.profiles,
            read: readStatusMap[like.id] || false
          }));

          const { data: userCommentsData, error: userCommentsError } = await supabase
            .from("comments")
            .select("id")
            .eq("user_id", user.id);

          if (userCommentsError) throw userCommentsError;

          let formattedCommentLikes: CommentLike[] = [];
          
          if (userCommentsData?.length) {
            const commentIds = userCommentsData.map(comment => comment.id);
            
            // Fetch commentlikes
            const { data: commentLikes, error: commentLikesError } = await supabase
              .from("comment_likes")
              .select("id, user_id, comment_id, liked_at, profiles (username, avatar_url)")
              .in("comment_id", commentIds)
              .order("liked_at", { ascending: false });

            if (commentLikesError) throw commentLikesError;

            // Fetch the comment that have corresponding commentlikes to get their post_id and content
            const { data: likedComments, error: likedCommentsError } = await supabase
              .from("comments")
              .select("id, content, post_id")
              .in("id", commentLikes.map(cl => cl.comment_id));

            if (likedCommentsError) throw likedCommentsError;

            formattedCommentLikes = (commentLikes || []).map(commentLike => {
              const comment = likedComments?.find(c => c.id === commentLike.comment_id);
              return {
                ...commentLike,
                profiles: Array.isArray(commentLike.profiles) ? commentLike.profiles[0] : commentLike.profiles,
                read: readStatusMap[commentLike.id] || false,
                comment: comment ? {
                  content: comment.content,
                  post_id: comment.post_id
                } : undefined
              };
            });
          }

          const mergedNotifications: Notification[] = [...formattedComments, ...formattedLikes, ...formattedCommentLikes]
        .sort((a, b) => new Date("comment_at" in a ? a.comment_at : a.liked_at).getTime() -
                         new Date("comment_at" in b ? b.comment_at : b.liked_at).getTime())
        .reverse();

      setNotifications(mergedNotifications);
    }
  } catch (err) {
    console.error("Error fetching notifications:", err);
    setError("Failed to load notifications.");
  } finally {
    setLoading(false);
  }
};

    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (notifications.length > 0) {
      const readStatusMap: Record<number, boolean> = {};
      notifications.forEach(notification => {
        readStatusMap[notification.id] = notification.read;
      });
      localStorage.setItem('notificationReadStatus', JSON.stringify(readStatusMap));
    }
  }, [notifications]);

  const handleNotificationClick = (notificationId: number, postId: string) => {
  setNotifications(prev => 
    prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
  );
  // Update localStorage immediately
  const storedReadStatus = localStorage.getItem('notificationReadStatus') || '{}';
  const readStatusMap = JSON.parse(storedReadStatus);
  readStatusMap[notificationId] = true;
  localStorage.setItem('notificationReadStatus', JSON.stringify(readStatusMap));
  
  router.push(`/post/${postId}`);
};

const markAllAsRead = () => {
  setNotifications(prev => 
    prev.map(n => ({ ...n, read: true }))
  );
  // Update localStorage immediately
  const storedReadStatus = localStorage.getItem('notificationReadStatus') || '{}';
  const readStatusMap = JSON.parse(storedReadStatus);
  Object.keys(readStatusMap).forEach(key => {
    readStatusMap[key] = true;
  });
  localStorage.setItem('notificationReadStatus', JSON.stringify(readStatusMap));
  window.location.reload(); 
};

const markAsUnread = (notificationId: number) => {
  setNotifications(prev =>
    prev.map(n =>
      n.id === notificationId ? { ...n, read: false } : n
    )
  );
  // Update localStorage immediately
  const storedReadStatus = localStorage.getItem('notificationReadStatus') || '{}';
  const readStatusMap = JSON.parse(storedReadStatus);
  readStatusMap[notificationId] = false;
  localStorage.setItem('notificationReadStatus', JSON.stringify(readStatusMap));
};

const markAllAsUnread = () => {
  setNotifications(prev =>
    prev.map(n => ({ ...n, read: false }))
  );
  // Update localStorage immediately
  const storedReadStatus = localStorage.getItem('notificationReadStatus') || '{}';
  const readStatusMap = JSON.parse(storedReadStatus);
  Object.keys(readStatusMap).forEach(key => {
    readStatusMap[key] = false;
  });
  localStorage.setItem('notificationReadStatus', JSON.stringify(readStatusMap));
  window.location.reload(); 
};

  const allRead = notifications.length > 0 && notifications.every(n => n.read);

  if (loading) return
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex space-x-2">
        {/*DEBUG FEATURE START*/}
          {/* <button 
            onClick={markAllAsUnread}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Mark All as Unread
          </button> */}
          {/*DEBUG FEATURE STOP*/}
          {!allRead && ( // Only show Mark All as Read button when there are unread notifications
            <button 
              onClick={markAllAsRead}
              className="px-3 py-1 text-sm bg-red-400 text-white rounded-md hover:bg-red-500"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications.</p>
      ) : (
        <div>
          {notifications.map((notification, index) => {
            const post = posts.find((p) => 
              'comment_id' in notification 
                ? p.post_id === notification.comment?.post_id 
                : p.post_id === notification.post_id
            );
            
            return (
              <div 
                key={notification.id} 
                className={`flex items-center ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="relative flex-shrink-0 p-3">
                  <Link href={`/account/profile/${notification.user_id}`}>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/${notification.profiles.avatar_url}`}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </Link>
                  {!notification.read && (
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <div className={`flex-grow p-3 cursor-pointer ${
                      index > 0 && !notifications[index - 1].read ? 'border-t border-gray-100' : ''
                    }`}
                    onClick={() => {
                      let postId = '';
                      if ('comment_id' in notification) {
                        // For comment likes, get post_id from the associated comment
                        postId = notification.comment?.post_id || '';
                      } else {
                        // For comments and likes, use the direct post_id
                        postId = notification.post_id;
                      }
                      if (postId) {
                        handleNotificationClick(notification.id, postId);
                      }
                    }}
                  >
                  <div className="flex justify-between items-start">
                  <Link 
                    href={`/account/profile/${notification.user_id}`} 
                    className="font-semibold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {notification.profiles.username}
                  </Link>
                    {/*DEBUG FEATURE START*/}
                    {/* {notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsUnread(notification.id);
                        }}
                        className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Mark Unread
                      </button>
                    )} */}
                    {/*DEBUG FEATURE STOP*/}
                  </div>
                  <div className="text-sm text-gray-500">
                    {'content' in notification ? (
                      <p>
                        Commented on your post{" "}
                        <span className="font-semibold hover:underline">
                          {post?.title || "a deleted post"}
                        </span>
                        : "{notification.content}" on {new Date(notification.comment_at).toLocaleDateString()}
                      </p>
                    ) : 'comment_id' in notification ? (
                      <p>
                        Liked your comment "{notification.comment?.content || 'a deleted comment'}" on post{" "}
                        <span className="font-semibold hover:underline">
                          {post?.title || "a deleted post"}
                        </span>{" "}
                        on {new Date(notification.liked_at).toLocaleDateString()}
                      </p>
                    ) : (
                      <p>
                        Liked your post{" "}
                        <span className="font-semibold hover:underline">
                          {post?.title || "a deleted post"}
                        </span>{" "}
                        on {new Date(notification.liked_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;