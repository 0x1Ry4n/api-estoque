import { createTheme } from "@mui/material/styles";
import Inter from "../../public/static/fonts/Inter.ttf";

const baseTheme = {
  spacing: 4,
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: url(${Inter}) format('truetype');
          unicodeRange: U+0000-00FF;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "light",
    primary: {
      main: "#00796b", 
    },
    secondary: {
      main: "#009688",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
      variant: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#555",
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "#80cbc4", 
    },
    secondary: {
      main: "#26a69a",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
      variant: "#2a2a2a"
    },
    text: {
      primary: "#ffffff",
      secondary: "#bbbbbb",
    },
  },
});
