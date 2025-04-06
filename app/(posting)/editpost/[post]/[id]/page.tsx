'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "app/context/AuthContext";
import ShareForm from "@/components/share/shareForm";
import { useMedia } from "app/context/MediaContext";
import { supabase } from "@/app/lib/definitions";
import Image from "next/image";
import Link from "next/link";

export default function EditPostPage({ params }: {  params: { post: string, id: string } }) {
    const { post: postType, id: post_id } = params;
    const postTable = postType == "post" ? "posts" : postType == "draft" ? "drafts" : "";
    const { user } = useAuth();
    const { uploadedFiles, setUploadedFiles } = useMedia();
    const router = useRouter();
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isVideo, setIsVideo] = useState(false);
    const [videoType, setVideoType] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        post_id: post_id,
        title: "",
        description: "",
        location: "",
        category: "",
        price: "",
        user_id: user?.id || null,
        mapUrl: "",
        season: "",
        startDate: null,
        endDate: null,
        mediaUrl: [] as string[],
    });

    const fetchPrevData = async () => {
        const { data, error } = await supabase
        .from(postTable)
        .select("*")
        .eq("post_id", post_id)
        .single();

        if (data){
            setFormData({
                post_id: post_id,
                title: data.title || "",
                description: data.description || "",
                location: data.location || "",
                category: data.category || "",
                price: data.price || "",
                user_id: user?.id || null,
                mapUrl: data.mapUrl || "",
                season: data.season || "",
                startDate: data.startDate || null,
                endDate: data.endDate || null,
                mediaUrl: data.mediaUrl || [],
            });

            setIsVideo(data.is_video);

            if (data.mediaUrl && data.mediaUrl.length > 0) {
                setPreviewUrls(data.mediaUrl);
            }
        }
    }

    useEffect (() => {
        fetchPrevData();
    },[post_id])

    const handleUpdatePost = async () => {
        try {

            const postPayload = {
                ...formData,
            };

            const { error } = await supabase.from("posts")
            .update({
                title: formData.title,
                description: formData.description,
                location: formData.location,
                category: formData.category,
                price: formData.price,
                mapUrl: formData.mapUrl,
                season: formData.season,
                startDate: formData.startDate,
                endDate: formData.endDate,
                mediaUrl: formData.mediaUrl,
              })
              .eq("post_id", post_id);

              console.log(post_id);

            if (error) throw error;
            router.push(`/account/profile/${user?.id}`); // ✅ Redirect to dynamic profile page
        } catch (err) {
            alert("There was an error submitting your post.");
        }
    };

    return (
        <>
        <header className="shrink-0 border-b border-gray-200 bg-white lg:hidden">
            <div className="mx-auto px-4 py-2 flex justify-between items-center">
            <Link
            href={`/account/profile/${formData.user_id}`} // Use template string inside {}
            aria-label="Back to profile"
            className="text-gray-800 dark:text-white ml-1 left-0"
            >
                &#x2190; Back to Profile
            </Link>
            <Link href="/" aria-label="Home" className="inline-block mt-1">
                <Image
                src="/citale_header.svg"
                alt="Citale Logo"
                width={90}
                height={30}
                priority
                />
            </Link>
            </div>
        </header>

        <div className="w-full hidden lg:flex justify-between items-center">
            <Link
                href={`/account/profile/${formData.user_id}`} // Use template string inside {}
                aria-label="Back to profile"
                className="text-gray-800 dark:text-white ml-1 left-0"
            >
                &#x2190; Back to Profile
            </Link>
        </div>
          {isVideo ? (
            <div className="flex flex-col md:flex-row-reverse items-start md:gap-10">
              <div className="max-w-[250px] mt-10 md:mt-32 mr-10">
                <video key={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/${postTable}/videos/${formData.mediaUrl[0]}`} controls className="w-[50%] md:w-full rounded-lg">
                  <source src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/${postTable}/videos/${formData.mediaUrl[0]}`} type={videoType ?? "video/mp4"} />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="w-full md:w-[70%] mt-6">
                <ShareForm formData={formData} setFormData={setFormData} />
                <button
                  onClick={handleUpdatePost}
                  className="w-[20%] md:w-[10%] bg-red-600 text-white py-2 mt-4 rounded-md hover:bg-red-700 transition mt-8 mb-[128px]"
                >
                  Post
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start">
                <div className="justify-left flex flex-col items-start mt-10">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-1 md:p-4 bg-gray-100 rounded-md">
                        {/* 📌 Image Preview Grid */}
                        {formData.mediaUrl?.map((file, index) => (
                            <div
                                key={index} // Add a unique key for each image
                                className="relative w-24 h-24 md:w-36 md:h-36 rounded-lg overflow-hidden shadow-md border"
                            >
                                <Image
                                src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/${postTable}/images/${file}`}
                                alt={`post image ${index + 1}`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full mt-6">
                <ShareForm formData={formData} setFormData={setFormData} />
                <button
                    onClick={handleUpdatePost}
                    className="w-[20%] md:w-[10%] bg-red-600 text-white py-2 mt-4 rounded-md hover:bg-red-700 transition mt-8 mb-[128px]"
                >
                    Post
                </button>
                </div>
            </div>
          )}
        </>
      )
    }