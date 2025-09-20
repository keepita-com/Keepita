import React from "react";

interface BackgroundEffectsProps {}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = () => {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-sky-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-500/10 via-violet-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-3/4 right-1/3 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl"></div>
    </>
  );
};

export default BackgroundEffects;
