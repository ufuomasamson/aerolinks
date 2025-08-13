import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase on the server side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xmzqenwntbdlcskkleim.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtenFlbndudGJkbGNza2tsZWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjQ3ODksImV4cCI6MjA3MDM0MDc4OX0.9BLSC23oiLGYZohnvY6H0G2kJc3AV9mLz4SyHnJ8pJ0'
);

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    
    console.log("Server-side signup attempt for:", email);
    
    // Basic validation
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }
    
    // Step 1: Sign up the user
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          role: 'user'
        }
      }
    });
    
    if (signupError) {
      console.error("Server-side signup error:", signupError);
      return NextResponse.json({ error: signupError.message }, { status: 400 });
    }
    
    console.log("Server-side signup successful");
    
    // Step 2: Immediately sign in the user (bypassing email verification)
    let session = null;
    if (signupData.user?.id) {
      try {
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signinError) {
          console.error("Auto signin error:", signinError);
          // Return success but indicate manual login needed
          return NextResponse.json({
            success: true,
            user: {
              id: signupData.user?.id,
              email: signupData.user?.email
            },
            message: "Account created successfully. Please log in manually.",
            requiresManualLogin: true
          });
        }
        
        console.log("Auto signin successful:", signinData);
        session = signinData.session;
        
      } catch (signinErr) {
        console.error("Unexpected signin error:", signinErr);
        // Return success but indicate manual login needed
        return NextResponse.json({
          success: true,
          user: {
            id: signupData.user?.id,
            email: signupData.user?.email
          },
          message: "Account created successfully. Please log in manually.",
          requiresManualLogin: true
        });
      }
    }
    
    // Return success with user data and session
    return NextResponse.json({
      success: true,
      user: {
        id: signupData.user?.id,
        email: signupData.user?.email
      },
      session: session,
      message: "Account created and signed in successfully"
    });
    
  } catch (err) {
    console.error("Unexpected server-side signup error:", err);
    return NextResponse.json({ 
      error: "An unexpected error occurred during signup" 
    }, { status: 500 });
  }
}
