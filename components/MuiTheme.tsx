import { createTheme } from "@mui/material"

export const LightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000", // Primary text color
    },
    background: {
      default: "#fff", // Base canvas
      paper: "#f8fafc", // Slightly off-white like bg-slate-50
    },
    text: {
      primary: "#000", // Black text
      secondary: "#374151", // Dark gray for secondary text
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#f8fafc", // Similar to bg-slate-50
          borderColor: "#e5e7eb", // border-gray-200
          borderRadius: "8px", // rounded-lg
        },
      },
    },
  },
})

export const DarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#fff", // Primary text color in dark mode
    },
    background: {
      default: "#1f2937", // dark:bg-slate-800
      paper: "#374151", // dark bg-slate-800
    },
    text: {
      primary: "#fff", // White text in dark mode
      secondary: "#e5e7eb", // Lighter gray for secondary text
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#374151", // Similar to dark:bg-slate-800
          borderColor: "#4b5563", // dark:border-gray-700
          borderRadius: "8px", // rounded-lg
        },
      },
    },
  },
})
