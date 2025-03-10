'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'app/context/AuthContext';
import { supabase } from '@/app/lib/definitions';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Linkify from 'react-linkify';
import { Post } from '@/app/lib/types';
import styles from '@/components/postComponent.module.css'
import FollowingPopup from "./following/following";
import FollowerPopup from "./follower/follower";
import DeletePopup from '@/components/deletePopup';

const MasonryGrid = dynamic(() => import('@/components/MasonryGrid'), { ssr: false });

export default function ProfilePage({ params }: { params: { id: string } }) {
    const { id: userId } = params;
    const { user, logout } = useAuth();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [userAvatar, setUserAvatar] = useState<string>('avatar.png');
    const [fetchSuccess, setFetchSuccess] = useState<boolean>(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setloading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [deletePost, setDeletePost] = useState<boolean>(false);
    const [editPost, setEditPost] = useState<boolean>(false);
    const [managePostData, setManageData] = useState({id: 0, postAction: ""})
    const [displayCAtagory, setDisplayCAtagory] = useState<string>('Posts')
    const [following, setFollowing] = useState<boolean>(false);
    const [followingCount, setFollowingCount] = useState<number>(0);
    const [followersCount, setFollowersCount] = useState<number>(0);
    // open follow detail pop up
    const [isFollowingOpen, setIsFollowingOpen] = useState(false);
    const [isFollowerOpen, setIsFollowerOpen] = useState(false);
    // display buttons on profile pages
    const postButtons = ['Posts', 'Likes', 'Favs'];
    const postButtons_others = ['Posts']
    // const relationshipButtons = ['Following', 'Followers'];

    // Fetch user profile data from Supabase
    useEffect(() => {
        
        const fetchUserData = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('username, email, avatar_url, website, bio, full_name')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error.message);
                return;
            }
            setUserAvatar(data.avatar_url || 'avatar.png');  // Set avatar URL
            setUserProfile(data);  // Store the entire user profile
            setFetchSuccess(true);
            handleFetchUserPosts(userId);
        };

        fetchUserData();
        
    }, [userId]);

    const handleFetchUserPosts = async (userId: string) => {
        const { data, error } = await supabase
        .from("posts")
            .select("*")
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error || !data) {
            console.error('Error fetching post data:', error);
            setPosts([]);
            setloading(false);
            } 
        else {
            setPosts(data);
            setloading(false);
        }
    };

    const handleFetchUserDrafts = async (userId: string) => {
        const { data, error } = await supabase
        .from("drafts")
            .select("*")
            .eq('user_id', userId);
        if (error || !data) {
            console.error('Error fetching drafts data:', error);
            setPosts([]);
            setloading(false);
            } 
        else {
            setPosts(data);
            setloading(false);
        }
    };

    const handleFetchLikedPosts = async (userId: string) => {
        const { data, error } = await supabase
            .from('likes') // Assuming there's a 'likes' table
            .select('post_id')
            .eq('user_id', userId);
    
        if (error || !data) {
            console.error('Error fetching liked posts:', error);
            setPosts([]);
            setloading(false);
        } else {
            const likedPostIds = data.map((like) => like.post_id);
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .in('post_id', likedPostIds);
    
            if (postsError || !postsData) {
                console.error('Error fetching liked posts data:', postsError);
                setPosts([]);
                setloading(false);
            } else {
                setPosts(postsData);
                setloading(false);
            }
        }
    };

    const handleFetchFavoritePosts = async (userId: string) => {
        const { data, error } = await supabase
            .from('favorites') // Assuming there's a 'likes' table
            .select('post_id')
            .eq('user_id', userId);
    
        if (error || !data) {
            console.error('Error fetching favorited posts:', error);
            setPosts([]);
            setloading(false);
        } else {
            const FavoritedPostIds = data.map((like) => like.post_id);
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .in('post_id', FavoritedPostIds);
    
            if (postsError || !postsData) {
                console.error('Error fetching faved posts data:', postsError);
                setPosts([]);
                setloading(false);
            } else {
                setPosts(postsData);
                setloading(false);
            }
        }
    };

    const toggleDropdown = () => {
        setIsOpen((prevState) => !prevState)
    }

    const toggleDeletePopUp = () => {
        setDeletePost((prevState) => !prevState);
    }

    const managePost = (manageType: string, postId: number, postAction: string) => {
        if (manageType == "delete") {
            setManageData({
                id: postId,
                postAction: postAction,
            })
            toggleDeletePopUp();
        }
    }

    const resetPosts = (updatedPosts: Post[]) => {
        setPosts(updatedPosts);
    }
    //check if user entered a query and calling onsearch to fetch results
    const handleCategoryClick = async (option: string, userId: string) => {
        setDisplayCAtagory(option);
        if (option === 'Posts') {
            await handleFetchUserPosts(userId);
            if (isOpen) {
                toggleDropdown()
            }
        } else if (option === 'Likes') {
            await handleFetchLikedPosts(userId);
            if (isOpen) {
                toggleDropdown()
            }
        } else if (option === 'Favs') {
            await handleFetchFavoritePosts(userId);
            if (isOpen) {
                toggleDropdown()
            }
        // } else if (option === 'Drafts') {
        //     await handleFetchUserDrafts(userId);
        //     if (isOpen) {
        //         toggleDropdown()
        //     }
        }
    };
    
    const handleFollowButton = async () => {
        const {data, error}  = await supabase
        .from('relationships')
        .select('user_id, follower_id')
        .eq('user_id', user?.id) // the user that is logged in
        .eq('follower_id',userId); // the user that is displaying on this profile page

        if(data && data.length > 0){
            // unfollow
            setFollowing(true);
        } else {
            // follow
            setFollowing(false);
        }
    };

    useEffect(() => {

        const handleCalcFollowers = async () => {
            const { data, error } = await supabase
            .from('relationships')
            .select('user_id, follower_id')
            .eq('follower_id', userId);
    
            if (error) {
                console.error('Error fetching followers:', error.message);
            }
            if (data){
                setFollowersCount(data.length);
            }
            
        };
        const handleCalcFollowings = async () => {
            const { data, error } = await supabase
            .from('relationships')
            .select('user_id, follower_id')
            .eq('user_id', userId);
    
            if (error) {
                console.error('Error fetching followers:', error.message);
            }
            if (data){
                setFollowingCount(data.length);
            }
    
        };
        handleCalcFollowers();
        handleCalcFollowings();

    }, [following]);


    // Link decorator for clickable URLs in bio
    const linkDecorator = (href: string, text: string, key: number): React.ReactNode => {
        if (!isValidUrl(href)) {
            return <span key={key}>{text}</span>;
        }
        setFollowing(false);
    };

    function isValidUrl(string: string): boolean {
        try {
            new URL(string);
        } catch (_) {
            return false;
        }
        return true;
    }

    const handleFollow = async () => {
        const { error } = await supabase
        .from('relationships')
        .insert([
            {
                user_id: user?.id,
                follower_id: userId,
            },
        ]);
        if (error) {
            console.error('Error following user:', error.message);
            return;
        }
        setFollowing(true);
    };

    const handleUnFollow = async () => {
        const { error } = await supabase
        .from('relationships')
        .delete()
        .eq('user_id', user?.id)
        .eq('follower_id', userId);

        if (error) {
            console.error('Error unfollowing user:', error.message);
            return;
        }
        setFollowing(false);
    };

    const isMobile = () => {
        return (
          /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
          window.matchMedia("(max-width: 768px)").matches
        );
      };

    return (
        <div className="w-full min-h-screen bg-white pb-20 md:pb-0">
            {userProfile ? (
                <div className="px-4 pt-5">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 mb-4">
                            <Image
                                src={`${process.env.NEXT_PUBLIC_IMAGE_CDN}/profile-pic/${userAvatar}`}
                                alt="Profile"
                                width={128}
                                height={128}
                                className="rounded-full object-cover"
                            />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-xl font-medium">
                                {userProfile.full_name ? userProfile.full_name : userProfile.username}
                            </h1>
                            {user && user.id === userId && (
                                <button
                                onClick={() => router.push('/account/edit-profile')}
                                className="px-2 py-1.5 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                                >   
                                Edit Profile
                                </button>
                            )}
                            {user && user.id !== userId && (
                                handleFollowButton(),
                                <button
                                onClick={() => following ? handleUnFollow() : handleFollow()}
                                className="px-2 py-1.5 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                                >   
                                {following ? 'Unfollow' : 'Follow'}
                                </button>
                                
                            )}
                            {user && user.id !== userId && (
                            <button
                                onClick={() => router.push(`/inbox/${userId}`)}
                                className="px-2 py-1.5 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                                >   
                                Message
                            </button>
                            )}
                        </div>
    
                        <div className="text-gray-500 text-sm mb-4">
                        {userProfile.full_name && userProfile.username ? userProfile.username : ''}
                        </div>
                        
                        {userProfile.website && (
                            <div className="text-sm mb-4">
                                <Linkify>
                                    <a className="text-blue-500 hover:text-blue-600">{userProfile.website}</a>
                                </Linkify>
                            </div>
                        )}
                        
                        <p className="text-gray-600 text-sm mb-6">{userProfile.bio || 'No bio yet'}</p>

                        {/* Display followers and following counts*/}
                        <div className="flex space-x-10 mb-6">
                            <button onClick={() => setIsFollowingOpen(true)} className="btn">
                                <p className="text-sm text-gray-500 mr-2">Following</p>
                                <p className="text-sm font-medium">{followingCount}</p>
                            </button>
                            <FollowingPopup isOpen={isFollowingOpen} setIsOpen={setIsFollowingOpen} />
                            <button onClick={() => setIsFollowerOpen(true)} className="btn">
                                <p className="text-sm text-gray-500 mr-2">Follower</p>
                                <p className="text-sm font-medium">{followersCount}</p>
                            </button>
                            <FollowerPopup isOpen={isFollowerOpen} setIsOpen={setIsFollowerOpen} />
                        </div>
                    </div>
                    <div>
                        <div className="flex m-2 xl:justify-center hide-scrollbar mb-6">
                                {user && user.id === userId && (
                                    postButtons.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => handleCategoryClick(category, userId)}
                                            className={`px-3 py-3 rounded-full text-sm min-w-max ${displayCAtagory === category || (displayCAtagory === 'myPosts' && category === 'myPosts') ? 'bg-gray-300' : 'bg-white'}`}
                                        >
                                        {category}
                                        </button>
                                    ))
                                )}
                                {user && user.id !== userId && (
                                    postButtons_others.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => handleCategoryClick(category, userId)}
                                            className={`px-3 py-3 rounded-full text-sm min-w-max ${displayCAtagory === category || (displayCAtagory === 'myPosts' && category === 'myPosts') ? 'bg-gray-300' : 'bg-white'}`}
                                        >
                                        {category}
                                        </button>
                                            ))
                                )}
                            {/* <div className="flex">
                                {user && user.id === userId && (
                                    <button
                                    key="more"
                                    type="button"
                                    onClick={toggleDropdown}
                                    className={`px-3 py-3 rounded-full text-sm min-w-max ${isOpen ? 'bg-gray-300' : 'bg-white'}`}
                                >
                                ...
                                </button>
                                )}
                                
                                {isOpen && user && user.id === userId && !isMobile() && (
                                    <div className=" right-0 mt-2 w-48 bg-white rounded-md shadow-lg border" style={{margin: "5px"}}>
                                        <ul className="py-1">
                                            <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleCategoryClick('Drafts', userId)}
                                            >
                                            Drafts
                                            </li>
                                        </ul>
                                    </div>)}
                            </div> */}
                            
                        </div>
                        {isOpen && user && user.id === userId && isMobile() && (
                            <div className=" right-0 mt-2 w-48 bg-white rounded-md shadow-lg border" style={{margin: "5px"}}>
                                <ul className="py-1">
                                    <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleCategoryClick('Drafts', userId)}
                                    >
                                    Drafts
                                    </li>
                                </ul>
                            </div>)}
                    </div>
                    <div className="border-b border-gray-300 mb-5"></div>
                    
                    <div className={styles.container}>
                        {posts.length === 0 ? (
                            <p className="text-center">No posts found :) </p>
                        ) : (
                            <div>
                                {deletePost && (
                                    <DeletePopup posts={posts} postStatus={managePostData.postAction} postId={managePostData.id} resetPosts={resetPosts} togglePopup={toggleDeletePopUp}/>
                                )}
                                <MasonryGrid posts={posts} managePost={managePost}/>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-screen">
                    <p className="text-gray-500">Loading...</p>
                </div>
            )}
        </div>
    );
}

function order(arg0: string, arg1: { ascending: boolean; }) {
    throw new Error('Function not implemented.');
}
