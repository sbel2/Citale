'use client'

import React, { useState, useEffect } from 'react';
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

        console.log(receivedData)

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
      setMessages(combinedMessages); // Store the combined sorted messages in state
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
  

  // Listen for new messages where you are the sender OR the receiver
  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel('chat_channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chats',
            filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`, // Listen for messages where you are sender OR receiver
          },
          (payload) => {
            const message = payload.new as ChatMessage; // Cast to ChatMessage
            setMessages((prevMessages) => [...prevMessages, message]); // Add new message to the list
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  // Fetch messages on component mount
  useEffect(() => {
    fetchChatMessages();
    fetchProfile();
  }, [user, userId]);

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

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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