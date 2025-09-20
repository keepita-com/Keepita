import { motion } from "framer-motion";
import React from "react";
import AnimatedBackground from "../../../shared/components/AnimatedBackground";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => {
  useDocumentTitle("Login | xplorta");

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 relative overflow-hidden">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10 p-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            xplorta
          </h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </motion.div>

        <LoginForm />
      </motion.div>
    </div>
  );
};

export default LoginPage;
