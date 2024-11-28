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
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#f8fafc", // Table background similar to paper
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#e5e7eb", // border-gray-200 for light borders
          padding: "6px 12px", // Reduce padding to align with Tailwind-style compactness
        },
        head: {
          backgroundColor: "#f1f5f9", // Header bg like bg-slate-100
          color: "#374151", // Header text color like text-gray-700
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#f1f5f9", // bg-slate-100
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: "#f9fafb", // Alternating row color like bg-slate-50
          },
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
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: "#111827", // dark:bg-slate-900 for dark mode
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#374151", // dark:bg-slate-800 for table background
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#4b5563", // dark:border-gray-700 for dark mode borders
          padding: "4px 8px", // Reduce padding for compactness
          color: "#e5e7eb", // light gray text color like text-gray-300
        },
        head: {
          backgroundColor: "#4b5563", // dark:bg-gray-700 for header background
          color: "#e5e7eb", // Header text color like text-gray-300
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#4b5563", // dark:bg-gray-700 for header background
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: "#1f2937", // Alternating row color like dark:bg-slate-800
          },
        },
      },
    },
  },
})
