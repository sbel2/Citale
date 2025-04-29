"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { MultiBackend, TouchTransition } from "dnd-multi-backend";
import Image from "next/image";
import { FileItem } from "app/lib/fileUtils";
import EditImage from "./editImage";


// ✅ MultiBackend to support both desktop and mobile dragging
const backendOptions = {
  backends: [
    { backend: HTML5Backend, transition: undefined }, // Desktop
    { backend: TouchBackend, options: { enableMouseEvents: true }, transition: TouchTransition }, // Mobile
  ],
};

// 📌 **Draggable Image Component**
const DraggableImage = ({
  file,
  index,
  moveFile,
}: {
  file: FileItem;
  index: number;
  moveFile: (dragIndex: number, hoverIndex: number) => void;
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "IMAGE",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "IMAGE",
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveFile(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  useEffect(() => {
    console.log(file.name);
  }, [file.name]);

  return (
    <div
      ref={(node) => {
        if (node) {
          drag(drop(node));
        }
      }}
      className={`relative w-24 h-24 md:w-36 md:h-36 rounded-lg overflow-hidden shadow-md border ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <Image 
        src={file.name} 
        alt={`Uploaded ${index}`} 
        layout="fill" 
        objectFit="cover" 
        className="rounded-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

// 📌 **Image Preview with Drag & Drop + Add More Button**
const ImagePreview = ({
  filesUpload,
  onFilesChange,
}: {
  filesUpload: FileItem[];
  onFilesChange: (filesUpdate: FileItem[]) => void;
}) => {
  const [files, setFiles] = useState<FileItem[]>(filesUpload || []);
  const [imageEdit, setImageEdit] = useState(false);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    setFiles(filesUpload || []);
  }, [filesUpload]);

  const moveFile = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        const [movedFile] = updatedFiles.splice(dragIndex, 1);
        updatedFiles.splice(hoverIndex, 0, movedFile);
        onFilesChange(updatedFiles);
        return updatedFiles;
      });
    },
    [onFilesChange]
  );

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: URL.createObjectURL(file),
        type: file.type,
      }));

      setFiles([...files, ...newFiles]);
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleImageDelete = (files:FileItem[], index: number) => {
    if (files.length <= 1){
      alert("You must have at least one image.");
      return;
    }
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      onFilesChange(updatedFiles);
      return updatedFiles;
    });
  };

  const handleImageClick = (index: number) => {
    // Handle image click event if needed
    // edit image
    setImageEdit(true);
    setImageIndex(index);
    setImageSrc(files[index].name);
  };

  const handleCrop = (croppedImage: string) => {
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles[imageIndex] = { ...updatedFiles[imageIndex], name: croppedImage };
      onFilesChange(updatedFiles);
      return updatedFiles;
    });
    setImageEdit(false);
  };


  return (
    
    <DndProvider backend={MultiBackend} options={backendOptions}>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-1 md:p-4 bg-gray-100 rounded-md">
        {/* 📌 Image Preview Grid */}
        {files?.map((file, index) => (
          <div key={index} className="relative w-24 h-24 sm:w-36 sm:h-36">
          {/* Draggable Image */}
            <button
              onClick={() => handleImageClick(index)}
              className="absolute inset-0 w-full h-full"
            >
              <DraggableImage key={index} file={file} index={index} moveFile={moveFile} />
            </button>
            
        
            {/* Close Button */}
            <button
              onClick={() => handleImageDelete(files, index)}
              className="absolute top-1 right-1 bg-gray-600 bg-opacity-50 text-white w-6 h-6 rounded-full flex items-center justify-center z-50 hover:bg-gray-700"
            >
              &#x2715;
            </button>
          </div>
          
          ))}
        {/* 📌 Add More Button Inside the Grid */}
        <label className="w-24 h-24 sm:w-36 sm:h-36 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-200">
          <span className="text-2xl">+</span>
          <span className="text-sm text-gray-500">Add More</span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleAddImages}
          />
        </label>
      </div>
      {imageEdit && imageSrc && (
        <EditImage
          imageSrc={imageSrc}
          onClose={() => setImageEdit(false)}
          onCrop={handleCrop}
        />
      )}
    </DndProvider>
  );
};

export default ImagePreview;
