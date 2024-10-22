import { createTheme } from "@mui/material/styles";

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#2E7D32", // #008b00
      light: "#abcbad",
    },
    secondary: {
      main: "#ffa000",
      light: "#ffca70",
    },
    error: {
      main: "#f26868", //'#e63205'   #e53935
      light: "#f58686",
    },
    background: {
      default: "#e0ebc9", // Default background
      paper: "#f3f7e2", // Background for Paper components (lighter shade)
    },
  },
});

export default customTheme;
