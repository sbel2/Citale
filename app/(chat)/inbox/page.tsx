'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/definitions'; // Ensure correct import
import { useAuth } from 'app/context/AuthContext';
import InboxPreview from '@/components/inboxPreview';

export default function Inbox() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return <div></div>; 
  }

  return (
    <div className="border-t border-gray-200 p-6 pb-safe">
      <h1 className="text-2xl font-bold mb-6">Inbox</h1>
      <InboxPreview userId={user.id} />
    </div>
  );
}