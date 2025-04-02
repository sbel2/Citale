'use client';

import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/definitions";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
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
  is_read: boolean;
}

interface Like {
  id: number;
  user_id: string;
  post_id: string;
  liked_at: string;
  profiles: Profile;
  is_read: boolean;
}

interface CommentLike {
  id: number;
  user_id: string;
  comment_id: number;
  liked_at: string;
  profiles: Profile;
  is_read: boolean;
  comment?: {
    content: string;
    post_id: string;
  };
  post_title?: string;
}

type Notification = Comment | Like | CommentLike;

const NotificationsPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // In your NotificationsPage component
const markAllAsRead = async () => {
  const unreadNotifications = notifications.filter(n => !n.is_read);
  if (unreadNotifications.length === 0) return;

  // Optimistic update
  setNotifications(prev => 
    prev.map(n => !n.is_read ? { ...n, is_read: true } : n)
  );

  // Group updates by type
  const updates = {
    comments: [] as number[],
    likes: [] as number[],
    comment_likes: [] as number[]
  };

  unreadNotifications.forEach(notif => {
    if ('content' in notif) updates.comments.push(notif.id);
    else if ('comment_id' in notif) updates.comment_likes.push(notif.id);
    else updates.likes.push(notif.id);
  });

  try {
    const promises = [];
    
    if (updates.comments.length > 0) {
      promises.push(
        supabase.from('comments')
          .update({ is_read: true })
          .in('id', updates.comments)
      );
    }
    
    if (updates.likes.length > 0) {
      promises.push(
        supabase.from('likes')
          .update({ is_read: true })
          .in('id', updates.likes)
      );
    }
    
    if (updates.comment_likes.length > 0) {
      promises.push(
        supabase.from('comment_likes')
          .update({ is_read: true })
          .in('id', updates.comment_likes)
      );
    }

    await Promise.all(promises);
    
    // Broadcast the update to all components
    await supabase.channel('notification-updates').send({
      type: 'broadcast',
      event: 'notifications-updated',
      payload: { action: 'mark-read' }
    });
  } catch (err) {
    // Revert on error
    setNotifications(prev => 
      prev.map(n => unreadNotifications.some(un => un.id === n.id) ? { ...n, is_read: false } : n)
    );
  }
  window.location.reload(); 
};

const markAllAsUnread = async () => {
  const readNotifications = notifications.filter(n => n.is_read);
  if (readNotifications.length === 0) return;

  // Optimistic update
  setNotifications(prev => 
    prev.map(n => n.is_read ? { ...n, is_read: false } : n)
  );

  // Group updates by type
  const updates = {
    comments: [] as number[],
    likes: [] as number[],
    comment_likes: [] as number[]
  };

  readNotifications.forEach(notif => {
    if ('content' in notif) updates.comments.push(notif.id);
    else if ('comment_id' in notif) updates.comment_likes.push(notif.id);
    else updates.likes.push(notif.id);
  });

  try {
    const promises = [];
    
    if (updates.comments.length > 0) {
      promises.push(
        supabase.from('comments')
          .update({ is_read: false })
          .in('id', updates.comments)
      );
    }
    
    if (updates.likes.length > 0) {
      promises.push(
        supabase.from('likes')
          .update({ is_read: false })
          .in('id', updates.likes)
      );
    }
    
    if (updates.comment_likes.length > 0) {
      promises.push(
        supabase.from('comment_likes')
          .update({ is_read: false })
          .in('id', updates.comment_likes)
      );
    }

    await Promise.all(promises);
    
    // Broadcast the update to all components
    await supabase.channel('notification-updates').send({
      type: 'broadcast',
      event: 'notifications-updated',
      payload: { action: 'mark-unread' }
    });
  } catch (err) {
    // Revert on error
    setNotifications(prev => prev);
  }
  window.location.reload(); 
};

const handleNotificationClick = async (notification: Notification, postId: string) => {
  // Immediate UI update
  setNotifications(prev => 
    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
  );

  // Determine table
  const table = 'content' in notification ? 'comments' :
               'comment_id' in notification ? 'comment_likes' :
               'likes';

  try {
    const { error } = await supabase.from(table)
      .update({ is_read: true })
      .eq('id', notification.id);

    if (!error) {
      // Broadcast the update
      await supabase.channel('notification-updates').send({
        type: 'broadcast',
        event: 'notifications-updated',
        payload: { action: 'single-read', id: notification.id }
      });
    } else {
      // Revert if failed
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, is_read: false } : n)
      );
    }
  } catch (err) {
    // Revert on error
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, is_read: false } : n)
    );
  }

  // Navigate
  router.push(`/post/${postId}`);
};

  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    const ourUpdates = new Set<number>();
    let userPostIds: string[] = [];
    let commentIds: number[] = [];

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Fetch posts created by user
        const { data: userPosts } = await supabase
          .from("posts")
          .select("post_id, title, created_at, user_id")
          .eq("user_id", user.id);

        userPostIds = userPosts?.map(p => p.post_id) || [];
        setPosts(userPosts || []);

        // Fetch user's comments for comment likes
        const { data: userCommentsData } = await supabase
          .from("comments")
          .select("id, post_id, content")
          .eq("user_id", user.id);

        commentIds = userCommentsData?.map(c => c.id) || [];

        // Fetch comments on user's posts
        const { data: userComments } = await supabase
          .from("comments")
          .select("id, content, comment_at, user_id, post_id, is_read, profiles (username, avatar_url)")
          .in("post_id", userPostIds)
          .neq("user_id", user.id)
          .order("comment_at", { ascending: false });

        const formattedComments = (userComments || []).map(comment => ({
          ...comment,
          profiles: Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles
        }));

        // Fetch likes on user's posts
        const { data: userLikes } = await supabase
          .from("likes")
          .select("id, user_id, post_id, liked_at, is_read, profiles (username, avatar_url)")
          .in("post_id", userPostIds)
          .neq("user_id", user.id)
          .order("liked_at", { ascending: false });

        const formattedLikes = (userLikes || []).map(like => ({
          ...like,
          profiles: Array.isArray(like.profiles) ? like.profiles[0] : like.profiles
        }));

        // Fetch comment likes
        let formattedCommentLikes: CommentLike[] = [];
        if (userCommentsData?.length) {
          const { data: commentLikes } = await supabase
            .from("comment_likes")
            .select("id, user_id, comment_id, liked_at, is_read, profiles (username, avatar_url)")
            .in("comment_id", commentIds)
            .neq("user_id", user.id);

          if (commentLikes?.length) {
            const commentPostIds = [...new Set(userCommentsData.map(c => c.post_id))];
            const { data: commentPosts } = await supabase
              .from("posts")
              .select("post_id, title")
              .in("post_id", commentPostIds);

            formattedCommentLikes = commentLikes.map(cl => {
              const comment = userCommentsData.find(c => c.id === cl.comment_id);
              const post = commentPosts?.find(p => p.post_id === comment?.post_id);
              return {
                ...cl,
                profiles: Array.isArray(cl.profiles) ? cl.profiles[0] : cl.profiles,
                comment: {
                  content: comment?.content || "",
                  post_id: comment?.post_id || ""
                },
                post_title: post?.title || "a deleted post"
              };
            });
          }
        }

        const mergedNotifications = [...formattedComments, ...formattedLikes, ...formattedCommentLikes]
          .sort((a, b) => {
            const dateA = new Date("comment_at" in a ? a.comment_at : a.liked_at).getTime();
            const dateB = new Date("comment_at" in b ? b.comment_at : b.liked_at).getTime();
            return dateB - dateA;
          });

        if (isMounted) setNotifications(mergedNotifications);
      } catch (err) {
        if (isMounted) setError("Failed to load notifications");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifications();

    // Setup subscriptions with proper filters
    const commentsChannel = supabase.channel('comments-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'comments',
        filter: `post_id=in.(${userPostIds.join(',')})`
      }, (payload) => {
        if (!payload.new || ourUpdates.has(payload.new.id)) return;
        setNotifications(prev => {
          const existing = prev.find(n => 'content' in n && n.id === payload.new.id);
          if (!existing || existing.is_read === payload.new.is_read) return prev;
          return prev.map(n => 
            'content' in n && n.id === payload.new.id ? { ...n, is_read: payload.new.is_read } : n
          );
        });
      })
      .subscribe();

    const likesChannel = supabase.channel('likes-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'likes',
        filter: `post_id=in.(${userPostIds.join(',')})`
      }, (payload) => {
        if (!payload.new || ourUpdates.has(payload.new.id)) return;
        setNotifications(prev => {
          const existing = prev.find(n => !('content' in n) && !('comment_id' in n) && n.id === payload.new.id);
          if (!existing || existing.is_read === payload.new.is_read) return prev;
          return prev.map(n => 
            !('content' in n) && !('comment_id' in n) && n.id === payload.new.id ? 
            { ...n, is_read: payload.new.is_read } : n
          );
        });
      })
      .subscribe();

    const commentLikesChannel = supabase.channel('comment-likes-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'comment_likes',
        filter: `comment_id=in.(${commentIds.join(',')})`
      }, (payload) => {
        if (!payload.new || ourUpdates.has(payload.new.id)) return;
        setNotifications(prev => {
          const existing = prev.find(n => 'comment_id' in n && n.id === payload.new.id);
          if (!existing || existing.is_read === payload.new.is_read) return prev;
          return prev.map(n => 
            'comment_id' in n && n.id === payload.new.id ? { ...n, is_read: payload.new.is_read } : n
          );
        });
      })
      .subscribe();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentLikesChannel);
    };
  }, [user, pathname]);

  const allRead = notifications.length > 0 && notifications.every(n => n.is_read);

  if (loading && notifications.length === 0) return;
  if (error) return <p className="p-4">Error: {error}</p>;

  return (
    <div className="p-0 py-4">
      <div className="flex justify-between items-center px-4 py-2 mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex space-x-2">
          {/* <button 
            onClick={markAllAsUnread}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Mark All as Unread
          </button> */}
          {!allRead && notifications.length > 0 && (
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
        <p className="text-gray-500 px-4">No notifications.</p>
      ) : (
        <div>
          {notifications.map((notification, index) => {
            const post = posts.find(p => 
              'comment_id' in notification ? 
                notification.comment?.post_id === p.post_id : 
                notification.post_id === p.post_id
            );

            return (
              <div 
                key={`${notification.id}-${index}`}
                className={`flex items-center ${!notification.is_read ? 'bg-blue-50' : ''}`}
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
                  {!notification.is_read && (
                    <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  )}
                </div>
                <div 
                  className="flex-grow p-3 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    const postId = 'comment_id' in notification ? 
                      notification.comment?.post_id || '' : 
                      notification.post_id;
                    if (postId) handleNotificationClick(notification, postId);
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
                  </div>
                  <div className="text-sm text-gray-500">
                    {'content' in notification ? (
                      <p>
                        Commented on your post{' '}
                        <span className="font-semibold hover:underline">
                          {post?.title || 'a deleted post'}
                        </span>
                        : &quot;{notification.content}&quot; on {new Date(notification.comment_at).toLocaleDateString()}
                      </p>
                    ) : 'comment_id' in notification ? (
                      <p>
                        Liked your comment &quot;{notification.comment?.content || 'a deleted comment'}&quot; on post{' '}
                        <span className="font-semibold hover:underline">
                          {notification.post_title || post?.title || 'a deleted post'}
                        </span>{' '}
                        on {new Date(notification.liked_at).toLocaleDateString()}
                      </p>
                    ) : (
                      <p>
                        Liked your post{' '}
                        <span className="font-semibold hover:underline">
                          {post?.title || 'a deleted post'}
                        </span>{' '}
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