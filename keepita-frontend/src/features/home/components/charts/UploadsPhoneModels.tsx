import React from "react";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";

interface UploadsPhoneModelsProps {
  data: any;
  options: any;
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
    },
  },
};

const chartVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const UploadsPhoneModels: React.FC<UploadsPhoneModelsProps> = ({
  data,
  options,
}) => {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-xl p-6 shadow-2xl chart-container relative overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(31, 41, 55, 0.65) 0%, rgba(17, 24, 39, 0.9) 100%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      whileHover={{
        scale: 1.01,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 },
      }}
    >
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-sky-500/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-sky-500/10 rounded-full blur-xl"></div>{" "}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <motion.h2
          className="text-xl font-bold bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Phone Models
        </motion.h2>

        <motion.div
          className="badge bg-gradient-to-r from-sky-500 to-sky-600 text-white border-none shadow-md shadow-sky-900/20"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        >
          This Week
        </motion.div>
      </div>
      <motion.div
        className="h-60 relative z-10"
        variants={chartVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        <Bar data={data} options={options} />
      </motion.div>
    </motion.div>
  );
};

export default UploadsPhoneModels;
