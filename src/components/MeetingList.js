import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import db from "../firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { Box, Button, Card, CircularProgress, Typography } from "@mui/material";
import CreateInterview from "./CreateInterview";

function MeetingList({ mount, handleClose }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  //   Fetch Interviews
  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "meetings"));

      const querySnapshot = await getDocs(q);
      const snaps = [];
      querySnapshot.forEach((doc) => {
        snaps.push({ id: doc.id, ...doc.data() });
      });

      let temp = await Promise.all(
        snaps.map((item) => {
          return getUsersInAMeet(item);
        })
      );
      for (let i = 0; i < temp.length; i++) {
        snaps[i].participants = temp[i];
      }

      setInterviews(snaps);
    } catch (e) {
      console.log("Couldn't fetch interviews!");
    }
    setLoading(false);
  };

  //   Fetch All Users in a interview
  const getUsersInAMeet = async (interview) => {
    let parts = [];
    try {
      parts = await Promise.all(
        interview.participants.map(async (participant_id, idx) => {
          console.log(participant_id);
          const docRef = doc(db, "user", participant_id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            console.log(docSnap.data(), 1);
            return { id: participant_id, ...docSnap.data() };
          } else {
            console.log("No such document!");
          }
        })
      );
    } catch (e) {
      console.log(e);
    }
    return parts;
  };

  //   Effect
  useEffect(() => {
    fetchInterviews();
  }, [mount]);

  //   Render
  if (loading)
    return (
      <Grid item>
        <CircularProgress />;
      </Grid>
    );
  return (
    <Grid item xs={12} sx={{ px: 2 }}>
      <Typography variant="h6" fontWeight={"bold"}>
        Scheduled Interviews
      </Typography>
      {interviews.length === 0 && (
        <Typography align="center" color="error" sx={{ mt: 5 }}>
          No scheduled interviews
        </Typography>
      )}
      {interviews.map((interview) => {
        return <Interview interview={interview} handleMount={handleClose} />;
      })}
    </Grid>
  );
}

const Interview = ({ interview, handleMount }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Handle delete
  async function handleDelete() {
    try {
      await Promise.all(
        interview.participants.map((u) => {
          console.log(u);
          return deleteDoc(doc(db, "user", u.id, "meets", interview.id));
        })
      );
      await deleteDoc(doc(db, "meetings", interview.id));
      handleMount();
    } catch (e) {
      console.log(e);
    }
  }

  //   Render Function
  function renderDateTime(seconds) {
    return (
      new Date(seconds * 1000).toLocaleDateString() +
      " " +
      new Date(seconds * 1000).toLocaleTimeString()
    );
  }

  return (
    <Card sx={{ p: 2, my: 1, mb: 2 }}>
      <Box display="flex" justifyContent={"space-between"}>
        <Typography fontWeight={"bold"}>{interview.title}</Typography>
        <Typography>From: {renderDateTime(interview.from.seconds)}</Typography>
      </Box>
      <Box my={2}>
        <Typography color="text.disabled">Participants</Typography>
        {interview.participants.map((p, idx) => {
          return <Typography key={idx}>{p.name}</Typography>;
        })}
      </Box>
      <Box display="flex" justifyContent={"flex-end"}>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          sx={{ mx: 2 }}
        >
          Delete
        </Button>
        <Button onClick={handleOpen} variant="contained">
          Edit
        </Button>
      </Box>

      {open && (
        <CreateInterview
          open={open}
          handleClose={handleMount}
          defaultValues={interview}
        />
      )}
    </Card>
  );
};

export default MeetingList;
