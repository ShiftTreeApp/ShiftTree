import { Box } from "@mui/material";

export default function NavbarPadding() {
  return (
    <Box
      sx={{
        paddingTop: { xs: "52px", sm: "60px", md: "64px" }, // Add top margin to account for AppBar height
      }}
    ></Box>
  );
}
