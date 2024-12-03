import { createTheme } from "@mui/material/styles";
import { PaletteColorOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    primary: PaletteColor;
    secondary: PaletteColor;
    error: PaletteColor;
    Info: PaletteColor;
  }
  interface PaletteOptions {
    primary?: PaletteColorOptions;
    secondary?: PaletteColorOptions;
    error?: PaletteColorOptions;
    Info?: PaletteColorOptions;
  }
  interface PaletteColor {
    veryLight?: string;
    light2?: string;
  }
  interface SimplePaletteColorOptions {
    veryLight?: string;
    light2?: string;
  }
}

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#2E7D32", // Medium Green
      light: "#98bd97", // Pale Green
      veryLight: "#f1f8e9", // Offwhite
    },
    secondary: {
      main: "#ff6f00", // Light Orange
      light: "#ffb300", // Pale Orange
      veryLight: "#ffe082", // Pale Orange-Yellow
      light2: "#ffecb0", // Orange Tint Offwhite
    },
    info: {
      main: "#56bfb3", // Medium Cyan
      light: "#527B6A", // Turquoise
      light2: "#9BC1BC", // Pale Cyan
      dark: "#A491D3", // Pale Purple
    },
    error: {
      main: "#ff5252", // Pale Red
      light: "#f58686", // Paler Red
      veryLight: "#f8d7da", // Pink Tint Offwhite
      dark: "#C20114", // Deep Red
    },
    background: {
      default: "#eaf2ea", // Green Tint Offwhite
      paper: "#f3f7e2", // Background for Paper components (lighter shade)
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // No all-caps
          fontWeight: "medium", // Medium font weight
        },
      },
    },
  },
});

export default customTheme;
