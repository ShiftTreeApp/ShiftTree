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
      main: "#2E7D32", // #008b00
      light: "#abcbad",
      veryLight: "#f1f8e9",
    },
    secondary: {
      main: "#ffa000",
      light: "#ffca70",
      veryLight: "#ffe082",
      light2: "#ffecb0", // used for shift cards for better contrast
    },
    info: {
      main: "#58A4B0",
      light: "#527B6A", // used for green buttons that are not primary
      light2: "#9BC1BC",
      dark: "#A491D3", // purple used for generate shifts button
    },
    error: {
      main: "#f26868",
      light: "#f58686",
      veryLight: "#f8d7da",
    },
    background: {
      default: "#e0ebc9", // Default background
      paper: "#f3f7e2", // Background for Paper components (lighter shade)
    },
  },
});

export default customTheme;
