import React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Lock, AlertTriangle, User } from "lucide-react";
import { useLogin } from "../hooks/login.hooks";

interface LoginFormInputs {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const { mutate: login, error, isPending } = useLogin();

  const onSubmit = (data: LoginFormInputs) => {
    login({ username: data.username, password: data.password });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700/50 p-6"
    >
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              })}
              className={`w-full py-2.5 pl-10 pr-4 bg-gray-800/50 border ${
                errors.username ? "border-rose-500/50" : "border-gray-600/50"
              } rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30`}
              placeholder="username"
            />
          </div>
          {errors.username && (
            <p className="text-rose-400 text-xs mt-1">
              {errors.username.message}
            </p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-300 text-sm font-medium">
              Password
            </label>
          </div>
          <div className="relative">
            <div
              className={`absolute left-3 top-[50%] -translate-y-1/2 pointer-events-none ${
                errors.password ? "text-rose-400" : "text-gray-400"
              }`}
            >
              <Lock size={18} />
            </div>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={`w-full py-2.5 pl-10 pr-4 bg-gray-800/50 border ${
                errors.password ? "border-rose-500/50" : "border-gray-600/50"
              } rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="text-rose-400 text-xs mt-1">
              {errors.password.message}
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
            "Sign In"
          )}
        </motion.button>
        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Register here
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default LoginForm;
