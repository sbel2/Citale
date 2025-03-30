import { createClient } from '@/supabase/client';
import { RealtimeChannel } from '@supabase/realtime-js';

export const supabase = createClient();

// Example type definitions (optional)
export type UserCredentials = {
  email: string;
  password: string;
};
