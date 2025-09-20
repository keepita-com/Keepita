// Main layout component
import MainLayout from "./pages/MainLayout";

// Components
export { default as Logo } from "./components/Logo";
export { default as NavBar } from "./components/NavBar";
export { default as MobileMenuButton } from "./components/MobileMenuButton";
export { default as Notifications } from "./components/Notifications";
export { default as UserProfile } from "./components/UserProfile";
export { default as Sidebar } from "./components/Sidebar";

// Hooks
export { useNavigation } from "./hooks/useNavigation";

// Context
export { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Types
export type { NavItem } from "./types";

// Main export
export { MainLayout };
