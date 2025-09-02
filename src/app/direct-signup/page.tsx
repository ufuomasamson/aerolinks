"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DirectSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setDebugInfo(null);

    try {
      // Step 1: Use the Supabase REST API directly for signup
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvjzlpambwkbqwsbxeym.supabase.co';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2anpscGFtYndrYnF3c2J4ZXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjU0ODksImV4cCI6MjA3MjM0MTQ4OX0.k8LL8nPZN47_wWh_TTO3VP-igr44HOAmh6Mn4lpLUzM';
      
      console.log("Signing up with direct REST API call");
      
      // Basic signup with minimal data
      const signupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            full_name: fullName
          }
        })
      });
      
      const signupData = await signupResponse.json();
      
      setDebugInfo({
        signupStatus: signupResponse.status,
        signupData
      });
      
      if (!signupResponse.ok) {
        throw new Error(signupData.error_description || signupData.error || "Signup failed");
      }
      
      console.log("Signup successful:", signupData);
      
      // Step 2: Immediately sign in the user (bypassing email verification)
      try {
        console.log("Attempting auto signin after signup");
        
        const signinResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            email,
            password
          })
        });
        
        const signinData = await signinResponse.json();
        
        setDebugInfo(prev => ({
          ...prev,
          signinStatus: signinResponse.status,
          signinData
        }));
        
        if (signinResponse.ok && signinData.access_token) {
          console.log("Auto signin successful:", signinData);
          
          // Success! User is now signed in
          setSuccess("Account created and signed in successfully! Redirecting...");
          setTimeout(() => {
            window.location.href = "/search";
          }, 2000);
        } else {
          console.error("Auto signin failed:", signinData);
          setSuccess("Account created successfully! Please log in manually.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
        
      } catch (signinErr) {
        console.error("Unexpected signin error:", signinErr);
        setSuccess("Account created successfully! Please log in manually.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
      
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#18176b] mb-2">Direct Signup</h1>
            <p className="text-gray-600">Create account using direct API calls</p>
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
          
          {debugInfo && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
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
