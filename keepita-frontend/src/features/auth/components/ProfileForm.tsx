import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  User,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Save,
  X,
  Mail,
  UserCircle,
  UserCog,
  ArrowLeft,
} from "lucide-react";
import { useProfile } from "../hooks/profile.hooks";
import { useAuth } from "../hooks/auth.hooks";
import { useProfileImage } from "../hooks/profileImage.hooks";
import ImageUploader from "./ImageUploader";
import { Link } from "react-router-dom";

interface ProfileFormInputs {
  username: string;
  first_name: string;
  last_name: string;
  profile_image: File | null;
}

const ProfileForm: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const defaultFirstName = user?.first_name || "";
  const defaultLastName = user?.last_name || "";

  const defaultValues = {
    username: user?.username || "johndoe",
    first_name: defaultFirstName,
    last_name: defaultLastName,
    profile_image: null,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormInputs>({
    defaultValues,
  });

  const firstName = watch("first_name");
  const lastName = watch("last_name");

  const {
    mutate: updateProfile,
    error: updateError,
    isPending,
    isSuccess,
  } = useProfile();

  const {
    previewUrl,
    handleImageChange,
    isLoading: isImageLoading,
    error: imageError,
  } = useProfileImage({
    initialImage: user?.profile_image,
    onImageChange: (file) =>
      setValue("profile_image", file, { shouldDirty: true }),
    maxFileSizeMB: 3,
    allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  const onSubmit = async (data: ProfileFormInputs) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null) formData.append(key, value);
      });

      updateProfile(formData);

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    reset({
      username: defaultValues.username,
      first_name: defaultValues.first_name,
      last_name: defaultValues.last_name,
      profile_image: null,
    });
    if (user?.profile_image) {
      handleImageChange(null);
    }
    setIsEditing(false);
  };

  const getInitials = () => {
    return `${
      ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase() || "JD"
    }`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };
  const isFormLoading = isSubmitting || isPending || isImageLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700/50 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.2,
          }}
        >
          <Link
            to="/"
            className="inline-flex items-center text-gray-300 hover:text-white transition-colors group relative"
          >
            <motion.div
              className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(99, 102, 241, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                animate={{ x: 0 }}
                whileHover={{ x: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                className="flex flex-row gap-1 items-center"
              >
                <ArrowLeft size={16} className="" />
                <span className="text-sm font-medium pr-1">
                  Back to Dashboard
                </span>
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-6 flex items-center"
          >
            <CheckCircle2 size={18} className="text-emerald-400 mr-2" />
            <p className="text-sm text-emerald-200">
              Profile updated successfully!
            </p>
          </motion.div>
        )}

        {updateError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 mb-6 flex items-center"
          >
            <AlertTriangle size={18} className="text-rose-400 mr-2" />
            <p className="text-sm text-rose-200">{updateError.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center"
          >
            <ImageUploader
              previewUrl={previewUrl}
              onImageChange={handleImageChange}
              disabled={!isEditing || isFormLoading}
              initials={getInitials()}
              size="lg"
              isLoading={isImageLoading}
              error={imageError}
            />

            {!isEditing && (
              <motion.div variants={itemVariants} className="mt-4 text-center">
                <h2 className="text-xl font-semibold text-white">
                  {firstName} {lastName}
                </h2>
                <p className="text-sm text-gray-400">@{watch("username")}</p>
              </motion.div>
            )}
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Username
                </label>
                <div className="relative">
                  <div
                    className={`absolute left-3 top-[50%] -translate-y-1/2 pointer-events-none ${
                      errors.username ? "text-rose-400" : "text-gray-400"
                    }`}
                  >
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    {...register("username", {
                      required: "Username is required",
                      disabled: !isEditing || isFormLoading,
                    })}
                    className={`w-full py-2.5 pl-10 pr-4 bg-gray-800/50 border ${
                      errors.username
                        ? "border-rose-500/50"
                        : "border-gray-600/50"
                    } rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 ${
                      !isEditing || isFormLoading
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                    readOnly={!isEditing || isFormLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-rose-400 text-xs mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-[50%] -translate-y-1/2 pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={user?.email || "user@example.com"}
                    className="w-full py-2.5 pl-10 pr-4 bg-gray-800/20 border border-gray-600/30 rounded-lg text-white opacity-70 cursor-not-allowed"
                    readOnly={true}
                    disabled={true}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1 block">
                  Email cannot be changed
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div
                    className={`absolute left-3 top-[50%] -translate-y-1/2 pointer-events-none ${
                      errors.first_name ? "text-rose-400" : "text-gray-400"
                    }`}
                  >
                    <UserCircle size={18} />
                  </div>
                  <input
                    type="text"
                    {...register("first_name", {
                      required: "First name is required",
                      disabled: !isEditing || isFormLoading,
                    })}
                    className={`w-full py-2.5 pl-10 pr-4 bg-gray-800/50 border ${
                      errors.first_name
                        ? "border-rose-500/50"
                        : "border-gray-600/50"
                    } rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 ${
                      !isEditing || isFormLoading
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                    readOnly={!isEditing || isFormLoading}
                  />
                </div>
                {errors.first_name && (
                  <p className="text-rose-400 text-xs mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div
                    className={`absolute left-3 top-[50%] -translate-y-1/2 pointer-events-none ${
                      errors.last_name ? "text-rose-400" : "text-gray-400"
                    }`}
                  >
                    <UserCog size={18} />
                  </div>
                  <input
                    type="text"
                    {...register("last_name", {
                      required: "Last name is required",
                      disabled: !isEditing || isFormLoading,
                    })}
                    className={`w-full py-2.5 pl-10 pr-4 bg-gray-800/50 border ${
                      errors.last_name
                        ? "border-rose-500/50"
                        : "border-gray-600/50"
                    } rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 ${
                      !isEditing || isFormLoading
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                    readOnly={!isEditing || isFormLoading}
                  />
                </div>
                {errors.last_name && (
                  <p className="text-rose-400 text-xs mt-1">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex justify-end space-x-3 mt-6"
          >
            {isEditing ? (
              <>
                <motion.button
                  type="button"
                  onClick={cancelEdit}
                  disabled={isFormLoading}
                  whileHover={
                    !isFormLoading
                      ? { scale: 1.02, backgroundColor: "rgb(82, 82, 91)" }
                      : {}
                  }
                  whileTap={!isFormLoading ? { scale: 0.98 } : {}}
                  className={`px-4 py-3 bg-gray-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors ${
                    isFormLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <X size={16} />
                  <span>Cancel</span>
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isFormLoading || !isDirty}
                  whileHover={!isFormLoading && isDirty ? { scale: 1.02 } : {}}
                  whileTap={!isFormLoading && isDirty ? { scale: 0.98 } : {}}
                  className={`px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-indigo-900/30 flex items-center space-x-2 ${
                    isFormLoading || !isDirty
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isFormLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </motion.button>
              </>
            ) : (
              <motion.button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isFormLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-indigo-900/30 flex items-center space-x-2 ${
                  isFormLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <Edit size={16} />
                <span>Edit Profile</span>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default ProfileForm;
