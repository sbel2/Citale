"use client"

import Header from "@/components/header";
import PostForm from "@/components/PostForm";
import { Inter } from "next/font/google";
import '../globals.css';
import Script from 'next/script';
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showPostForm, setPostFormDisplay] = useState(false);

  const handlePostClick = () => {
    setPostFormDisplay(!showPostForm);
    console.log("AH")
    console.log(showPostForm);
  };


  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes = "any"/>
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Things to do in Boston" />
        <title>Citale | Explore Boston</title>
        {/* Hotjar Script */}
        <Script id="hotjar-script" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:5052807,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      </head>
      <body className="${inter.className}" >
        <Header handlePostAction={ handlePostClick }/>
        <main className="bg-gray-951 z-[1]">
        <PostForm showPostForm={ showPostForm } />
        {children}
        </main>
      </body>
    </html>
  );
}