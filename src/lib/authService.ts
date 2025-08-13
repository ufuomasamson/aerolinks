import { supabase, TABLES } from '@/lib/supabaseClient';

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    return false;
  }
}

// Get current user information
export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session?.user) {
      return null;
    }
    
    const user = data.session.user;
    
    // Check if the user has a role in metadata
    let role = user.user_metadata?.role || 'user';
    
    // Or check the user_roles table
    if (!role || role === 'user') {
      const { data: roleData } = await supabase
        .from(TABLES.USER_ROLES)
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      if (roleData?.role) {
        role = roleData.role;
      }
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0],
      role: role
    };
  } catch (error) {
    return null;
  }
}

// Sign up a new user
export async function signUp(
  email: string,
  password: string,
  name: string
) {
  try {
    // Step 1: Create the user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'user'
        }
      }
    });
    
    if (error) throw error;
    
    // Step 2: Immediately sign in the user (bypassing email verification)
    let session = null;
    if (data.user) {
      try {
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signinError) {
          console.error("Auto signin error:", signinError);
          // Even if auto signin fails, signup was successful
          return { 
            success: true, 
            message: "Account created successfully. Please log in manually.",
            requiresManualLogin: true
          };
        }
        
        console.log("Auto signin successful:", signinData);
        session = signinData.session;
        
        // Create a record in user_roles table
        await supabase
          .from(TABLES.USER_ROLES)
          .insert({
            user_id: data.user.id,
            role: 'user',
            created_at: new Date().toISOString()
          });
        
      } catch (signinErr) {
        console.error("Unexpected signin error:", signinErr);
        return { 
          success: true, 
          message: "Account created successfully. Please log in manually.",
          requiresManualLogin: true
        };
      }
    }
    
    return { 
      success: true, 
      session: session,
      message: "Account created and signed in successfully"
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to create account'
    };
  }
}

// Sign in a user
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Return user information
    const user = data.user;
    
    // Get role information
    let role = user?.user_metadata?.role || 'user';
    
    if (user) {
      const { data: roleData } = await supabase
        .from(TABLES.USER_ROLES)
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      if (roleData?.role) {
        role = roleData.role;
      }
    }
    
    return {
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.user_metadata?.name || user?.email?.split('@')[0],
        role: role
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Invalid email or password'
    };
  }
}

// Sign out the current user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to sign out'
    };
  }
}

// Update user profile
export async function updateProfile(name: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: { name }
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to update profile'
    };
  }
}

// Change user password
export async function changePassword(
  oldPassword: string,
  newPassword: string
) {
  try {
    // In Supabase, we need to first authenticate with the old password
    // This is typically done in the UI flow, so here we just update the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to change password'
    };
  }
}

// Send password recovery email
export async function sendPasswordRecovery(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://your-domain.com/reset-password'
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to send password recovery email'
    };
  }
}
