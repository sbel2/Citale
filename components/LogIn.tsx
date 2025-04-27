"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type LogInFormProps = {
  onSignIn: (email: string, password: string) => Promise<{ status: number; message?: string } | undefined>;
};

export default function LogInForm({ onSignIn }: LogInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // For toggling password visibility
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const router = useRouter();

  const sendTestEmail = async (userEmail: string) => {
    try {
      const response = await fetch('/api/chat/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to send email:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Reset message on new submit attempt

    if (email === "tsehou26@bu.edu") {
      const emailResponse = await sendTestEmail(email);
      if (!emailResponse?.success) {
        console.log("Email failed to send, but continuing with login");
      }
    }

    const response = await onSignIn(email, password);
    if (!response) {
      setMessage({ text: "No response from server. Please try again later.", type: "error" });
      return;
    }
    if (response.status === 200) {
      setMessage({ text: "Sign-in successful! Redirecting...", type: "success" });
      router.push("/");
    } else if (response.status === 400) {
      setMessage({ text: "Password or Email incorrect. Please try again.", type: "error" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative">
      {/* Go Back Button */}
      <a href="/" aria-label="Go back home" className="absolute top-4 left-4 text-gray-800 dark:text-white ml-1">
        &#x2190; Home
      </a>

      {/* Form Container */}
      <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center md:h-[60%] md:w-[40%] rounded-lg md:border border-gray-200">
        {/* Logo */}
        <Link href="/" aria-label="Home" className="inline-block mb-6">
          <Image src="/citale_header.svg" alt="Citale Logo" width={140} height={50} priority />
        </Link>

        {/* Login Form */}
        <h1 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Log in</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <label className="flex items-center mt-2 mb-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              Show Password
            </label>
          </div>
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Log in
          </button>

          {/* Forgot Password */}
          <a href="/account/reset-password" className="text-blue-600 hover:underline mt-4 text-center">
            Forgot password?
          </a>

          {/* Sign up link */}
          <p className="mt-4 text-center">
            Don&apos;t have an account?{" "}
            <a href="/account/sign-up" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </form>

        {/* Display success or error message */}
        {message && (
          <p className={`mt-4 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
