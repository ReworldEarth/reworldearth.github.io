import { createTheme } from "@mui/material/styles";
import colors from "./colors";

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: {
      main: "#19857b",
    },
    success: {
      main: colors.buttons.secondary,
    },
    text: colors.text,
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h1: {
      fontFamily: "Poppins, sans-serif",
    },
    h3: {
      fontSize: "24px",
      fontWeight: "700",
    },
    subtitle1: {
      fontSize: "11px",
      lineHeight: "1.2em",
      fontWeight: 400,
      letterSpacing: "3px",
      textTransform: "uppercase",
    },
  },
});

export default theme;
