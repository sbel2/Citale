
import React from "react";
import { supabase } from "@/app/lib/definitions";
import { useAuth } from 'app/context/AuthContext';
import { Post } from "@/app/lib/types";


interface DeletePopupProps {
    posts: Post[];
    postStatus: string;
    postId: number;
    resetPosts: (updatedPosts: Post[]) => void;
    togglePopup: () => void;
}

export default function DeletePopup({ posts, postStatus, postId, resetPosts, togglePopup }: DeletePopupProps) {
    const { user, logout } = useAuth();

    const deletePost = async () => {
        let postTable: string;
        let postBucket: string;

        switch(postStatus) {
            case "draft":
                postTable = "drafts";
                postBucket = "drafts"
                break
            case "post":
                postTable = "posts";
                postBucket = "posts";
                break
            default: 
                throw new Error("Invalid postStatus value")
        }

        const {data} = await supabase
        .from(postTable)
        .select('mediaUrl, is_video')
        .eq('post_id', postId)
        .single()

        const mediaUrls = Array.isArray(data?.mediaUrl) ? data.mediaUrl : [data?.mediaUrl].filter(Boolean);

        // delete media path
        let deleteMediaPaths: string[] = [];
    
        if (data?.is_video === true) {
            deleteMediaPaths = mediaUrls.map(url => `videos/${url}`);
        } else {
            deleteMediaPaths = mediaUrls.map(url => `images/${url}`);
        }

        if (deleteMediaPaths.length > 0) {
          const { error: storageError } = await supabase.storage
              .from(postBucket)
              .remove(deleteMediaPaths);
  
          if (storageError) {
              console.error("Error deleting media:", storageError.message);
              return;
          }
        }
  

        const { error } = await supabase
        .from(postTable)
        .delete()
        .match({post_id: postId, user_id: user?.id})
        

        const updatedPosts = posts.filter(post => post.post_id !== postId);
        resetPosts(updatedPosts);
        togglePopup();

        if (error) {
        console.error("Error deleting row:", error.message);
        } else {
        console.log("Post deleted successfully!");
        }
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h1 className="text-md text-black-600 mb-6">
            Are you sure you want to delete this {postStatus}?
            </h1>
            <h2 className="text-sm text-black-600 mb-6">
            When a {postStatus} is deleted, it&apos;s gone forever!
            </h2>
            <div className="flex justify-center gap-6">
              <button
                className="bg-[#fd0000] hover:bg-[#fd0000] text-white px-4 py-2 rounded mr-2"
                onClick={deletePost}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                onClick={togglePopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        
        
    )
}