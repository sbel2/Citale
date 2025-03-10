"use client";

import { MultiSelectChipsInput, DatesInput } from "@/components/share/formComponents";
import { categoryList, locationList, seasonList, priceList} from "@/components/share/constants";
import { useState, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function ShareForm({ formData, setFormData }: { 
    formData: any; 
    setFormData: (data: any) => void; 
}) {

    const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
    const [debouncedMapUrl, setDebouncedMapUrl] = useState(formData.mapUrl);

    function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleMultiSelect = (chosenOptions: string, inputKey: string) => {
        setFormData((prevState: any) => ({
            ...prevState,
            [inputKey]: chosenOptions,
        }));
    };

    const handleDateInput = (period: (string | null)[]) => {
        setFormData((prevState: any) => ({
            ...prevState,
            startDate: period[0] || null,
            endDate: period[1] || null,
        }));
    };

    const selectionFields = [
        { label: "Location", key: "location", options: locationList },
        { label: "Price",  key: "price", options: priceList },
    ];

     // Debounce Effect: Waits before updating the map preview
     useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedMapUrl(formData.mapUrl);
        }, 800); // Adjust debounce time (800ms)

        return () => clearTimeout(handler);
    }, [formData.mapUrl]);


    return (
        <div className="flex justify-center">
            <div className="flex flex-col w-full bg-white">
                <p className="text-lg font-lg text-left mb-2">Main post content</p>

                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInput}
                    placeholder="Give us your best title!"
                    className="w-full mt-3 p-2 border rounded-md focus:ring focus:ring-blue-300"
                />

                <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInput} 
                    rows={5} 
                    placeholder="What's happening? Tell us more!"
                    className="w-full mt-3 p-2 border rounded-md focus:ring focus:ring-blue-300"
                />

                <p className="text-lg font-lg text-left mt-3 mb-2">Categories</p>

                <div className="mt-3 overflow-x-auto">
                    <p className="text-gray-700 font-sm">Activity</p>
                        <MultiSelectChipsInput onMultiSelectChange={handleMultiSelect} elementKey="category" options={categoryList}  defaultValue={formData.category} />
                </div>


                
                {selectionFields.map(({ label, key, options }) => (
                    <label key={key} className="text-gray-700 font-sm mt-5">
                        {label}
                        <select 
                            name={key}
                            id={key}
                            onChange={handleInput}
                            value={formData[key] || ""}
                            className="w-full mt-3 p-2 border rounded-md focus:ring focus:ring-blue-300 bg-white text-black"
                        >
                            <option value="" disabled className="bg-white text-gray-400"> Select {label}... </option>
                            {options.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                ))}

                {/* Map Input */}
                <label className="block text-gray-700 font-sm mt-4">
                        Add a map link for your friends!
                        <input
                            type="text"
                            name="mapUrl"
                            value={formData.mapUrl}
                            onChange={handleInput}
                            placeholder="Enter a search term for your location"
                            className="w-full mt-3 p-2 border rounded-md focus:ring focus:ring-blue-300"
                        />
                </label>

                {/* Live Map Preview (Only Renders After Debounce) */}
                {debouncedMapUrl.trim() && (
                            <div className="flex justify-end w-full h-40 items-center bg-white rounded-lg pt-4">
                                <iframe
                                    className="w-full h-36 border-none rounded-lg"
                                    src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(debouncedMapUrl)}`}
                                ></iframe>
                            </div>
                )}

                <div 
                    className="mt-5 bg-gray-100 p-3 rounded-md cursor-pointer flex items-center justify-between"
                    onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                >
                    <p className="text-gray-700 font-medium">Additional Information</p>
                    {showAdditionalInfo ? <IoIosArrowUp className="text-gray-500 text-xl" /> : <IoIosArrowDown className="text-gray-500 text-xl" />}
                </div>

                {/* Additional Information Section (Toggled) */}
                {showAdditionalInfo && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-md">
                        {/* Seasonal Activity */}
                        <p className="text-gray-700 text-sm">Is this a seasonal activity?</p>
                        <MultiSelectChipsInput onMultiSelectChange={handleMultiSelect} elementKey="season" options={seasonList}  defaultValue={formData.season}/>

                        {/* Date Input */}
                        <DatesInput onDateChange={handleDateInput} startDateInit={formData.startDate} endDateInit={formData.endDate} />
                                </div>
                            )}

            </div>
        </div>
    );
}
