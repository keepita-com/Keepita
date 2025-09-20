import { motion } from "framer-motion";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 dashboard-header relative z-10">
      <div className="mb-4 md:mb-0">
        <motion.h1
          className="text-4xl font-extrabold bg-gradient-to-r bg-clip-text "
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="text-gray-300 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      </div>
    </div>
  );
};

export default DashboardHeader;
