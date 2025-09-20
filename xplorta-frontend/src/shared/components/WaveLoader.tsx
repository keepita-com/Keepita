import { cn } from "../utils";

const WaveLoader = ({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const barWidths = {
    sm: "w-1",
    md: "w-1.5",
    lg: "w-2",
  };

  const containerSizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  const heights = {
    sm: ["12px", "18px", "24px", "18px", "12px"],
    md: ["16px", "24px", "32px", "24px", "16px"],
    lg: ["20px", "30px", "40px", "30px", "20px"],
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        containerSizes[size],
        className
      )}
    >
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-primary animate-wave rounded-full",
            barWidths[size]
          )}
          style={{
            animationDelay: `${i * 100}ms`,
            height: heights[size][i],
          }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
};
export default WaveLoader;
