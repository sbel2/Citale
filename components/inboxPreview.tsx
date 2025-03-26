"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from 'app/lib/definitions';
import Image from 'next/image';

interface InboxPreviewProps {
  userId: string;
}

interface ChatMessage {
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: string;
}

interface UserDetails {
  id: string;
  username: string;
  avatar_url: string;
  message?: string;
}

const InboxPreview: React.FC<InboxPreviewProps> = ({ userId }) => {
  const router = useRouter();
  const [messengerDetails, setMessengerDetails] = useState<UserDetails[]>([]);

// get the latest message
  const handleDisplayMessage = async () => {
    setMessengerDetails([]);
    const { data, error } = await supabase
      .from('chats')
      .select('sender_id, receiver_id, content, sent_at')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error.message);
      return;
    }

    if (data && data.length > 0) {
      // get the latest message among different people
      const latestMessages = data.reduce((acc: Record<string, ChatMessage>, message) => {
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        if (!acc[otherUserId] || new Date(message.sent_at) > new Date(acc[otherUserId].sent_at)) {
          acc[otherUserId] = message;
        }
        return acc;
      }, {} as Record<string, ChatMessage>);

      const latestMessagesArray = Object.values(latestMessages);

      // get user profile
      const userDetailsPromises = latestMessagesArray.map(async (message) => {
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', otherUserId)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError.message);
          return null;
        }

        return {
          ...userData,
          message: message.content,
        } as UserDetails;
      });

      const userDetails = await Promise.all(userDetailsPromises);
      setMessengerDetails(userDetails.filter(Boolean) as UserDetails[]); 
    } else {
      console.log('No messages found.');
    }
  };

  useEffect(() => {
    handleDisplayMessage();
  }, [userId]);

  return (
    <div className="border-t bg-white">
      <div className="space-y-0">
        {messengerDetails.map((user) => (
          <div
            key={user.id}
            className="flex items-center p-4 bg-white hover:bg-gray-200 transition-shadow cursor-pointer"
            onClick={() => router.push(`/inbox/${user.id}`)} 
          >
            {/* user avatar */}
            <div className="transform translate-x-4 w-12 h-12 rounded-full overflow-hidden shrink-0">
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/${user.avatar_url}` || `${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/avatar.png`} // 如果沒有頭像，使用預設頭像
                alt={user.username}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>

            {/* username and message */}
            <div className="transform translate-x-4 ml-4 flex-1">
              <div className="font-medium text-gray-900">{user.username}</div>
              <div className="text-sm text-gray-500 truncate">{user.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InboxPreview;