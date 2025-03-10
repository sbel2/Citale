import { supabase } from "@/app/lib/definitions";
import { useState, useEffect } from "react";
import { useLikeStore } from "./useLikeStore";
import { UserProfile } from "./types";

interface Like {
  id: number;
  user_id: string;
  post_id: string;
  liked_at: string;
  profiles?: UserProfile;
}

interface UseLikeProps {
  postId: number; // Matches useLikeStore
  userId?: string;
}

export const useLike = ({ postId, userId }: UseLikeProps) => {
  const { likes, updateLike } = useLikeStore();
  const likesCount = likes[postId]?.count ?? 0; // Fallback to 0 if not in store
  const liked = likes[postId]?.liked ?? false; // Fallback to false if not in store
  const [likesFeed, setLikesFeed] = useState<Like[]>([]); // New state for likes feed

  // Fetch like information for the post
  const fetchLikeStatus = async () => {
    try {
      // Fetch the total number of likes for the post
      const { count, error: countError } = await supabase
        .from("likes")
        .select("id", { count: "exact" })
        .eq("post_id", postId);

      if (countError) throw countError;

      // Fetch the list of likes with user profiles and timestamps
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select(`*, profiles (username, avatar_url)`)
        .eq("post_id", postId)
        .order("liked_at", { ascending: false });

      if (likesError) throw likesError;

      // Check if the current user has liked the post
      const userLike = likesData?.find((like) => like.user_id === userId);

      // Update global store
      updateLike(postId, count || 0, !!userLike);
      setLikesFeed(likesData || []); // Update likes feed
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  };

  // Add a like to the post
  const addLike = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("likes")
        .insert([{ user_id: userId, post_id: postId }]);

      if (error) throw error;

      // Update global store
      updateLike(postId, likesCount + 1, true);
      fetchLikeStatus(); // Refresh likes feed
    } catch (error) {
      console.error("Error adding like:", error);
    }
  };

  // Remove a like from the post
  const removeLike = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("likes")
        .delete()
        .match({ user_id: userId, post_id: postId });

      if (error) throw error;

      // Update global store
      updateLike(postId, likesCount - 1, false);
      fetchLikeStatus(); // Refresh likes feed
    } catch (error) {
      console.error("Error removing like:", error);
    }
  };

  // Toggle like for the post
  const toggleLike = async () => {
    if (liked) {
      await removeLike();
    } else {
      await addLike();
    }
  };

  // Fetch like status when the component mounts or `postId`/`userId` changes
  useEffect(() => {
    fetchLikeStatus();
  }, [postId, userId]);

  // Subscribe to Supabase Realtime updates for the likes table
  useEffect(() => {
    const channel = supabase
      .channel(`likes_update_${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          // Refresh like information on changes
          fetchLikeStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return { liked, likesCount, toggleLike, likesFeed }; // Return likes feed
};