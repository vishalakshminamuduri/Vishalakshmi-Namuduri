
import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  id: string;
  title: string;
  onImageSelect: (file: File | null) => void;
  icon: React.ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, onImageSelect, icon }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onImageSelect(null);
      setPreview(null);
    }
  };
  
  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        if(fileInputRef.current) {
            fileInputRef.current.files = event.dataTransfer.files;
        }
        handleFileChange({ target: { files: event.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };


  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full">
      <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">{title}</h3>
      <div 
        className="relative border-2 border-dashed border-gray-600 rounded-xl p-4 h-64 flex justify-center items-center cursor-pointer hover:border-purple-500 transition-colors duration-300"
        onClick={handleAreaClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {preview ? (
          <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg" />
        ) : (
          <div className="text-center text-gray-400">
            {icon}
            <p className="mt-2">Drag & drop or click to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
