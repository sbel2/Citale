'use client';

import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/definitions";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

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
}

interface Like {
  id: number;
  user_id: string;
  post_id: string;
  liked_at: string;
  profiles: Profile;
}

type Notification = Comment | Like;

const NotificationsPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
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
            profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
          }));

          // Fetch likes
          const { data: userLikes, error: likesError } = await supabase
            .from("likes")
            .select("id, user_id, post_id, liked_at, profiles (username, avatar_url)")
            .in("post_id", postIds);

          if (likesError) throw likesError;

          const formattedLikes: Like[] = (userLikes || []).map(like => ({
            ...like,
            profiles: Array.isArray(like.profiles) ? like.profiles[0] : like.profiles
          }));

          // Merge notifications
          const mergedNotifications: Notification[] = [...formattedComments, ...formattedLikes]
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

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No new notifications.</p>
      ) : (
        notifications.map((notification) => {
          const post = posts.find((p) => p.post_id === notification.post_id);
          return (
            <div key={notification.id} className="flex items-center space-x-3 mb-4">
              <Link href={`/account/profile/${notification.user_id}`}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/${notification.profiles.avatar_url}`}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </Link>
              <div>
                <Link href={`/account/profile/${notification.user_id}`} className="font-semibold hover:underline">
                  {notification.profiles.username}
                </Link>
                { "content" in notification ? (
                  <p className="text-sm text-gray-500">
                    Commented on your post <span className="font-semibold">{post?.title || "a deleted post"}</span>: "{notification.content}" on {new Date(notification.comment_at).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Liked your post <span className="font-semibold">{post?.title || "a deleted post"}</span> on {new Date(notification.liked_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default NotificationsPage;