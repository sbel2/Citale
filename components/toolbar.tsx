import React from "react";
import { useAuth } from 'app/context/AuthContext';

const Toolbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white fixed md:top-0 md:left-0 md:h-full md:w-64 w-full bottom-0 h-16 flex md:flex-col items-start md:items-stretch shadow-md z-50">
      <a
        href="/"
        className="p-4 w-full text-center md:text-left hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        Home
      </a>
      <a
        href="#"
        className="p-4 w-full text-center md:text-left hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        Post
      </a>
      <a
        href="#"
        className="p-4 w-full text-center md:text-left hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        Swipe
      </a>
      <a
        href="#"
        className="p-4 w-full text-center md:text-left hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        Chat
      </a>
      <a
        href="/log-in"
        className="p-4 w-full text-center md:text-left hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        Profile
      </a>
    </nav>
  );
};

export default Toolbar;
