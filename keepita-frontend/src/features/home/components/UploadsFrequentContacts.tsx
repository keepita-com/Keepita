import React from "react";
import { motion } from "framer-motion";
import { TabletSmartphone } from "lucide-react";

interface FrequentCallContact {
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  title: string;
  callCount: number;
  phoneModel: string;
}

interface UploadsFrequentContacts {
  contacts?: FrequentCallContact[];
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

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const UploadsFrequentContacts = ({ contacts }: UploadsFrequentContacts) => {
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
    >
      <div className="absolute -top-12 left-1/4 w-32 h-32 bg-rose-500/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-16 right-1/4 w-36 h-36 bg-rose-500/10 rounded-full blur-xl"></div>
      {/* title */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <motion.h2
          className="text-xl font-bold bg-gradient-to-r from-white to-rose-200 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Frequent Contacts
        </motion.h2>
      </div>
      {/* contacts */}
      <div className="space-y-4 relative z-10">
        {!contacts || contacts?.length === 0 ? (
          <p>No contacts found!</p>
        ) : (
          contacts?.map((item, index) => (
            <motion.div
              key={index}
              className={`flex items-center border-b border-gray-700/50 pb-3 rounded-md px-2 py-1.5 hover:rounded-md cursor-pointer ${item.borderColor}`}
              variants={itemVariants}
              custom={index}
              initial={{ backgroundColor: "transparent" }}
              whileHover={{
                x: 4,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                transition: { duration: 0.2 },
              }}
            >
              <div
                className={`${item.bgColor} rounded-full p-2 mr-4 shadow-lg`}
              >
                {item.icon}
              </div>
              <div className="flex-grow">
                <div className="text-sm font-medium text-white">
                  {item.title}
                </div>
                <div className="text-xs text-gray-300 flex items-center">
                  <TabletSmartphone size={12} className="mr-1" />{" "}
                  {item.phoneModel}
                </div>
              </div>
            </motion.div>
          )) ?? <p className="text-9xl text-red-200">No contacts found</p>
        )}
      </div>
    </motion.div>
  );
};

export default UploadsFrequentContacts;
