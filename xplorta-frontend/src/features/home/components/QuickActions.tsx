import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface QuickActionItem {
  icon: React.ReactNode;
  title: string;
  path: string;
  bgColor: string;
  hoverColor: string;
  borderColor: string;
  delay: number;
}

interface QuickActionsProps {
  actions: QuickActionItem[];
}

const containerVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <motion.div
      variants={containerVariants}
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
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>

      <motion.h2
        className="text-xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent mb-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Quick Actions
      </motion.h2>

      <div className="space-y-4 relative z-10">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: action.delay }}
          >
            <Link to={action.path}>
              <motion.div
                whileHover={{
                  y: -3,
                  x: 3,
                  boxShadow: `0 15px 30px -10px ${action.hoverColor}`,
                  backgroundColor: action.bgColor,
                  transition: { duration: 0.2 },
                }}
                className="flex items-center p-3 rounded-lg bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm cursor-pointer shadow-md border border-sky-500/30"
              >
                <div
                  className={`${action.borderColor} rounded-lg p-2 mr-4 shadow-lg`}
                >
                  {action.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{action.title}</div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
