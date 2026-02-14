import React from "react";
import { motion } from "framer-motion";
import ProfileForm from "../components/ProfileForm";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import AnimatedBackground from "../../../shared/components/AnimatedBackground";

const ProfilePage: React.FC = () => {
  useDocumentTitle("Profile | Keepita");

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 relative overflow-hidden">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl z-10 p-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-gray-400 mt-2">Manage your personal information</p>
        </motion.div>
        <ProfileForm />
      </motion.div>
    </div>
  );
};

export default ProfilePage;
