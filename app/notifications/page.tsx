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

interface Like {
  id: number;
  user_id: string;
  post_id: string;
  liked_at: string;
  profiles: { username: string; avatar_url: string };
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Fetch user posts
        const { data: userPosts, error: postsError } = await supabase
          .from("posts")
          .select("post_id, title, created_at, user_id")
          .eq("user_id", user.id);

        if (postsError) throw postsError;
        setPosts(userPosts || []);

        // Fetch likes for those posts
        if (userPosts?.length) {
          const postIds = userPosts.map((post) => post.post_id);
          const { data: userLikes, error: likesError } = await supabase
            .from("likes")
            .select("id, user_id, post_id, liked_at, profiles (username, avatar_url)")
            .in("post_id", postIds);

          if (likesError) throw likesError;
          setLikes(userLikes?.reverse() || []);
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
      {likes.length === 0 ? (
        <p className="text-gray-500">No new notifications.</p>
      ) : (
        likes.map(({ id, user_id, post_id, liked_at, profiles }) => {
          const post = posts.find((p) => p.post_id === post_id);
          return (
            <div key={id} className="flex items-center space-x-3 mb-4">
              <Link href={`/account/profile/${user_id}`}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/${profiles.avatar_url}`}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </Link>
              <div>
                <Link href={`/account/profile/${user_id}`} className="font-semibold hover:underline">
                  {profiles.username}
                </Link>
                <p className="text-sm text-gray-500">
                  Liked your post <span className="font-semibold">{post?.title || "a deleted post"}</span> on{" "}
                  {new Date(liked_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default NotificationsPage;
