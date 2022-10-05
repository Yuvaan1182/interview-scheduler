import { Grid, Paper, Typography } from "@mui/material";
import { collection, getDocs, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import db from "../firebase-config";

const UserList = () => {
  const [users, setUsers] = useState([]);

  //   Fetch users
  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "user"));
      const querySnapshot = await getDocs(q);
      const tempUsers = [];
      querySnapshot.forEach((doc) => {
        tempUsers.push({ id: doc.id, ...doc.data() });
      });
      setUsers(tempUsers);
    } catch (e) {
      console.log(e);
    }
  };

  //   Effect
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Grid container xs={4}>
      <Grid item>
        <Typography variant="h6" fontWeight={"bold"}>
          All Users
        </Typography>
      </Grid>
      {users.map((u) => (
        <Grid item xs={12} key={u.id} sx={{ my: 1 }}>
          <Paper width={"100%"} sx={{ py: 1, px: 4 }}>
            <Grid container xs={12}>
              <Grid item xs={12}>
                <Typography variant="h6" color="initial">
                  {u.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={(theme) => ({
                    color: theme.palette.grey[600],
                  })}
                >
                  {u.email}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default UserList;
