export const ANIMATION_PRESETS = {
  spring: {
    stiff: { type: "spring", stiffness: 400, damping: 17 },
    medium: { type: "spring", stiffness: 300, damping: 30 },
    soft: { type: "spring", stiffness: 200, damping: 20 },
  },
  transition: {
    fast: { duration: 0.2 },
    normal: { duration: 0.3 },
    slow: { duration: 0.5 },
  },
};

export const LAYOUT = {
  sidebar: {
    width: "16rem", 
    mobileWidth: "80%",
  },
  header: {
    height: "3.5rem", 
  },
};

export const Z_INDEX = {
  header: 50,
  sidebar: 40,
  dropdown: 30,
  modal: 100,
  tooltip: 90,
};
