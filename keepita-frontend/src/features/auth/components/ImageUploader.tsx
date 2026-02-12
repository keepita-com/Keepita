import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  previewUrl: string | null;
  onImageChange: (file: File | null) => void;
  disabled?: boolean;
  initials?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  isLoading?: boolean;
  error?: string | null;
  progress?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  previewUrl,
  onImageChange,
  disabled = false,
  initials = "JD",
  className = "",
  size = "md",
  shape = "circle",
  isLoading = false,
  error = null,
  progress = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-lg",
  };

  const dropzoneVariants = {
    idle: {
      scale: 1,
      boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)",
    },
    dragging: {
      scale: 1.05,
      boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.3)",
    },
    loading: {
      scale: 1,
    },
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragCounter((prev) => prev + 1);
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      e.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragCounter((prev) => prev - 1);
      if (dragCounter - 1 === 0) {
        setIsDragging(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    if (!disabled && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`relative group flex flex-col items-center ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <motion.div
        variants={dropzoneVariants}
        animate={isLoading ? "loading" : isDragging ? "dragging" : "idle"}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
        onClick={triggerFileInput}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative ${sizeClasses[size]} ${
          shapeClasses[shape]
        } overflow-hidden
          border-4 ${
            disabled
              ? "border-gray-700"
              : isLoading
                ? "border-amber-500"
                : error
                  ? "border-rose-500"
                  : isDragging
                    ? "border-sky-500"
                    : "border-indigo-500"
          } 
          ${
            !disabled && !isLoading
              ? "cursor-pointer"
              : isLoading
                ? "cursor-wait"
                : ""
          } 
          transition-all duration-300 shadow-xl`}
      >
        {previewUrl ? (
          <div className="w-full h-full relative">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
            {!disabled && !isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={24} className="text-white" />
              </div>
            )}{" "}
            {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <Loader2 size={24} className="text-white animate-spin mb-2" />
                {progress > 0 && (
                  <div className="w-3/4 mt-2">
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-indigo-500"
                      />
                    </div>
                    <div className="text-xs text-center mt-1 text-white">
                      {progress}%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
            {initials}
            {!disabled && !isLoading && (
              <div className="absolute inset-0 bg-black/30 flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
                <span className="text-white text-xs font-normal">
                  Upload Photo
                </span>
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <Loader2 size={24} className="text-white animate-spin mb-2" />
                {progress > 0 && (
                  <div className="w-3/4 mt-2">
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-indigo-500"
                      />
                    </div>
                    <div className="text-xs text-center mt-1 text-white">
                      {progress}%
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {isDragging && !disabled && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-500/20 border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center"
            >
              <Upload size={30} className="text-white drop-shadow-lg" />
              <p className="text-white text-sm font-medium mt-2 drop-shadow-lg">
                Drop image here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!disabled && previewUrl && !isLoading && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={removeImage}
          className="absolute -top-1 -right-1 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-md"
        >
          <X size={16} />
        </motion.button>
      )}

      {!disabled && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-center"
        >
          {error ? (
            <span className="text-xs text-rose-400">{error}</span>
          ) : !previewUrl ? (
            <span className="text-xs text-indigo-300/80 italic">
              Click or drop to upload
            </span>
          ) : null}
        </motion.div>
      )}
    </div>
  );
};

export default ImageUploader;
