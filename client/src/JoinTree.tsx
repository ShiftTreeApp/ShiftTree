import {
  Button,
  Grid2 as Grid,
  Typography,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
//import Navbar from "@/Navbar";
//import Home from "./Home";
import React, { useState } from "react";
import { ModalContext } from "@/Navbar";
import { useEmployeeActions } from "@/hooks/useEmployeeActions";
import { useDatabaseQueries } from "@/hooks/useDatabaseQueries";
import { useNotifier } from "@/notifier";

interface JoinTreeProps {
  joinType: "ShiftTree" | "Organization";
}

export default function JoinTree({ joinType }: JoinTreeProps) {
  const [joinCode, setJoinCode] = useState("");
  const MC = React.useContext(ModalContext);
  const empActions = useEmployeeActions();
  const queries = useDatabaseQueries();
  const notifier = useNotifier();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJoinCode(event.target.value);
  };

  const handleButtonClick = async () => {
    console.log(joinCode);
    empActions
      .join({ joinCode: joinCode })
      .then(() => {
        queries.refetchAllSchedules();
        notifier.message("Successfully joined ShiftTree!"); // Show success notification
        MC.setModalOpen(false);
      })
      .catch(error => {
        notifier.error(
          "Failed to join the ShiftTree. Ensure you have the correct join code.",
        ); // Show error notification
        console.error(error);
      });
  };

  return (
    <Grid container>
      {/* <Grid size={12} sx={{pb: 2}}>
        <Navbar />
      </Grid> */}
      <Grid container size={12} justifyContent="center" alignItems="center">
        <Card>
          <CardContent>
            <Typography variant="h6" align="center">
              Join {joinType}
            </Typography>
            <TextField
              id="outlined-basic"
              label="Enter Join Code"
              variant="outlined"
              fullWidth
              value={joinCode}
              onChange={handleInputChange}
            />
            <Button
              fullWidth
              sx={{
                backgroundColor: theme => theme.palette.secondary.main,
                marginTop: 2, // Spacing between TextField and Button
                padding: "8px 16px", // Padding inside the button
                "&:hover": {
                  backgroundColor: theme => theme.palette.secondary.dark,
                },
              }}
              onClick={handleButtonClick}
            >
              <Typography sx={{ color: "black" }}>Join</Typography>
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
