"use client";

import React, { useEffect,useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PostComponent from "@/components/postComponent"; 
import styles from "./card.module.css";
import Image from "next/image";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Post } from "@/app/lib/types";
import { useRouter } from "next/navigation";

const Card: React.FC<{ post: Post }> = ({ post }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.title = post.title;
    } else {
      document.title = "Citale | Explore Boston";
    }
  
    return () => {
      document.title = "Citale | Explore Boston"; // Cleanup on unmount
    };
  }, [isOpen, post.title]);

  const handleClick = () => {
    window.history.pushState(null, '', `/post/${post.post_id}`);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false); // Close the post dialog or component
    router.back();
};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open !== isOpen) {
        setIsOpen(open);
        if (!open) {
          handleClose();
        }
      }
    }}>
      <DialogTrigger asChild>
        <div onClick={handleClick} className="cursor-pointer">
          <div className={styles['image-container']}>
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${post.imageUrl[0]}`}
              alt={post.title}
              width={300}
              height={200}
              className="transition-transform duration-500 ease-in-out transform"
            />
            <div className={styles['overlay']}></div>
          </div>
            <div className="px-2 py-3">
              <div className="text-sm sm:text-base mb-1 2xl:mb-2 line-clamp-3 text-black">
                {post.title}
              </div>
            </div>
        </div>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <VisuallyHidden>
          <DialogTitle>{post.title}</DialogTitle>
          <DialogDescription>
          {post.description}
        </DialogDescription>
        </VisuallyHidden>
        <PostComponent post={post} context="popup"/>
        <DialogClose 
          onClick={handleClose}
          aria-label="Close"
        >
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default Card;
