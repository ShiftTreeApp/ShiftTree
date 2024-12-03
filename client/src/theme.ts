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
      light: "#abcbad", // Pale Green
      veryLight: "#f1f8e9", // Offwhite
    },
    secondary: {
      main: "#ffa000", // Light Orange
      light: "#ffca70", // Pale Orange
      veryLight: "#ffe082", // Pale Orange-Yellow
      light2: "#ffecb0", // Orange Tint Offwhite
    },
    info: {
      main: "#58A4B0", // Medium Cyan
      light: "#527B6A", // Turquoise
      light2: "#9BC1BC", // Pale Cyan
      dark: "#A491D3", // Pale Purple
    },
    error: {
      main: "#f26868", // Pale Red
      light: "#f58686", // Paler Red
      veryLight: "#f8d7da", // Pink Tint Offwhite
      dark: "#C20114", // Deep Red
    },
    background: {
      default: "#e0ebc9", // Green Tint Offwhite
      paper: "#f3f7e2", // Background for Paper components (lighter shade)
    },
  },
});

export default customTheme;
