/**
 * BrowserErrorBoundary.tsx
 * Error boundary component for browser section
 */
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface BrowserErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface BrowserErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class BrowserErrorBoundary extends React.Component<
  BrowserErrorBoundaryProps,
  BrowserErrorBoundaryState
> {
  constructor(props: BrowserErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BrowserErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Browser section error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      <div className="mb-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>

      <p className="text-gray-600 mb-6">
        {error.message ||
          "An unexpected error occurred while loading browser data."}
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={resetError}
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors mx-auto"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </motion.button>

      <details className="mt-6 text-left">
        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          Technical Details
        </summary>
        <pre className="mt-2 text-xs bg-gray-100 p-3 rounded-lg overflow-auto text-gray-800">
          {error.stack}
        </pre>
      </details>
    </motion.div>
  </div>
);

export default BrowserErrorBoundary;
