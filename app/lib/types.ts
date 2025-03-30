// all fields are optional and not requried to be read in for code
export interface Post {
    post_id: number;
    title: string;
    description: string;
    is_video: boolean;
    mediaUrl: string[];
    mapUrl: string;
    thumbnailUrl: string;
    created_at: string;
    category?: string;
    user_id?: string;
    post_action: string;
    favorite_count: number;
    is_deal: boolean;
  }
  
  export interface UserProfile {
    username: string;
    avatar_url: string;
    id: string;
    full_name: string;
    bio: string;
  }