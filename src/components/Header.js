import { AppBar, Toolbar, Typography } from "@mui/material";
import React from "react";

function Header() {
  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Typography variant="h6">Interview Scheduler</Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
