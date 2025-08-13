"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // Import Supabase client
      const { supabase } = await import('@/lib/supabaseClient');
      console.log("Signing up with Supabase directly from client");
      
      // Step 1: Sign up the user
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user'
          }
        }
      });
      
      if (signupError) {
        console.error("Supabase signup error:", signupError);
        setError(signupError.message || "Registration failed");
        setLoading(false);
        return;
      }
      
      console.log("Signup successful:", signupData);
      
      // Step 2: Immediately sign in the user (bypassing email verification)
      if (signupData.user?.id) {
        try {
          const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signinError) {
            console.error("Auto signin error:", signinError);
            // Even if auto signin fails, signup was successful
            setSuccess("Account created successfully! Please log in manually.");
            setTimeout(() => {
              router.push("/login");
            }, 2000);
            setLoading(false);
            return;
          }
          
          console.log("Auto signin successful:", signinData);
          
          // Step 3: Update user metadata if needed
          try {
            const metadataResponse = await fetch("/api/update-user-metadata", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                userId: signinData.user.id,
                fullName: fullName 
              }),
            });
            
            console.log("Metadata update response:", await metadataResponse.json());
          } catch (metadataError) {
            console.warn("Couldn't update user metadata, but signup succeeded:", metadataError);
          }
          
          // Step 4: Set user cookie for server components
          try {
            const cookieResponse = await fetch('/api/set-user-cookie', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                session: {
                  user: {
                    ...signinData.user,
                    user_metadata: { full_name: fullName, role: 'user' }
                  }
                } 
              }),
            });
            
            if (!cookieResponse.ok) {
              console.error('Failed to set user cookie');
            } else {
              console.log('User cookie set successfully');
            }
          } catch (cookieError) {
            console.error('Error setting user cookie:', cookieError);
          }
          
          // Success! User is now signed in
          setSuccess("Account created and signed in successfully! Redirecting...");
          setTimeout(() => {
            window.location.href = "/search";
          }, 2000);
          
        } catch (signinErr) {
          console.error("Unexpected signin error:", signinErr);
          setSuccess("Account created successfully! Please log in manually.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } else {
        setError("Signup succeeded but no user ID returned");
      }
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#18176b] mb-2">Create Account</h1>
            <p className="text-gray-600">Join us and start booking your flights</p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cd7e0f] focus:border-[#cd7e0f] transition text-gray-900"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-[#cd7e0f] text-white py-3 rounded-lg font-semibold hover:bg-[#cd7e0f]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-[#cd7e0f] hover:text-[#cd7e0f]/90 font-semibold">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 