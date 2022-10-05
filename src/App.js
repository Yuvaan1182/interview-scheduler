import "./App.css";
import Container from "@mui/material/Container";
import {
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Fab,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import Header from "./components/Header";
import MeetingList from "./components/MeetingList";
import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import CreateInterview from "./components/CreateInterview";
import UserList from "./components/UserList";

function App() {
  const [open, setOpen] = useState(false);
  const [mount, setMount] = useState(false);

  // Handlers
  const handleAddInterview = () => {
    setOpen(true);
  };

  const handleClose = () => {
    console.log("closing aditya");
    setOpen(false);
    setMount((prev) => !prev);
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", pt: 6 }}>
      <Header />
      <Box display="flex" alignItems={"flex-start"} sx={{ mt: 6 }}>
        <UserList />
        <Grid container xs={true}>
          <MeetingList mount={mount} handleClose={handleClose} />
        </Grid>
      </Box>
      <Tooltip title="Add interview">
        <Fab
          sx={{ position: "fixed", bottom: 50, right: 50 }}
          onClick={handleAddInterview}
          color="primary"
        >
          <Add />
        </Fab>
      </Tooltip>
      {open && <CreateInterview open={open} handleClose={handleClose} />}
    </Container>
  );
}

export default App;
