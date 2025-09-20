import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  color,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-2xl bg-white shadow-lg border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
