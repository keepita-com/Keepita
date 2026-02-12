import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Logo: React.FC = () => {
  return (
    <div>
      <Link to="/" className="flex items-center group">
        <motion.div
          className=" h-7 w-7 rounded-lg flex items-center justify-center mr-2 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <img src="/LogoKeepita.svg" className="bg-transparent" />
        </motion.div>
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 500, damping: 17 }}
        >
          <span className="text-xl font-extrabold bg-gradient-to-r bg-clip-text text-white">
            Keepita
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
