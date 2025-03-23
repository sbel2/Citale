import { supabase } from '@/app/lib/definitions';
import { createClient } from '@/supabase/server';

export const signUpUser = async ({ email, password, username }: { email: string; password: string; username: string }) => {
  if (!email.endsWith('@bu.edu')) {
    throw new Error('Only emails from bu.edu are allowed');
  }
  // Call the sign-up function
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password, 
    options:{
      data:{
        username: username,
        avatar_url: 'avatar.png',
        avatar_url_small: 'avatar.png'
      },
    },
  });

  // Check for explicit "User already registered" error
  if (error) {
    if (error.message.includes('User already registered')) { 
      throw new Error('This email is already registered. Please proceed to sign in.');
    }
    else if(error.message.includes("Email not confirmed")){
      throw new Error('Please check your inbox to verify your email.');
    }
    throw new Error(error.message);
  }
};

export const signInUser = async ({ email, password }: { email: string; password: string }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    // Custom error handling based on specific messages
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Password or Email incorrect. Please try again.');
    } 
    throw new Error(error.message);
    
  }
  return data;
};

export async function resetPasswordByEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    console.error('Failed to reset password:', error.message);

    // Example of handling a specific error case
    if (error.message === 'Email not found') {
      return { success: false, message: 'No account found with that email. Please try again.' };
    }

    // Generic error fallback
    return { success: false, message: 'Failed to reset password. Please try again.' };
  }
  
  return { success: true, message: 'Password reset email sent successfully. Please check your email.' };
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error('Failed to update password:', error);
    return { success: false, message: error.message };
  }
  return { success: true, message: 'Password updated successfully' };
}

export async function getUserId(){
  const {data, error}  = await supabase.auth.getUser()
  if(error){
    console.error('Error fetching user id', error.message)
    return null;
  }
  return data?.user.id || null;
}

export async function addingProfile(userId: string, username: string, email: string){
  const {data, error} = await supabase
    .from('profiles')
    .upsert([
      {
        id: userId,
        username: username,
        email: email
      }
    ]);
  if(error){
    console.error('Error updating profile:', error.message)
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, username: string, email: string, fullName: string, avatarUrl: string, avatarUrlSmall:string, website: string, bio: string){
  // update user profile
  const {data, error} = await supabase
    .from('profiles')
    .update({
      username: username,
      email: email,
      full_name: fullName,
      avatar_url: avatarUrl,
      avatar_url_small: avatarUrlSmall,
      website: website,
      bio: bio
    })
    .eq('id', userId);
  // if error, such as unique value constraint, return error message
  if(error){
    console.error('Error updating profile:', error.message)
    return { success: false, message: error.message };
  }
  return { success: true, message: 'User Profile updated successfully' };
}