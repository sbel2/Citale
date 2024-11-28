import { supabase } from '@/app/lib/definitions';

export const signUpUser = async ({ email, password }: { email: string; password: string }) => {
  // Call the sign-up function
  const { data, error } = await supabase.auth.signUp({ email, password });

  // Check for explicit "User already registered" error
  if (error) {
    if (error.message.includes('User already registered')) { 
      throw new Error('This email is already registered. Please proceed to sign in.');
    }
    else if(error.code == "email_not_confirmed"){
      throw new Error('This email has not been verified. Please check your inbox.');
    }
    throw new Error(error.message);
  }
  
  return data;
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

  console.log('Password updated successfully for user:', data);
  return { success: true, message: 'Password updated successfully' };
}