import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Logo: React.FC = () => {
  return (
    <div>
      <Link to="/" className="flex items-center group">
        <motion.div
          className="bg-gradient-to-r from-sky-500 to-violet-500 h-8 w-8 rounded-lg flex items-center justify-center mr-2 shadow-lg shadow-sky-500/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <span className="text-white font-bold text-lg">X</span>
        </motion.div>
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 500, damping: 17 }}
        >
          <span className="text-lg font-extrabold bg-gradient-to-r from-sky-400 to-violet-500 bg-clip-text text-transparent">
            xplorta
          </span>
          <motion.div
            className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-sky-500 to-violet-500"
            initial={{ width: "0%" }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </Link>
    </div>
  );
};

export default Logo;
