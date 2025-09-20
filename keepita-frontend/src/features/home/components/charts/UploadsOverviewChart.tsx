import React from "react";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";

interface UploadsOverviewChartProps {
  data: any;
  options: any;
}

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
      duration: 0.8,
    },
  },
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.3,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const UploadsOverviewChart: React.FC<UploadsOverviewChartProps> = ({
  data,
  options,
}) => {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="lg:col-span-2 rounded-xl p-6 shadow-2xl chart-container relative overflow-hidden"
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
      <div className="absolute -top-16 -left-16 w-32 h-32 bg-teal-500/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-teal-500/10 rounded-full blur-xl"></div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <motion.h2
          className="text-xl font-bold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Uploads Overview
        </motion.h2>
        <motion.div
          className="badge bg-gradient-to-r from-teal-500 to-teal-600 text-white border-none shadow-md shadow-teal-900/20"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        >
          Monthly
        </motion.div>
      </div>
      <motion.div
        className="h-80"
        variants={chartVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Line data={data} options={options} />
      </motion.div>
    </motion.div>
  );
};

export default UploadsOverviewChart;
