import type { LicenseInfoCardProps } from "../types/license.types";

const LicenseInfoCard = ({ license }: LicenseInfoCardProps) => {
  return (
    <div
      key={license.name}
      className={`flex-1 bg-base-100/95 dark:bg-base-200/90 rounded-2xl p-8 flex flex-col gap-6 border transition-all duration-300 relative ${
        license.name === "Pro"
          ? "border-primary shadow-primary/20 ring-2 ring-primary/30"
          : "border-base-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-3 border border-[pink]/20 rounded-xl flex items-center justify-center text-2xl">
          <license.icon size={17} color="white" />
        </div>
        <span className="text-xl font-bold text-base-content">
          {license.name}
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-base-content">
          {license.price}
        </span>
        <span className="text-base text-base-content/60">/Month</span>
      </div>

      <p className="text-base text-base-content/70 leading-relaxed">
        {license.description}
      </p>

      <ul className="flex flex-col gap-3 my-4">
        {license.features.map((feature, featureIdx) => (
          <li key={featureIdx} className="flex items-start gap-3">
            <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                />
              </svg>
            </div>
            <span className="text-base-content/80 leading-relaxed">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        className={`btn w-full mt-auto ${license.buttonClass} rounded-xl h-12 gap-2 group transition-all duration-300`}
      >
        <p className="text-white">{license.buttonText}</p>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-300 text-gray-700 group-hover:translate-x-1 ${
            license.name === "Starter" && "hidden"
          }`}
        >
          <path
            d="M3 8h10M8 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default LicenseInfoCard;
