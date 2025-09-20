import { useState, useEffect, useCallback } from "react";

interface UseProfileImageProps {
  initialImage?: string | null;
  onImageChange?: (imageFile: File | null, previewUrl: string | null) => void;
  maxFileSizeMB?: number;
  allowedFileTypes?: string[];
}

export const useProfileImage = ({
  initialImage,
  onImageChange,
  maxFileSizeMB = 5,
  allowedFileTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
}: UseProfileImageProps = {}) => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImage || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (profileImage) {
      const reader = new FileReader();
      reader.onloadstart = () => {
        setIsLoading(true);
        setProgress(0);
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentLoaded = Math.round((event.loaded / event.total) * 100);
          setProgress(percentLoaded);
        }
      };

      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setIsLoading(false);
        setProgress(100);
      };

      reader.onerror = () => {
        setError("Failed to load image");
        setIsLoading(false);
      };

      reader.readAsDataURL(profileImage);
    }
  }, [profileImage]);

  useEffect(() => {
    if (initialImage && !previewUrl && !profileImage) {
      setPreviewUrl(initialImage);
    }
  }, [initialImage, previewUrl, profileImage]);

  useEffect(() => {
    if (onImageChange) {
      onImageChange(profileImage, previewUrl);
    }
  }, [profileImage, previewUrl, onImageChange]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        return `File size exceeds ${maxFileSizeMB}MB limit`;
      }

      if (!allowedFileTypes.includes(file.type)) {
        return "Invalid file type. Please upload a valid image file.";
      }

      return null;
    },
    [maxFileSizeMB, allowedFileTypes]
  );

  const handleImageChange = useCallback(
    (file: File | null) => {
      if (file) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      setProfileImage(file);
      if (!file) {
        setPreviewUrl(null);
      }
      setError(null);
    },
    [validateFile]
  );

  const fileToBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const optimizeImage = useCallback(
    async (file: File, maxWidth = 800, maxHeight = 800): Promise<File> => {
      if (!file.type.startsWith("image/")) {
        return file;
      }

      try {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const optimizedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now(),
                  });
                  resolve(optimizedFile);
                } else {
                  resolve(file);
                }
              },
              file.type,
              0.85
            ); 
          };

          img.onerror = () => resolve(file);

          const reader = new FileReader();
          reader.onload = (e) => {
            img.src = e.target?.result as string;
          };
          reader.onerror = () => resolve(file);
          reader.readAsDataURL(file);
        });
      } catch (err) {
        console.error("Image optimization failed:", err);
        return file;
      }
    },
    []
  );

  return {
    profileImage,
    previewUrl,
    isLoading,
    error,
    progress,
    handleImageChange,
    fileToBase64,
    optimizeImage,
  };
};
