import * as React from "react";
import { Box, CssBaseline, Drawer } from "@mui/material";
import { LeftDrawerContext } from "./Home";
import Calendar_and_Org from "./Calendar_and_Org_display";
const drawerWidth = 360;

export default function ResponsiveDrawer({
  onDateChange,
}: {
  onDateChange: (date: string | null) => void;
}) {
  const LDC = React.useContext(LeftDrawerContext);
  const handleDrawerClose = () => {
    LDC.setIsClosing(true);
    LDC.setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    LDC.setIsClosing(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={LDC.mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "flex", md: "none" }, //BREAKPOINT
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              paddingTop: { xs: "56px", sm: "64px" }, // mobile navbar shrinks -- measured in inspect element
            },
          }}
        >
          <Calendar_and_Org onDateChange={onDateChange} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "flex" }, //BREAKPOINT
            flexDirection: "column",
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              paddingTop: "64px",
            },
          }}
          open
        >
          <Calendar_and_Org onDateChange={onDateChange} />
        </Drawer>
      </Box>
    </Box>
  );
}
