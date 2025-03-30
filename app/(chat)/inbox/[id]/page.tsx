'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/definitions'; // Ensure correct import
import { useAuth } from 'app/context/AuthContext';
import ChatInput from '@/components/TalebotChat';
import Image from 'next/image';
import Link from 'next/link';

interface ChatMessage {
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: number;
}

export default function PrivateChat({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user } = useAuth();
  const { id: userId } = params;
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('avatar.png');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [submit, setSubmit] = useState(false);
  const previousMessagesRef = useRef<ChatMessage[]>([]);
  const router = useRouter();

  const fetchChatMessages = async () => {
    if (user) {
      // Fetch sent messages
      const { data: sentData, error: sentError } = await supabase
        .from('chats')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', userId)
        .order('sent_at', { ascending: false });

      // Fetch received messages
      const { data: receivedData, error: receivedError } = await supabase
        .from('chats')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('sender_id', userId)
        .order('sent_at', { ascending: false });

      if (sentError || receivedError) {
        console.error('Error fetching chat messages:', sentError || receivedError);
        return;
      }

      // Combine both arrays (sent and received messages)
      const combinedMessages = [
        ...(sentData || []),
        ...(receivedData || []),
      ];

      // Sort by sent_at (descending order)
      combinedMessages.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
      if (JSON.stringify(combinedMessages) !== JSON.stringify(previousMessagesRef.current)) {
        setMessages(combinedMessages);
        previousMessagesRef.current = combinedMessages;
      }
    }
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, full_name')
      .eq('id', userId)
      .single();
    setUsername(data?.full_name || data?.username || '');
    setAvatarUrl(data?.avatar_url || '');
  };

  // Fetch messages on component mount
  useEffect(() => {
    fetchChatMessages();
    fetchProfile();
  }, [user, userId]);

  useEffect(() => {
    if (user) {
      // Fetch messages immediately
      fetchChatMessages();

      // Set up polling every 2 seconds
      const interval = setInterval(fetchChatMessages, 2000);

      // Clean up the interval on unmount
      return () => {
        clearInterval(interval);
      };
    }
  }, [user, userId]); // Re-run when `user` or `userId` changes

  // Handle submitting user input
  const handleSubmit = async (input: string) => {
    if (!input.trim()) return; // Don't submit empty messages
    if (user) {
      setIsLoading(true); // Set loading state to true

      // Create a new message object
      const newMessage = {
        sent_at: new Date().toISOString(), // Use current timestamp
        content: input,
        sender_id: user.id,
        receiver_id: userId,
      };

      try {
        // Insert the new message into Supabase
        const { data, error } = await supabase
          .from('chats')
          .insert([newMessage])
          .select(); // Use `.select()` to return the inserted row

        if (error) {
          console.error('Error sending message:', error);
        } else {
          // Add the new message to the local state
          setMessages((prevMessages) => [...prevMessages, data[0]]);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false); // Reset loading state
      }
    }
  };

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      console.log("Scroll Height:", chatContainerRef.current.scrollHeight);
      console.log("Scroll Top Before:", chatContainerRef.current.scrollTop);
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      console.log("Scroll Top After:", chatContainerRef.current.scrollTop);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header (Fixed at the top) */}
      <header className="shrink-0 border-b border-gray-200 bg-white overflow-hidden">
        <div className="mx-auto px-4 py-2 flex justify-between items-center">
          <a href="/inbox" aria-label="Go back home" className="text-gray-800 dark:text-white ml-1">
            &#x2190; Inbox
          </a>
          <button className="font-bold" onClick={() => router.push(`/account/profile/${userId}`)}>
            {username}
          </button>
          <Link href="/" aria-label="Home" className="inline-block mt-1">
            <Image
              src="/citale_header.svg"
              alt="Citale Logo"
              width={90}
              height={30}
              priority
            />
          </Link>
        </div>
      </header>

      {/* Chat Messages Container (Scrollable) */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 p-4 md:p-12">
        {user &&
          messages.length > 0 &&
          messages.map((m, index) => (
            <div
              key={index}
              className={`flex gap-3 max-w-3xl mx-auto ${
                m.sender_id === user.id ? "justify-end" : "justify-start"
              }`}
            >
              {/* Display sender/receiver avatar */}
              {m.sender_id !== user.id && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-purple-600">
                  <button onClick={() => router.push(`/account/profile/${userId}`)}>
                    <img
                      src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/${avatarUrl}`}
                      alt="Profile Icon"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </button>
                </div>
              )}

              {/* Message content */}
              <div className="flex flex-col w-fit max-w-[70%]">
                <div className="font-medium mb-1">
                  {m.sender_id === user.id ? "You" : username}
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    m.sender_id === user.id
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="prose prose-base dark:prose-invert max-w-none">
                    {m.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Chat Input Box (Fixed at the bottom) */}
      <div className="shrink-0 bg-white border-gray-200 pb-[56px] md:pb-0">
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}