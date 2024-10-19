import { createTheme } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',   // #008b00
    },
    secondary: {
      main: '#ffa000',
    },
    error: {
        main: '#e63205'
    },
    background: {
        default: '#e0ebc9',  // Default background
        paper: '#f3f7e2',    // Background for Paper components (lighter shade)
      },
  },
});

export default customTheme;
