"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMedia } from "app/context/MediaContext";
import { useAuth } from "app/context/AuthContext";
import ImagePreview from "@/components/share/imagePreview";
import ShareForm from "@/components/share/shareForm";
import { uploadFilesToBucket } from 'app/lib/fileUtils';
import { supabase } from "@/app/lib/definitions";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import Link from "next/link";

export default function SharePage() {
    const { uploadedFiles, setUploadedFiles } = useMedia();
    const { user } = useAuth();
    const router = useRouter();
    const [postId, setPostId] = useState<string>("");
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isVideo, setIsVideo] = useState(false);
    const [videoType, setVideoType] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        post_id: postId,
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

    // ✅ Generate unique post_id
    async function generatePostId(): Promise<string> {
        let newPostId = uuidv4();
        let isUnique = false;

        while (!isUnique) {
            const { data } = await supabase
                .from("posts")
                .select("post_id")
                .eq("post_id", newPostId)
                .single();

            if (!data) {
                isUnique = true;
            } else {
                newPostId = uuidv4();
            }
        }
        setPostId(newPostId);
        return newPostId;
    }

    useEffect(() => {
        generatePostId();
    }, []);

    // ✅ Ensure user_id updates when user changes
    useEffect(() => {
        if (user) {
            setFormData((prevState) => ({
                ...prevState,
                user_id: user.id,
            }));
        }
    }, [user]);

    useEffect(() => {
        if (!uploadedFiles || uploadedFiles.length === 0) {
            router.replace("/upload");
            return;
        }

        try {
            setPreviewUrls(uploadedFiles.map((file) => file.name));

            const firstFile = uploadedFiles[0];
            if (firstFile?.type?.startsWith("video/")) {
                setIsVideo(true);
                setVideoType(firstFile.type);
            } else {
                setIsVideo(false);
            }
        } catch (err) {
            setError("Failed to process media.");
        }
    }, [uploadedFiles, router]);


    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);

        try {
            if (uploadedFiles.length === 0) {
                alert("Please upload media.");
                return;
            }

            // ✅ Determine if a video is included
            const hasVideo = uploadedFiles.some((file) => file.type.startsWith("video/"));

            // Upload media to Supabase
            const { uploadedFiles: storedFiles } = await uploadFilesToBucket(
                uploadedFiles.map((file) => file.name),
                "post",
                postId
            );

            const thumbnailUrl = hasVideo ? storedFiles[0] : null;

            const postPayload = {
                ...formData,
                post_id: postId,
                mediaUrl: storedFiles,
                user_id: user?.id, 
                created_at: new Date().toISOString(),
                is_video: hasVideo,
                post_action: "post", 
                thumbnailUrl: thumbnailUrl
            };

            const { error } = await supabase.from("posts").insert([postPayload]);

            if (error) throw error;
            router.push(`/account/profile/${user?.id}`); // ✅ Redirect to dynamic profile page
        } catch (err) {
            alert("There was an error submitting your post.");
        } finally {
            setLoading(false);
        }
    };


    if (error) {
        return <div className="text-center mt-10 text-red-500">{error}</div>;
    }

    return (
        <div className="flex flex-col h-[100dvh] bg-white">
        
            <header className="shrink-0 border-b border-gray-200 bg-white lg:hidden">
                <div className="mx-auto px-4 py-2 flex justify-between items-center">
                <a href="/upload" aria-label="Back to upload" className="text-gray-800 dark:text-white ml-1">
                    &#x2190; Back to upload
                </a>
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
                    <a href="/upload" aria-label="Back to upload" className="text-gray-800 dark:text-white ml-1 left-0">
                        &#x2190; Back to upload
                    </a>
            </div>

            {isVideo ? (
                <div className="flex flex-col md:flex-row-reverse items-start md:gap-10">
                    <div className="max-w-[250px] mt-10 md:mt-32 mr-10">
                        <video key={previewUrls[0]} controls className="w-[50%] md:w-full rounded-lg">
                            <source src={previewUrls[0]} type={videoType ?? "video/mp4"} />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="w-full md:w-[70%] mt-6">
                        <ShareForm formData={formData} setFormData={setFormData} />
                        <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-[20%] md:w-[10%] py-2 mt-4 rounded-md transition mt-8 mb-[128px] ${
                            loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                    >
                        {loading ? "Posting..." : "Post"}
                    </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-start">
                <div className="justify-left flex flex-col items-start mt-10">
                    <p className="text-lg font-lg text-left mb-2">Image editing</p>
                    <ImagePreview filesUpload={uploadedFiles} onFilesChange={setUploadedFiles} />
                </div>
                <div className="w-full mt-6">
                    <ShareForm formData={formData} setFormData={setFormData} />
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-[20%] md:w-[10%] py-2 mt-4 rounded-md transition mt-8 mb-[128px] ${
                            loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                    >
                        {loading ? "Posting..." : "Post"}
                    </button>
                </div>
                </div>
            )}
        </div>
    );
}
