import React, { useEffect,useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@/components/ui/dialog";
import PostComponent from "@/components/postComponent"; 
import styles from "./card.module.css";
import Image from "next/image";

interface CardProps {
  post: {
    post_id: number;
    title: string;
    description: string;
    imageUrl: string[];
    like_count: number;
    created_at: string;
    user_id: number;
  };
}

const Card: React.FC<CardProps> = ({ post }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.title = post.title; // Update the document title
    } else {
      document.title = "Citale | Explore Boston"; // Revert to the default title when closed
    }
  }, [isOpen, post.title]);

  const handleClick = () => {
    window.history.pushState(null, '', `/post/${post.post_id}`);
    setIsOpen(true);
  };

  const handleClose = () => {
    window.history.pushState(null, '', '/');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
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

      <DialogContent className="" onOpenAutoFocus={(e) => e.preventDefault()}>
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
