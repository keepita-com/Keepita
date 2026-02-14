import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  Lock,
  AlertTriangle,
  User,
  Mail,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRegister } from "../hooks/register.hooks";

interface RegisterFormInputs {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormInputs>();

  const watchedPassword = watch("password1", "");

  const { mutate: registerUser, error, isPending, isSuccess } = useRegister();

  const onSubmit = (data: RegisterFormInputs) => {
    registerUser({
      username: data.username,
      email: data.email,
      password1: data.password1,
      password2: data.password2,
    });
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700/50 p-6"
    >
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4 flex items-center"
        >
          <CheckCircle2 size={18} className="text-emerald-400 mr-2" />
          <p className="text-sm text-emerald-200">
            Registration successful! You can now{" "}
            <Link to="/login" className="text-emerald-300 underline">
              sign in
            </Link>
            .
          </p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 mb-4 flex items-center"
        >
          <AlertTriangle size={18} className="text-rose-400 mr-2" />
          <p className="text-sm text-rose-200">{error.message}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Username
          </label>{" "}
          <div className="relative">
            <div className="absolute left-3 top-[50%] -translate-y-1/2 pointer-events-none text-gray-400">
              <User
                size={18}
                className={errors.username ? "text-rose-400" : ""}
              />
            </div>
            <input
              type="text"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
              className={`w-full py-2.5 pl-10 pr-4 bg-gray-800/50 border ${
                errors.username ? "border-rose-500/50" : "border-gray-600/50"
              } rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30`}
              placeholder="Your username"
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
            Email
          </label>
          <div className="relative">
            <div className="absolute left-3 top-[50%] -translate-y-1/2 pointer-events-none text-gray-400">
              <Mail size={18} className={errors.email ? "text-rose-400" : ""} />
            </div>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={`w-full py-2.5 pl-10 pr-4 bg-gray-800/50 border ${
                errors.email ? "border-rose-500/50" : "border-gray-600/50"
              } rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30`}
              placeholder="your@email.com"
            />
          </div>
          {errors.email && (
            <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute left-3 top-[50%] -translate-y-1/2 pointer-events-none text-gray-400">
              <Lock
                size={18}
                className={errors.password1 ? "text-rose-400" : ""}
              />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password1", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className={`w-full py-2.5 pl-10 pr-10 bg-gray-800/50 border ${
                errors.password1 ? "border-rose-500/50" : "border-gray-600/50"
              } rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30`}
              placeholder="Enter your password"
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
          {errors.password1 && (
            <p className="text-rose-400 text-xs mt-1">
              {errors.password1.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute left-3 top-[50%] -translate-y-1/2 pointer-events-none text-gray-400">
              <Lock
                size={18}
                className={errors.password2 ? "text-rose-400" : ""}
              />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("password2", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watchedPassword || "Passwords do not match",
              })}
              className={`w-full py-2.5 pl-10 pr-10 bg-gray-800/50 border ${
                errors.password2 ? "border-rose-500/50" : "border-gray-600/50"
              } rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30`}
              placeholder="Re-Enter your password"
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 cursor-pointer"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
          {errors.password2 && (
            <p className="text-rose-400 text-xs mt-1">
              {errors.password2.message}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting || isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 px-4 mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-indigo-900/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isSubmitting || isPending ? (
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
            "Create Account"
          )}
        </motion.button>

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Sign in instead
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default RegisterForm;
