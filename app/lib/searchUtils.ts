import { createClient } from '@/supabase/client';
import { Post, UserProfile } from './types';
import { validate as isUUID } from 'uuid'; 

const supabase = createClient();

export async function handlePostSearch(query: string): Promise<Post[] | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or('endDate.is.null,endDate.gte.' + new Date().toISOString().split('T')[0])
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error);
      return null;
    }
    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

export async function handleUserSearch(query: string): Promise<UserProfile[] | null> {
  try {
    const conditions = [
      `username.ilike.%${query}%`,
      `full_name.ilike.%${query}%`,
      `bio.ilike.%${query}%`,
    ];
    if (isUUID(query)) {
      conditions.push(`id.eq.${query}`);
    }


    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, full_name, bio')
      .or(conditions.join(','));

    if (error) {
      console.error('Error fetching users:', error);
      return null;
    }
    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}
