import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  addDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import db from "../firebase-config";

// date dependencies
import Stack from "@mui/material/Stack";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CreateInterview = ({
  open,
  handleClose,
  setMount,
  defaultValues = {},
}) => {
  const [disabled, setDisabled] = useState(false);
  const [prevMeets, setPrevMeets] = useState([]);
  const [value, setValue] = useState(new Date());

  const [email, setEmail] = useState("");
  const [title, setTitle] = useState(defaultValues.title || "");
  const [userList, setUserList] = useState([]);

  const [error, setError] = useState({
    status: undefined,
    message: "",
  });

  // Handlers
  const handleChange = (newValue) => {
    setValue(new Date(newValue));
    setDisabled(false);
    console.log("change");
  };

  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setError({
      status: undefined,
      message: "",
    });
  };

  const handleEmailInput = (e) => {
    console.log(e.target.value);
    setEmail(e.target.value);
  };

  // Get meeting data for a particular user
  const getData = async (id) => {
    const meetq = query(collection(db, `user/${id}/meets`));
    const meetdetails = await getDocs(meetq);
    const data = []; // [{to:, from:}]
    meetdetails.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  };

  // Add a new user by email to the list
  const addUser = async (email) => {
    try {
      if (email === null || email.length <= 0) {
        throw new Error("Email field can not be empty !");
      } else {
        if (userList.length && userList.find((user) => email === user.email)) {
          throw new Error("User already in the participant list!");
        }
        const q = query(collection(db, "user"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        // console.log(querySnapshot);
        if (querySnapshot.size === 0) {
          throw new Error("Email does not exist !");
        }
        let temp = []; //[promises]
        querySnapshot.forEach(async (doc) => {
          const meetingData = getData(doc.id);
          temp.push(meetingData);
          setUserList((prev) => {
            return [...prev, { id: doc.id, ...doc.data() }];
          });
        });

        temp = await Promise.all(temp);
        console.log(email, temp);
        setPrevMeets((prev) => [...prev, ...temp]);

        setError({
          status: "success",
          message: "User successfully added !",
        });
      }
    } catch (err) {
      setError({
        status: "error",
        message: err.message,
      });
      console.log("Something went wrong while adding User!");
    }
  };

  // Remove user from list
  const removeUserFromList = (email) => {
    setDisabled(false);
    let ind = userList.findIndex((user) => user.email === email);
    setUserList((pre) => {
      return pre.filter((el, index) => {
        return index !== ind;
      });
    });
    setPrevMeets((pre) => {
      return pre.filter((el, index) => {
        return index !== ind;
      });
    });
  };

  // Create a new interview
  const handleCreate = async () => {
    try {
      if (!title) throw new Error("Title can not be empty !");
      const interRef = await addDoc(collection(db, "meetings"), {
        from: value,
        participants: userList.map((u) => u.id),
        title,
      });
      await Promise.all(
        userList.map(async (u) => {
          return setDoc(doc(db, "user", u.id, "meets", interRef.id), {
            from: value,
          });
        })
      );
      handleClose();
      setError({ status: undefined });
    } catch (e) {
      console.log(e);
      setError({
        status: "error",
        message: e.message,
      });
    }
  };

  // Update a previous interview
  const handleUpdate = async () => {
    try {
      if (!title) throw new Error("Title can not be empty !");
      const interRef = await updateDoc(doc(db, "meetings", defaultValues.id), {
        from: value,
        participants: userList.map((u) => u.id),
        title,
      });
      await Promise.all(
        userList.map(async (u) => {
          return setDoc(doc(db, "user", u.id, "meets", defaultValues.id), {
            from: value,
          });
        })
      );
      handleClose();
      setError({ status: undefined });
    } catch (e) {
      console.log(e);
      setError({
        status: "error",
        message: e.message,
      });
    }
  };

  // Run effect when editing a previous interview
  useEffect(() => {
    console.log(defaultValues);
    if (defaultValues.participants) {
      defaultValues.participants.forEach((user) => {
        addUser(user.email);
      });
      setValue(new Date(defaultValues.from.seconds * 1000));
    }
  }, [defaultValues]);

  // Render functions
  function disableWeekends(data) {
    if (defaultValues.from) {
      const d = new Date(defaultValues.from.seconds * 1000);
      if (
        data.$D === d.getDate() &&
        data.$M === d.getMonth() &&
        data.$y === d.getFullYear()
      )
        return false;
    }

    let flag = false;
    prevMeets.forEach((prev) => {
      prev.forEach((p) => {
        let from = new Date(p.from.seconds * 1000);
        flag =
          flag ||
          (data.$D === from.getDate() &&
            data.$M === from.getMonth() &&
            data.$y === from.getFullYear());
      });
    });
    return flag;
  }

  // Render
  return (
    <Dialog open={open} onClose={handleClose}>
      {error.status && (
        <Stack spacing={2} sx={{ width: "100%" }}>
          <Snackbar
            open={error.status}
            autoHideDuration={3000}
            handleClose={handleErrorClose}
          >
            <Alert
              handleClose={handleErrorClose}
              severity={error.status}
              sx={{ width: "100%" }}
            >
              {error.message}
            </Alert>
          </Snackbar>
        </Stack>
      )}
      <DialogTitle>Create Interview</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <TextField
            name="title"
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            fullWidth
            sx={{ my: 1 }}
          />
          <TextField
            name="email"
            label="Email"
            value={email}
            onChange={handleEmailInput}
            fullWidth
            sx={{ my: 1 }}
          />
          <Button
            variant="contained"
            onClick={() => addUser(email)}
            sx={{ my: 2 }}
          >
            Add Participant
          </Button>
        </Box>
        {userList.length ? (
          <Grid item xs={12} md={6}>
            <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
              Participants
            </Typography>
            <>
              <List dense={true}>
                {userList.map((user, idx) => {
                  return (
                    <ListItem
                      key={idx}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => removeUserFromList(user.email)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={user.name}
                        secondary={user.email}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </>
          </Grid>
        ) : null}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ my: 2, display: "flex", justifyContent: "space-between" }}>
            <DatePicker
              label="Date mobile"
              inputFormat="MM/DD/YYYY"
              value={value}
              onChange={handleChange}
              shouldDisableDate={disableWeekends}
              renderInput={(params) => <TextField {...params} />}
              onError={() => {
                console.log("error");
                setDisabled(true);
              }}
            />
            <TimePicker
              label="Time"
              value={value}
              onChange={handleChange}
              renderInput={(params) => <TextField {...params} />}
              onError={() => {
                setDisabled(true);
              }}
            />
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()}>Close</Button>
        <Button
          disabled={disabled || !title || userList.length < 2}
          onClick={defaultValues.from ? handleUpdate : handleCreate}
        >
          {defaultValues.from ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateInterview;
