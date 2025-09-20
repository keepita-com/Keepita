import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  text?: string;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  isProcessing,
  text = "Processing",
}) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isProcessing) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.2 },
      });
    } else {
      controls.start({
        opacity: 0,
        y: 10,
        transition: { duration: 0.2 },
      });
    }
  }, [isProcessing, controls]);

  if (!isProcessing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={controls}
      className="flex items-center justify-center bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 
                 text-white py-1.5 px-4 rounded-lg fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 
                 shadow-lg shadow-indigo-900/20"
    >
      <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-300" />
      <span className="text-sm font-medium">{text}</span>
    </motion.div>
  );
};

export default ProcessingIndicator;
