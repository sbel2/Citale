'use client'

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/definitions'; // Ensure correct import
import { useAuth } from 'app/context/AuthContext';
import ChatInput from '@/components/TalebotChat';

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
  const [submit, setSubmit] = useState(false)
  const previousMessagesRef = useRef<ChatMessage[]>([]);


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

  const fetchProfile = async() =>{
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', userId)
      .single();
      setUsername(data?.username || '');
      setAvatarUrl(data?.avatar_url || '');
  }
  
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
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Re-run when `messages` changes

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {user && messages.length > 0 &&(
        messages.map((m, index) => (
          <div key={index} className={`flex gap-3 max-w-3xl mx-auto ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
          {/* Display sender/receiver avatar */}
          {m.sender_id !== user.id && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-purple-600">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/${avatarUrl}`}
                alt="Profile Icon"             
                width={40}             
                height={40}             
                className="rounded-full"             
              />
            </div>
          )}
        
          {/* Message content */}
          <div className="flex flex-col max-w-[70%]">
            <div className="font-medium mb-1">
              {m.sender_id === user.id ? 'You' : username}
            </div>
            <div className={`p-3 rounded-lg ${
              m.sender_id === user.id ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="prose prose-base dark:prose-invert max-w-none">
                {m.content}
              </div>
            </div>
          </div>
        </div>
        ))
      )}
      </div>
      {/* Chat Input */}
      <div className="text-center p-4">
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}