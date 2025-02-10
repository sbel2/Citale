'use client'

import{ createClient } from '@/supabase/client';
import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import Image from "next/legacy/image";
import { categoryList, locationList } from '@/components/constants';
import { useAuth } from 'app/context/AuthContext';
import Card from '@/components/card';
import { Post } from "@/app/lib/types";
import { MultiSelectChipsInput, DatesInput, FilesInput, FileItem } from '@/components/formComponents';
// import {AutocompleteLocation} from '@/components/formComponents';
import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
import { error } from 'console';
import { boolean } from 'zod';
import {v4 as uuidv4} from 'uuid' // generate post id


const supabase = createClient();
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

interface ButtonSubmitEvent extends SubmitEvent {
    submitter: HTMLButtonElement | HTMLInputElement;
}

export default function CreatePostPage() {
    const { user, logout } = useAuth();
    const [isLoading, setLoad] = useState(false)
    const [isSubmitted, setSubmit] = useState(false)
    const [postType, setPostType] = useState<string>("")
    const [showPop, setPopShow] = useState(false)
    const defaultFormData = {
        title: "",
        description: "",
        location: "",
        mediaUrl: [] as string[],
        category: "",
        price: "",
        user_id: user?.id,
        mapUrl: "",
        season: "",
        startDate: null as string | null,
        endDate: null as string | null,
    }
    const [formData, setFormData] = useState(defaultFormData);

    function handleInput(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const fieldName = e.target.name;

        //handles setting a string[] of multiple file names for mediaUrl
        if (e.target instanceof HTMLInputElement && e.target.type === "file") {
            const fileList = e.target.files;
            console.log(fileList);

            if (fileList) {
                const filesArray = Array.from(fileList).map((file) => URL.createObjectURL(file));
                console.log(filesArray);
                setFormData((prevState) => ({
                    ...prevState,
                    [fieldName]: filesArray,
                }));
            }
        } else if (!(e.target instanceof HTMLSelectElement && e.target.hasAttribute('multiple')))  {
            const fieldValue = e.target.value;

            setFormData((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue,
            }))
        }

        console.log(formData)
    }

    const handleLocationChange = (mapData: {
        name: string;
        formatted_address: string;
    }) => {
        console.log("ithappened", mapData)
        setFormData((prevState) => ({
            ...prevState,
            mapUrl: `${mapData.name} - ${mapData.formatted_address}`,
        }));
        console.log(formData)
    }

    const handleMultiSelect = (chosenOptions: string, inputKey: string) => {
        {/*if (chosenOptions) {
            const valid = true
            setValidate(valid)
        } else {
            const valid = false
            setValidate(valid) 
        }*/}
        console.log("ithappened", chosenOptions)
        setTimeout(() => {
            setFormData((prevState) => ({
            ...prevState,
           [inputKey]: `${chosenOptions}`,
            }));
        }, 0)
        console.log(formData)
    }

    const handleDateInput = (period: (string | null)[]) => {
        console.log("datechange!", period)
        setFormData((prevState) => ({
            ...prevState,
            startDate: period[0] ? `${period[0]}` : null,
            endDate: period[1] ? `${period[1]}` : null
        }))
        console.log(formData)
    }

    const handleFilesInput = (filesArray: FileItem[]) => {
        console.log("fileshere!");
        const fileNames = Array.from(filesArray).map((file) => file.name)
        const fileTypes = Array.from(filesArray).map((file) => (file.type.startsWith("video/") ? true : false))
        console.log(fileTypes)
        console.log(fileNames)
        setFormData((prevState) => ({
            ...prevState,
            mediaUrl: fileNames

        }))
      }

    const uploadFilesToBucket = async (blobUrls: string[], postAction: string) => {
        //const imageBucket = 'images';
        //const videoBucket = 'video';
        const testPostBucket = 'test';
        const testDraftBucket = 'test-draft'
        
        const fileTypes: boolean[] = [];
        const uploadedFiles: string[] =[];
        let currentFileType = "";

        for (const blobUrl of blobUrls) {
            try {
                const response = await fetch(blobUrl);
                const blob = await response.blob();

                switch (blob.type) {
                    case 'image/jpeg':
                    case 'image/jpg':
                        fileTypes.push(false);
                        currentFileType = "jpg"
                        break
                    case 'image/png':
                        fileTypes.push(false);
                        currentFileType = "png"
                        break
                    case 'image/gif':
                        fileTypes.push(false);
                        currentFileType = "gif"
                        break
                    case 'video/mp4':
                        fileTypes.push(true);
                        currentFileType = "mp4"
                        break
                    case 'video/quicktime':
                        fileTypes.push(true);
                        currentFileType = "mov"
                        break
                }


                if (postAction == "draft" || postAction == "post") {
                const fileName = `${Date.now()}-${Math.random().toString(35).substring(7)}.${currentFileType}`
                //const filePath = `/${fileName}`
                console.log(fileName)
                let filePath = ""

                if (currentFileType === "jpg" || currentFileType === "png" || currentFileType === "gif") {
                    filePath = `images/${fileName}`
                    console.log(filePath)
                    
                } else if (currentFileType === "mp4" || currentFileType === "mov") {
                    filePath = `videos/${fileName}`
                    console.log(filePath)
                }
                
                const { data, error } = await supabase.storage
                        .from((postAction=="post") ? testPostBucket : testDraftBucket)
                        .upload(filePath, blob, {
                            upsert: false,
                        });
                
                {/* else if (currentFileType === "mp4" || currentFileType === "mov") {
                    const { data, error } = await supabase.storage
                        .from(videoBucket)
                        .upload(filePath, blob, {
                            upsert: false,
                        });
                } */}

                if (error) {
                    console.error(`Error uploading ${blobUrl}:`, error.message);
                    continue;
                }

                const publicUrl = supabase.storage.from((postAction=="post") ? testPostBucket : testDraftBucket).getPublicUrl(filePath);
                uploadedFiles.push(fileName);
                console.log(`Uploaded ${blobUrl} to:`, publicUrl);}
            } catch (error) {
                console.error(`Failed to upload ${blobUrl}:`, (error as Error).message);
            }
        }
        console.log(fileTypes);
        return { fileTypes, uploadedFiles }
    }

    useEffect(() => {
        const submitPopup = setTimeout(() => {
            setSubmit(false);
            //window.location.href = '/account/profile'

        }, 3500); // show submit popup for ~3.5seconds
    }, [isSubmitted])

    useEffect(() => {
        console.log("effecting")
        if (isSubmitted) {
            setLoad(false)
            if (!isLoading) {
                setTimeout(() => {
                    setSubmit(false);
                    //window.location.href = '/account/profile'
        
                }, 3500); // show submit popup for ~3.5seconds
            }
        }
        
    }, [isSubmitted, isLoading])

    // generate unique post id



    async function submitForm(e: FormEvent) {
        e.preventDefault();
        //console.log(formData)

        console.log(formData);
        const submitEvent = e.nativeEvent as ButtonSubmitEvent;
        const perform = submitEvent.submitter.value
        setPostType(perform);
        setLoad(true);
        
        async function postData(postAction: string, formDataUpdate: typeof formData) {

            //upload images to supabase and get their new filenames and boolean[] of isVideo
            if (!formData.mediaUrl[0]) {
                console.log("madeit", formDataUpdate)
                let statusPost = "draft";
                let draftFormData = {}
                draftFormData = {
                    ...formDataUpdate,
                    post_action: statusPost,
                    user_id: user?.id
                }
                
                console.log(draftFormData);
                //post data to posts database
                const { data, error } = await supabase
                .from('testDraft')
                .insert([draftFormData]);

                if (error) {
                    console.error('Error Posting data:', error);
                    return
                }

                console.log('Data posted!!')
                return
            }
            const { fileTypes, uploadedFiles } = await uploadFilesToBucket(formData.mediaUrl, postAction);
        
            console.log(formDataUpdate)
            let thumbnailUrl = null;
            let hasVideo = false;

            //check for a video and if it exists set as thumbnailUrl -- ASSUMES VIDEO IS THUMBNAIL
            for (const [index, type] of fileTypes.entries()) {
                if (type == true) {
                    hasVideo = true;
                    thumbnailUrl = postAction==="preview"? formDataUpdate.mediaUrl[index] : `${uploadedFiles[index]}`;
                    break
                };
            }            

            let finalFormData = {};
            console.log(postAction)
            //add computed states to FormData and update mediaUrl with supabase file names
            if (postAction == "preview") {
                finalFormData = {
                    ...formDataUpdate,
                    is_video: hasVideo,
                    video_type: fileTypes,
                    thumbnailUrl: thumbnailUrl,
                }
                console.log(finalFormData)

            } else {
                console.log("madeit")
                let statusPost = (postAction === "post"? "post" : "draft");

                finalFormData = {
                    ...formDataUpdate,
                    mediaUrl: uploadedFiles,
                    is_video: hasVideo,
                    video_type: fileTypes,
                    thumbnailUrl: thumbnailUrl,
                    post_action: statusPost,
                    user_id: user?.id
                }
                
                console.log(finalFormData);
                //post data to posts database
                
                const { data, error } = await supabase
                .from((postAction === "post")? "testPost" : "testDraft")
                .insert([finalFormData]);
                

                if (error) {
                    console.error('Error Posting data:', error);
                    return
                }

                console.log('Data posted!!');
            

                //window.location.href = `/account/profile/${user?.id}`
                window.location.href = `/account/profile/${user?.id}`
                console.log('Data posted!!');
                //window.history.pushState(null, '', `/${postType}/${post.post_id}`)
            }
            
        };
        
        //if (perform == 'preview') {

            //window.location.href = '/account/profile';
        //} else {
            console.log("Procesing Form Submission...")
            console.log(formData)
            await postData(perform, formData);
            console.log(isSubmitted)
            window.location.href = `/account/profile/${user?.id}`
           // window.history.pushState(null, '', `/account/profile/${user?.id}`)
           
        //}
        
    }

    console.log('Boom')

        return (
                <div>
                    <form onSubmit={submitForm}  id="addpost" style={styles.form}>
                        <p style={styles.title}>Post an Event!</p>
                        <label htmlFor="eventdata" style={styles.label}> Title
                            <input
                                type="text"
                                id="eventdata"
                                name="title"
                                value={formData.title}
                                onChange={handleInput}
                                style={styles.input}
                                required
                            />
                        </label>
                        <DatesInput onSeasonChange={handleMultiSelect} onDateChange={handleDateInput} style={styles}/>
                        <label htmlFor="locationdata" style={styles.specialLabel}> Area
                            <select 
                                name="location"
                                id="location"
                                onChange={handleInput}
                                value={formData.location}
                                style={styles.specialInput}
                            >
                                <option value="" disabled> Select Boston Area... </option>
                                {locationList.map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label htmlFor="locationtitle" style={styles.label}> Location
                            <input
                                type="text"
                                id="locationtitle"
                                name="mapUrl"
                                value={formData.mapUrl}
                                onChange={handleInput}
                                style={styles.input}
                                required
                            />
                        </label>
                        {/*<AutocompleteLocation onLocationChange={handleLocationChange} style={styles}/> FIX FIX FIX FIX FIX FIX FIX FIX FIX FIX FIX FIX FIX FIX FIX FIX FIX*/}
                        <label htmlFor="price" style={styles.specialLabel}> Price
                            <select 
                                name="price"
                                id="price"
                                onChange={handleInput}
                                value={formData.price}
                                style={styles.specialInput}
                            >
                                <option value="" disabled> Select Price Range... </option>
                                <option key='free' value='free'>
                                    Free
                                </option>
                                <option key='$' value='$'>
                                    $
                                </option>
                                <option key='$$' value='$$'>
                                    $$
                                </option>
                                <option key='$$$' value='$$$'>
                                    $$$
                                </option>
                            </select>
                        </label>
                        <div className="flex">
                            <label htmlFor="descriptiondata" style={styles.label}>Description</label>
                            <textarea
                                id="descriptiondata"
                                style={styles.textarea} 
                                rows={5}
                                cols={40}
                                name="description"
                                value={formData.description}
                                onChange={handleInput}
                                required
                                
                            />
                        </div>
                        <div>
                            <p style={styles.label}> Event Type(s)</p>
                            {/*<input 
                                type="text"
                                id="require"
                                name="require"
                                value={isValid ? "full" : ''}
                                style={{visibility: "hidden", height: "1px"}}
                            />*/}
                            <MultiSelectChipsInput onMultiSelectChange={handleMultiSelect} elementKey="category" options={categoryList} />
                        </div>
                        {/* <label htmlFor="urldata" style={styles.specialLabel}> Upload Images and Videos
                            <input
                                type="file"
                                id="urldata"
                                name="mediaUrl"
                                multiple
                                accept=".jpg, .jpeg, .png, .gif, .mp4, .mov"
                                onChange={handleInput}
                                style={styles.specialInput}
                                required
                            />
                        </label> */}
                        <FilesInput style={styles} onFilesChange= {handleFilesInput}/>
                    </form>
                    <div className="flex justify-end">
                    {isLoading && (
                            <p className="align-self-start">Saving your Content...</p>
                        )}
                        <button type="submit" form="addpost" value="post" style={styles.submit}>Post</button>
                        <div className="flex">
                            <button type="submit" form="addpost" value="draft" formNoValidate style={styles.submit}>Save as Draft</button>
                            {/*<button type="submit" form="addpost" value="preview" formNoValidate style={styles.submit}>Preview Post</button>*/}
                        </div>
                    </div>
                    <div>
                        {isLoading && (
                            <p>Saving your Content...</p>
                        )}
                    </div>
                </div>
        )
}



const styles = {
    total: {
      display: 'flex',
      position: 'fixed' as const,
      left: '30%',
      justifyContent: 'center',
      zIndex: 10,
      width: '40%',
      //height: '60%',
    },

    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      width: '100%',
      minWidth: '500px',
      margin: '20px 10px',
      //boxShadow: '0 4px 400px 0 rgba(0, 0, 0, 0.2), 0 6px 400px 0 rgba(0, 0, 0, 0.19)',
      borderRadius: '15px',
      backgroundColor: 'white',
    },

    title: {
      alignSelf: 'center',
      fontSize: '25px',
      //fontFamily: 'Inter SemiBold 600', eventually bold title
      margin: '25px 0px 10px',
    },

    input: {
      backgroundColor: '#f2f3f4',
      borderRadius: '8px',
      height: '30px',
      width: '100%'
    },

    inputLined: {
        borderBottom: "1px solid black",
        height: '30px',
        width: '100%'
    },

    textarea: {
      backgroundColor: '#f2f3f4',
      borderRadius: '8px',
      width: '100%',
      marginRight: '25px',
    },

    label: {
      margin: '10px 25px 0px',
      fontSize: '15px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
    },

    specialLabel: {
      margin: '10px 25px 0px',
      fontSize: '15px',
    },

    map: {
        margin: '5px 25px',
    },

    specialInput: {
      margin: '10px 5px',
      backgroundColor:'#f2f3f4',
    },

    submit: {
      border: '1px white solid',
      borderRadius: '10px',
      backgroundColor: '#ff0000',
      color: 'white',
      margin: '100px 10px 40px 10px',
      alignSelf: 'flex-end',
      width: '200px',
      height: '35px',
      cursor: 'pointer',
    },

    dateDisplay: {
      display: 'none !important',
    }
  }
