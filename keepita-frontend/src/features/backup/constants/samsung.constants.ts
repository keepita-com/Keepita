


export const samsungColors = {
  
  primary: {
    50: "#e8f4ff",
    100: "#c3e3ff",
    200: "#9bd1ff",
    300: "#6dbeff",
    400: "#42abff",
    500: "#1c96ff", 
    600: "#1a87e6",
    700: "#1876cc",
    800: "#1565b3",
    900: "#124d8a",
  },

  
  background: {
    primary: "#ffffff",
    secondary: "#f8f9fa",
    tertiary: "#f1f3f4",
    elevated: "#ffffff",
    overlay: "rgba(0, 0, 0, 0.4)",
  },

  
  surface: {
    primary: "#ffffff",
    secondary: "#f8f9fa",
    tertiary: "#e8eaed",
    elevated: "#ffffff",
    container: "#f1f3f4",
  },

  
  text: {
    primary: "#1f1f1f",
    secondary: "#5f6368",
    tertiary: "#80868b",
    disabled: "#9aa0a6",
    inverse: "#ffffff",
    accent: "#1c96ff",
  },

  
  icon: {
    primary: "#5f6368",
    secondary: "#80868b",
    accent: "#1c96ff",
    disabled: "#9aa0a6",
    inverse: "#ffffff",
  },

  
  border: {
    light: "#e8eaed",
    medium: "#dadce0",
    dark: "#5f6368",
    accent: "#1c96ff",
  },

  
  status: {
    success: "#34a853",
    warning: "#fbbc05",
    error: "#ea4335",
    info: "#1c96ff",
  },

  
  samsung: {
    blue: "#1c96ff",
    lightBlue: "#e8f4ff",
    darkBlue: "#124d8a",
    gray100: "#f8f9fa",
    gray200: "#e8eaed",
    gray300: "#dadce0",
    gray400: "#bdc1c6",
    gray500: "#9aa0a6",
    gray600: "#80868b",
    gray700: "#5f6368",
    gray800: "#3c4043",
    gray900: "#1f1f1f",
  },

  
  contact: {
    avatarBg: [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#feca57",
      "#ff9ff3",
      "#54a0ff",
    ],
    favoriteActive: "#ffd700",
    favoriteInactive: "#9aa0a6",
    onlineStatus: "#34a853",
    awayStatus: "#fbbc05",
    busyStatus: "#ea4335",
    offlineStatus: "#9aa0a6",
  },

  
  interaction: {
    hover: "rgba(28, 150, 255, 0.08)",
    pressed: "rgba(28, 150, 255, 0.12)",
    selected: "rgba(28, 150, 255, 0.16)",
    focus: "rgba(28, 150, 255, 0.24)",
    disabled: "rgba(0, 0, 0, 0.12)",
  },

  
  dark: {
    background: {
      primary: "#121212",
      secondary: "#1e1e1e",
      tertiary: "#2d2d2d",
      elevated: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
      tertiary: "#8c8c8c",
      disabled: "#666666",
    },
    surface: {
      primary: "#1e1e1e",
      secondary: "#2d2d2d",
      elevated: "#3d3d3d",
    },
  },
} as const;


export const getSamsungColors = () => samsungColors;

export const getContactAvatarColor = (index: number): string => {
  return samsungColors.contact.avatarBg[
    index % samsungColors.contact.avatarBg.length
  ];
};

export const getSamsungTextColor = (
  variant: "primary" | "secondary" | "tertiary" | "accent" = "primary"
): string => {
  return samsungColors.text[variant];
};

export const getSamsungBackgroundColor = (
  variant: "primary" | "secondary" | "tertiary" | "elevated" = "primary"
): string => {
  return samsungColors.background[variant];
};


export const samsungTailwindClasses = {
  
  bg: {
    primary: "bg-white",
    secondary: "bg-gray-50",
    tertiary: "bg-gray-100",
    accent: "bg-blue-500",
    surface: "bg-white",
  },

  
  text: {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    tertiary: "text-gray-500",
    accent: "text-blue-500",
    inverse: "text-white",
  },

  
  border: {
    light: "border-gray-200",
    medium: "border-gray-300",
    accent: "border-blue-500",
  },

  
  hover: {
    bg: "hover:bg-gray-50",
    text: "hover:text-blue-600",
  },

  
  active: {
    bg: "active:bg-gray-100",
    text: "active:text-blue-700",
  },
} as const;

export default samsungColors;
