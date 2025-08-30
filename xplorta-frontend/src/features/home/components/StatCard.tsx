import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  index?: number;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      delay: i * 0.1,
    },
  }),
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  borderColor,
  index = 0,
}) => {
  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      className={`rounded-xl p-6 shadow-xl border-[0.5px] ${borderColor} stat-card overflow-hidden`}
      style={{
        background:
          "linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.5)",
        transition: { duration: 0.3 },
      }}
    >
      <div
        className={`absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-20 blur-xl ${bgColor.replace(
          "/20",
          ""
        )}`}
      ></div>

      <div className="flex justify-between relative z-10">
        <div>
          <p className="text-gray-300 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
        </div>
        <div
          className={`${bgColor} rounded-lg p-3 h-fit backdrop-blur-lg shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
