import React from "react";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";

interface UploadsMediasChartProps {
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
  hidden: { opacity: 0, rotate: -5, scale: 0.9 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      delay: 0.2,
      duration: 1,
      ease: "easeOut",
    },
  },
};

const UploadsMediasChart: React.FC<UploadsMediasChartProps> = ({
  data,
  options,
}) => {
  const chartLabels = data?.labels;
  const chartData = data?.datasets?.[0]?.data;

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-xl p-6 shadow-2xl borde chart-container relative overflow-hidden"
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
      <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-xl opacity-70"></div>
      <motion.h2
        className="text-xl font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Medias
      </motion.h2>
      <motion.div
        className="h-60 relative m-6"
        style={{ zIndex: 20 }}
        variants={chartVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        <Doughnut data={data} options={options} />
      </motion.div>
      <motion.div
        className="grid grid-cols-3 gap-4 mt-6 relative z-10"
        style={{ background: "transparent" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {[
          {
            label: chartLabels?.[0] || "",
            value: chartData?.[0] || 0,
            color: "text-sky-300",
          },
          {
            label: chartLabels?.[1] || "",
            value: chartData?.[1] || 0,
            color: "text-violet-300",
          },
          {
            label: chartLabels?.[2] || "",
            value: chartData?.[2] || 0,
            color: "text-rose-300",
          },
          {
            label: chartLabels?.[3] || "",
            value: chartData?.[3] || 0,
            color: "text-[gray]",
          },
        ].map((item, index) => (
          <motion.div
            className="text-center"
            key={index}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            <div className="text-sm text-gray-300">{item.label}</div>
            <div className={`font-bold text-lg ${item.color}`}>
              {item.value}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default UploadsMediasChart;