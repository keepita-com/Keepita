import React from "react";
import { motion } from "framer-motion";
import { Archive, Box, CircleSlash, Clock } from "lucide-react";
import type { BackupsStatsResponse } from "../types/backup.types";
import { formatBytes } from "../utils/backup.utils";

interface BackupStatsProps {
  stats?: BackupsStatsResponse;
}

const BackupStats: React.FC<BackupStatsProps> = ({ stats }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
    >
      {/* total backups */}
      <motion.div
        variants={item}
        whileHover={{
          y: -5,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          background:
            "linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-5 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="p-3 rounded-xl bg-blue-500/20 mr-3 backdrop-blur-sm shadow-md shadow-blue-500/10"
            >
              <Archive className="w-5 h-5 text-blue-400" />
            </motion.div>
            <h3 className="text-gray-300 font-medium">Total Backups</h3>
          </div>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className="text-3xl font-bold text-white"
          >
            {stats?.total_backups ?? 0}
          </motion.p>
        </div>
      </motion.div>
      {/* total backups size */}
      <motion.div
        variants={item}
        whileHover={{
          y: -5,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          background:
            "linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-5 rounded-2xl  shadow-lg backdrop-blur-sm relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="p-3 rounded-xl bg-teal-500/20 mr-3 backdrop-blur-sm shadow-md shadow-teal-500/10"
            >
              <Box className="w-5 h-5 text-teal-400" />
            </motion.div>
            <h3 className="text-gray-300 font-medium">Total Backups Size</h3>
          </div>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            className="text-3xl font-bold text-white"
          >
            {formatBytes(stats?.total_size_bytes ?? 0)}
          </motion.p>
        </div>
      </motion.div>
      {/* completed backups */}
      <motion.div
        variants={item}
        whileHover={{
          y: -5,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          background:
            "linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-5 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="p-3 rounded-xl bg-purple-500/20 mr-3 backdrop-blur-sm shadow-md shadow-purple-500/10"
            >
              <Clock className="w-5 h-5 text-purple-400" />
            </motion.div>
            <h3 className="text-gray-300 font-medium">Completed Backups</h3>
          </div>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
            className="text-2xl font-bold text-white truncate"
          >
            {stats?.completed_backups ?? 0}
          </motion.p>
        </div>
      </motion.div>
      {/* failed backups */}
      <motion.div
        variants={item}
        whileHover={{
          y: -5,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          background:
            "linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="bg-gradient-to-br from-gray-800/70 to-gray-900/90 p-5 rounded-2xl  shadow-lg backdrop-blur-sm relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <label>
          <div className="relative z-10">
            <div className="flex items-center mb-3">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="p-3 rounded-xl bg-red-300/20 mr-3 backdrop-blur-sm shadow-md shadow-indigo-500/10"
              >
                <CircleSlash className="w-5 h-5 text-red-600" />
              </motion.div>
              <h3 className="text-gray-300 font-medium">Failed Backups</h3>
            </div>

            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
              className="text-2xl font-bold text-white truncate"
            >
              {stats?.failed_backups ?? 0}
            </motion.p>
          </div>
        </label>
      </motion.div>
    </motion.div>
  );
};

export default BackupStats;
