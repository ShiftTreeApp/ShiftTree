import { createTheme } from "@mui/material/styles";
import { PaletteColorOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    primary: PaletteColor;
    secondary: PaletteColor;
    error: PaletteColor;
  }
  interface PaletteOptions {
    primary?: PaletteColorOptions;
    secondary?: PaletteColorOptions;
    error?: PaletteColorOptions;
  }
  interface PaletteColor {
    veryLight?: string;
  }
  interface SimplePaletteColorOptions {
    veryLight?: string;
  }
}

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#2E7D32", // #008b00
      light: "#abcbad",
      veryLight: "#f1f8e9",
    },
    secondary: {
      main: "#ffa000",
      light: "#ffca70",
      veryLight: "#ffe082",
    },
    info: {
      main: "#58A4B0",
      light: "#426A5A",
      dark: "#A833B9",
    },
    error: {
      main: "#f26868", //'#e63205'   #e53935
      light: "#f58686",
      veryLight: "#f8d7da",
      dark: "#C20114", // #F40000
    },
    background: {
      default: "#e0ebc9", // Default background
      paper: "#f3f7e2", // Background for Paper components (lighter shade)
    },
  },
});

export default customTheme;
