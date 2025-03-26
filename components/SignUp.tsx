'use client';

import { useState } from 'react';
import { signUpUser } from 'app/actions/auth';
import Link from 'next/link';
import Image from 'next/image';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSignUp = async () => {
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }

    if (!email.endsWith('@bu.edu')) {
      setError('Only @bu.edu email addresses are allowed.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Use and Privacy Policy.');
      return;
    }

    try {
      await signUpUser({ email, password, username });
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative">
      <a
        href="/"
        aria-label="Go back home"
        className="absolute top-4 left-4 text-gray-800 dark:text-white ml-1"
      >
        &#x2190; Home
      </a>

      <div className="w-full h-full p-8 bg-white flex flex-col items-center justify-center md:h-[60%] md:w-[40%] rounded-lg md:border border-gray-200">
        <Link href="/" aria-label="Home" className="inline-block mb-6">
          <Image
            src="/citale_header.svg"
            alt="Citale Logo"
            width={140}
            height={50}
            priority
          />
        </Link>

        <h1 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Create an Account</h1>

        {success && (
          <p className="text-green-600 text-sm mb-4 text-center">
            Sign-up successful! Please check your email to confirm your account.
          </p>
        )}

        <form className="w-full flex flex-col" autoComplete="on">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email (Boston University Emails Only)"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type="text"
            name="username"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError(null);
            }}
            className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type={showPassword ? 'text' : 'password'}
            name="new-password"
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError(null);
            }}
            className="p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />

          {/* Show Password Toggle */}
          <label className="flex items-center mb-4 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => {
                setShowPassword(!showPassword);
                if (error) setError(null);
              }}
              className="mr-2"
            />
            Show Password
          </label>

          {/* Terms and Privacy Checkbox */}
          <label className="flex items-start gap-2 mb-4 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={() => {
                setAgreedToTerms(!agreedToTerms);
                if (error) setError(null);
              }}
              className="mt-1"
              required
            />
            <span>
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 underline">Terms of Use</Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</Link>.
            </span>
          </label>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
            disabled={!agreedToTerms || password !== confirmPassword && confirmPassword.length > 0}
            className={`p-2 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !agreedToTerms || password !== confirmPassword && confirmPassword.length > 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Sign Up
          </button>

           {password !== confirmPassword && confirmPassword.length > 0 && (
            <p className="mt-4 text-sm text-red-600 text-center">Passwords do not match</p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}

          <p className="mt-4 text-center">
            Already have an account?{' '}
            <Link href="/log-in" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
