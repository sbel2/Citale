'use client';

import React, { use, useEffect, useState } from "react";
import { supabase } from "@/app/lib/definitions";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from 'app/context/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

const Toolbar: React.FC = () => { 
  const { user, logout } = useAuth(); 
  const [userAvatar, setUserAvatar] = useState<string>('avatar.png'); // Default placeholder 
  const [loading, setLoading] = useState<boolean>(true); // Track loading state 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const { push } = useRouter(); 
  const pathname = usePathname();   
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);   

  // Fetch and set user avatar
  const fetchUserAvatar = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url_small')
        .eq('id', userId)
        .single();

      if (error || !data?.avatar_url_small) {         
        console.warn('Error fetching avatar:', error?.message || 'Avatar not found');         
        return 'avatar.png'; // Fallback to placeholder       
      }        

      const avatarUrl = data.avatar_url_small;       
      localStorage.setItem('userAvatar', avatarUrl); // Cache avatar in localStorage       
      return avatarUrl;     
    } catch (err) {       
      console.error('Unexpected error fetching avatar:', err);       
      return 'avatar.png'; // Fallback to placeholder     
    }   
  };   

  // Initialize user avatar   
  useEffect(() => {     
    const initializeAvatar = async () => {       
      if (user) {         
        const storedAvatar = localStorage.getItem('userAvatar');         
        if (storedAvatar) {           
          setUserAvatar(storedAvatar);         
        } else {           
          const avatar = await fetchUserAvatar(user.id);           
          setUserAvatar(avatar);         
        }       
      } else {         
        setUserAvatar('avatar.png'); // Reset to placeholder if no user       
      }       
      setLoading(false);     
    };      

    initializeAvatar();      

    // Clear localStorage when the tab becomes hidden     
    const handleVisibilityChange = () => {       
      if (document.visibilityState === 'hidden') {         
        localStorage.removeItem('userAvatar');       
      }     
    };      

    document.addEventListener('visibilitychange', handleVisibilityChange);      

    // Cleanup the event listener on component unmount     
    return () => {       
      document.removeEventListener('visibilitychange', handleVisibilityChange);     
    };   
  }, [user]);   

  const handleLogout = async () => {     
    await logout();     
    localStorage.removeItem("userAvatar"); // Clear cached avatar        

    if (pathname === "/") {       
      window.location.reload(); // Force full-page refresh if already on the main page     
    } else {       
      push("/"); // Navigate to home page if on a different page     
    }   
  };

  useEffect(() => {
    console.log('Checking for unread messages...');
    const checkUnreadMessages = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('chats')
          .select('is_read')
          .eq('receiver_id', user.id)
          .eq('is_read', false)
        if (error) {
          console.error('Error fetching unread messages:', error.message);
          return;
        }
        if (data && data.length > 0) {
        setHasUnreadMessage(true);
        }
        else{
          setHasUnreadMessage(false);
        }
      }
    };
    checkUnreadMessages();

    if (user) {
      // Fetch messages immediately
      checkUnreadMessages();

      // Set up polling every 2 seconds
      const interval = setInterval(checkUnreadMessages, 10000);

      // Clean up the interval on unmount
      return () => {
        clearInterval(interval);
      };
    }
  }, [user]); // Add user as a dependency to re-run when user changes


  // In your Toolbar component
// In Toolbar component
useEffect(() => {
  if (!user) {
    setHasUnreadNotifications(false);
    return;
  }

  const checkUnreadNotifications = async () => {
    try {
      // Get user's post IDs
      const { data: userPosts } = await supabase
        .from("posts")
        .select("post_id")
        .eq("user_id", user.id);
      const postIds = userPosts?.map(p => p.post_id) || [];

      // Get user's comment IDs
      const { data: userComments } = await supabase
        .from("comments")
        .select("id")
        .eq("user_id", user.id);
      const commentIds = userComments?.map(c => c.id) || [];

      // Check for unread comments on user's posts
      const { count: unreadCommentsCount } = await supabase
        .from("comments")
        .select("*", { count: 'exact', head: true })
        .in("post_id", postIds)
        .eq("is_read", false)
        .neq("user_id", user.id);

      // Check for unread likes on user's posts
      const { count: unreadLikesCount } = await supabase
        .from("likes")
        .select("*", { count: 'exact', head: true })
        .in("post_id", postIds)
        .eq("is_read", false)
        .neq("user_id", user.id);

      // Check for unread comment likes on user's comments
      const { count: unreadCommentLikesCount } = await supabase
        .from("comment_likes")
        .select("*", { count: 'exact', head: true })
        .in("comment_id", commentIds)
        .eq("is_read", false)
        .neq("user_id", user.id);

      setHasUnreadNotifications(
        (unreadCommentsCount || 0) > 0 ||
        (unreadLikesCount || 0) > 0 ||
        (unreadCommentLikesCount || 0) > 0
      );
    } catch (error) {
      console.error('Error checking unread notifications:', error);
      setHasUnreadNotifications(false);
    }
  };

  // Check initially
  checkUnreadNotifications();

  // Set up real-time subscriptions
  let dbChannel: RealtimeChannel;
  let updatesChannel: RealtimeChannel;
  
  if (user) {
    // Channel for database changes
    dbChannel = supabase
      .channel('unread-notifications-db')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `is_read=eq.false`
        },
        () => checkUnreadNotifications()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `is_read=eq.false`
        },
        () => checkUnreadNotifications()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_likes',
          filter: `is_read=eq.false`
        },
        () => checkUnreadNotifications()
      )
      .subscribe();

    // Channel for component updates
    updatesChannel = supabase.channel('unread-notifications-updates')
      .on(
        'broadcast',
        { event: 'notifications-updated' },
        () => checkUnreadNotifications()
      )
      .subscribe();
  }

  // Set up an interval to check periodically (every 5 minutes)
  const interval = setInterval(checkUnreadNotifications, 300000);
  
  return () => {
    clearInterval(interval);
    if (dbChannel) supabase.removeChannel(dbChannel);
    if (updatesChannel) supabase.removeChannel(updatesChannel);
  };
}, [user]);

  return (     
    <nav className="bg-white text-black fixed md:top-0 md:left-0 md:h-full md:w-64 w-full bottom-0 h-16 flex md:flex-col items-start md:items-stretch shadow-md z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>       
      <Link href="/" aria-label="Home" className="pt-10 pl-8 pb-10 hidden md:inline">         
        <Image src="/citale_header.svg" alt="Citale Logo" width={90} height={30} priority />       
      </Link>        

      {/* Home Button */}       
      <button         
        onClick={() => push('/')}         
        className={`p-4 w-full flex justify-center md:justify-start items-center md:hover:bg-gray-200 focus:outline-none md:focus:ring-2 md:focus:ring-blue-500 transition-all ${pathname === '/' ? 'font-semibold' : ''}`}       
      >         
        <Image src={pathname === '/' ? "/home_s.svg" : "/home.svg"} alt="Home Icon" width={25} height={25} priority />         
        <span className="ml-5 hidden md:inline">Home</span>       
      </button>        

      {/* Chat Button */}
      <button
        onClick={() => push(user ? '/inbox' : '/log-in')}
        className={`p-4 w-full flex justify-center md:justify-start items-center md:hover:bg-gray-200 focus:outline-none md:focus:ring-2 md:focus:ring-blue-500 transition-all ${pathname === '/inbox' ? 'font-semibold' : ''}`}
      >
        <div className="relative">
          <Image src={pathname === '/inbox' ? "/chat_s.svg" : "/chat.svg"} alt="Chat Icon" width={25} height={25} priority />
          {hasUnreadMessage && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </div>
        <span className="ml-5 hidden md:inline">Message</span>
      </button>

      {/* Post Button */}
      <button onClick={() => {user ? push('/upload') : push('/log-in')}} className={`p-4 w-full flex justify-center md:justify-start items-center md:hover:bg-gray-200 focus:outline-none md:focus:ring-2 md:focus:ring-blue-500 transition-all ${pathname === '/createpost' ? 'text-bold fill-black' : ''}`}>
          <Image
            src={["/upload", "/posting"].includes(pathname) ? "/plus_s.svg" : "/plus.svg"}
            alt="Plus Icon"
            width={25}
            height={25}
            priority
          />
        <span className="ml-5 hidden md:inline">Post</span>
      </button>

      {/* Notifications Button */}
      {user ? (
  <button
    onClick={() => push('/notifications')}
    className={`p-4 w-full flex justify-center md:justify-start items-center md:hover:bg-gray-200 focus:outline-none md:focus:ring-2 md:focus:ring-blue-500 transition-all ${pathname === '/notifications' ? 'font-semibold' : ''}`}
  >
    <div className="relative">
      <Image
        src={pathname === '/notifications' ? "/bell_s.svg" : "/bell.svg"}
        alt="Notifications Icon"
        width={25}
        height={25}
        priority
      />
      {hasUnreadNotifications && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
      )}
    </div>
    <span className="ml-5 hidden md:inline">Notifications</span>
  </button>
) : (
  <Link href="/log-in" className="p-4 w-full flex justify-center md:justify-start items-center">
    <Image src="/bell.svg" alt="Notifications Icon" width={25} height={25} priority />
    <span className="ml-5 hidden md:inline">Notifications</span>
  </Link>
)}


      {/* Profile Button */}       
      {user ? (         
        <Link href={`/account/profile/${user.id}`} className={`p-4 w-full flex justify-center md:justify-start items-center md:hover:bg-gray-200 focus:outline-none md:focus:ring-2 md:focus:ring-blue-500 transition-all ${pathname === '/account/profile' ? 'font-semibold' : ''}`}>           
          <Image             
            src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/${userAvatar}`}             
            alt="Profile Icon"             
            width={25}             
            height={25}             
            className="rounded-full"             
            priority             
            onError={() => setUserAvatar('avatar.png')} // Fallback if image fails to load           
          />           
          <span className="ml-5 hidden md:inline">Profile</span>         
        </Link>       
      ) : (         
        <Link href="/log-in" className="p-4 w-full flex justify-center md:justify-start items-center">           
          <Image src="/account.svg" alt="Profile Icon" width={25} height={25} priority />           
          <span className="ml-5 hidden md:inline">Profile</span>         
        </Link>       
      )}        

      {/* Log in Button */}       
      {!loading && !user && (         
        <Link           
          href="/log-in"           
          className="p-3 w-[88%] text-center bg-[#fd0000] text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mx-auto mt-4 hidden md:block"         
        >           
          Log in         
        </Link>       
      )}        

      {/* Menu Button */}       
      <div className="md:mt-auto w-full relative">         
        {isMenuOpen && (           
          <div className="absolute bottom-full mb-2 right-0 bg-white shadow-md rounded-lg w-full min-w-[200px] md:w-64 md:left-0">         
            {user ? (               
              <a href="#" onClick={handleLogout} className="block p-4 hover:bg-gray-200 text-red-600">Log out</a>             
            ) : (               
              <Link href="/log-in" className="block p-4 hover:bg-gray-200 text-black-600">Log in</Link>             
            )}

            <Link
              href="https://forms.gle/kfWJA5HCBMne8dND7" // Replace with your Google Form link
              className="block p-4 hover:bg-gray-200 text-black-600"
              target="_blank" 
              >
              Report Content/User
            </Link>

            <Link
              href="/support" // Replace with your Google Form link
              className="block p-4 hover:bg-gray-200 text-black-600"
              target="_blank" 
              >
              Customer Support
            </Link>

            <Link
              href="/privacy-policy"
              className="block p-4 hover:bg-gray-200 text-black"
              target="_blank" 
            >
              Privacy Policy
            </Link> 
            <Link href="/terms" className="block p-4 hover:bg-gray-200 text-black" target="_blank"  >Terms of Use</Link>             
          </div> 
        )}         
        <button           
          onClick={toggleMenu}           
          className="p-4 w-full flex justify-center md:justify-start items-center md:hover:bg-gray-200 focus:outline-none md:focus:ring-2 md:focus:ring-blue-500 transition-all"         
        >           
          <Image src="/menu.svg" alt="Menu Icon" width={25} height={25} priority />           
          <span className="ml-5 hidden md:inline">Menu</span>         
        </button>       
      </div>     
    </nav>   
  ); 
};  

export default Toolbar;