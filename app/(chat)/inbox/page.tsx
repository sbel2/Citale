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
    <div className="min-h-screen bg-white">
      <div className="bg-white">
        <div className="bg-white">
          <h1 className="text-2xl font-bold p-6 mb-4">Inbox</h1>
        </div>
        <InboxPreview userId={user.id} />
      </div>
    </div>
  );
}