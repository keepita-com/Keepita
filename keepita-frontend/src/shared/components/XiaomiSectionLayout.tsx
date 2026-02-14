import React, { type ReactNode } from "react";
import { Wifi, Battery, Signal, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface XiaomiSectionLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  isLoading?: boolean;
  bgColor?: string;
}

const XiaomiSectionLayout: React.FC<XiaomiSectionLayoutProps> = ({
  children,
  title,
  isLoading = false,
  subtitle,
  bgColor = "bg-red-100",
}) => {
  const navigate = useNavigate();
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div
        className={`h-7  ${bgColor} flex items-center justify-between px-4 text-sm font-medium text-black`}
      >
        <div className="flex items-center space-x-1">
          <span>{currentTime}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-4 h-3" />
        </div>
      </div>
      <div className={`${bgColor} `}>
        <div className="py-4 px-3 border-t border-b border-gray-200/50  ">
          <div className="flex flex-row items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`cursor-pointer transition-all duration-150 ${
                !bgColor && "hover:bg-red-200"
              }  w-8 h-8 flex items-center justify-center rounded-full`}
            >
              <ArrowLeft className="text-stone-700 w-5 h-5 " />
            </button>
            {subtitle ? (
              <div className={`flex flex-col gap-.5 text-stone-700`}>
                <span className="font-semibold text-[16px] ">{title}</span>
                <span className="font-medium text-sm ">{subtitle}</span>
              </div>
            ) : (
              <span className="font-semibold text-[16px] text-stone-700">
                {title}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`flex-1 ${bgColor} relative flex flex-col min-h-0 pt-2`}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className={`${bgColor} flex-1 flex flex-col min-h-0`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default XiaomiSectionLayout;
