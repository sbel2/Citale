import React, { useRef } from "react";
import Cropper, { ReactCropperElement } from 'react-cropper';
import "cropperjs/dist/cropper.css";

const EditImage = ({
  imageSrc,
  onClose,
  onCrop,
}: {
  imageSrc: string;
  onClose: () => void;
  onCrop: (croppedImage: string) => void;
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleCrop = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      if (croppedCanvas) {
        const croppedImage = croppedCanvas.toDataURL("image/png");
        onCrop(croppedImage);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-600 bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center z-50 hover:bg-gray-700"
        >
          &#x2715;
        </button>
        <h2 className="text-lg font-semibold mb-4">Edit Image</h2>
        <Cropper
          src={imageSrc}
          style={{ height: 300, width: "100%" }}
          guides={true}
          ref={cropperRef}
        />
        <button
          onClick={handleCrop}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Crop Image
        </button>
      </div>
    </div>
  );
};

export default EditImage;