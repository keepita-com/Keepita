import { useState } from "react";
import { Atom, Building2, Sparkles, Check } from "lucide-react";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";

const plans = [
  {
    id: 1,
    icon: Atom,
    name: "Starter",
    priceMonthly: 0,
    priceAnnually: 0,
    description: "Essential tools for quick, occasional data access.",
    features: [
      "View contacts & call logs",
      "Extract media (photos, videos)",
      "Export to CSV",
      "Community support",
    ],
    highlight: false,
    buttonText: "Get Started",
  },
  {
    id: 2,
    icon: Sparkles,
    name: "Professional",
    priceMonthly: 29,
    priceAnnually: 24,
    description: "Advanced extraction for power users and specialists.",
    features: [
      "All Starter features",
      "Extract documents & browser data",
      "Export to CSV & JSON",
      "Priority email support",
      "Batch extraction",
    ],
    highlight: true,
    buttonText: "Upgrade Pro",
  },
  {
    id: 3,
    icon: Building2,
    name: "Expert",
    priceMonthly: 89,
    priceAnnually: 75,
    description: "Full forensic access for analysts and experts.",
    features: [
      "All Professional features",
      "Device & settings extraction",
      "Deep application data",
      "Forensic reporting tools",
      "Premium phone support",
    ],
    highlight: false,
    buttonText: "Contact Sales",
  },
];

const LicensePage = () => {
  const [billing, setBilling] = useState<"monthly" | "annually">("monthly");
  useDocumentTitle("License | Keepita");

  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 flex flex-col items-center">
        <div className="text-center mb-16 space-y-4 max-w-3xl">
          <span className="px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wider uppercase">
            Pricing Plans
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Choose the perfect plan for your data.
          </h1>
          <p className="text-lg text-gray-400">
            Secure, fast, and reliable Samsung backup extraction tools tailored
            to your specific needs.
          </p>
        </div>
        <div className="flex items-center gap-4 mb-16">
          <span
            className={`text-sm ${
              billing === "monthly" ? "text-white" : "text-gray-500"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBilling(billing === "monthly" ? "annually" : "monthly")
            }
            className="relative w-16 h-8 bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-blue-500 rounded-full shadow-lg transition-transform duration-300 ${
                billing === "annually" ? "translate-x-8" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm flex items-center gap-2 ${
              billing === "annually" ? "text-white" : "text-gray-500"
            }`}
          >
            Annually
            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              SAVE 20%
            </span>
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative group p-8 rounded-3xl border transition-all duration-300 flex flex-col h-full
                ${
                  plan.highlight
                    ? "bg-gray-900/80 border-blue-500/50 shadow-2xl shadow-blue-900/20 lg:-mt-8 lg:mb-8"
                    : "bg-gray-900/40 border-white/5 hover:border-white/10 hover:bg-gray-900/60"
                }
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.highlight
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 group-hover:text-white transition-colors"
                  }`}
                >
                  <plan.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-400 mt-2 min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    $
                    {billing === "monthly"
                      ? plan.priceMonthly
                      : plan.priceAnnually}
                  </span>
                  <span className="text-gray-500">/mo</span>
                </div>
                {billing === "annually" && plan.priceMonthly > 0 && (
                  <p className="text-sm text-gray-500 mt-1 line-through">
                    ${plan.priceMonthly}/mo billed monthly
                  </p>
                )}
              </div>

              <div className="flex-grow space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 flex-shrink-0 ${
                        plan.highlight ? "text-blue-400" : "text-gray-500"
                      }`}
                    />
                    <span className="text-sm text-gray-300 leading-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 
                  ${
                    plan.highlight
                      ? "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                      : "bg-gray-800 text-white hover:bg-gray-700 border border-transparent hover:border-gray-600"
                  }
                `}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-gray-500">
            Secure payments via Stripe. Cancel anytime.{" "}
            <br className="hidden md:block" />
            <span className="text-gray-400 hover:text-white transition-colors cursor-pointer underline underline-offset-4 decoration-gray-700">
              Need a custom enterprise license?
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicensePage;
