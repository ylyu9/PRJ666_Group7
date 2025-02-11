// Theme configuration
const theme = {
  colors: {
    primary: {
      50: "#f0f9ff", // Lightest sky blue
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9", // Main sky blue
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e", // Darkest sky blue
    },
    secondary: {
      50: "#fdf4ff", // Light purple
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef", // Main purple
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
    },
    accent: {
      50: "#fff1f2", // Coral/Pink accents
      100: "#ffe4e6",
      200: "#fecdd3",
      300: "#fda4af",
      400: "#fb7185",
      500: "#f43f5e", // Main coral
      600: "#e11d48",
      700: "#be123c",
      800: "#9f1239",
      900: "#881337",
    },
    success: "#22c55e", // Green
    warning: "#eab308", // Yellow
    error: "#ef4444", // Red
    gray: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
    },
  },
  shadows: {
    sm: "0 2px 4px rgba(0,0,0,0.05)",
    md: "0 4px 6px -1px rgba(0,0,0,0.1)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.1)",
    xl: "0 20px 25px -5px rgba(0,0,0,0.1)",
    inner: "inset 0 2px 4px rgba(0,0,0,0.05)",
    colored: "0 4px 14px 0 rgba(14, 165, 233, 0.39)", // Primary color shadow
  },
  gradients: {
    primary: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
    secondary: "linear-gradient(135deg, #d946ef 0%, #ec4899 100%)",
    accent: "linear-gradient(135deg, #f43f5e 0%, #f97316 100%)",
  },
};

export default theme;
