import {
  Button,
  Container,
  Grid2 as Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Create as CreateIcon } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useApi } from "@/client";
import Navbar from "@/Navbar";
import NavbarPadding from "@/NavbarPadding";

export default function Create() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const api = useApi();
  const { mutateAsync: createSchedule } = api.useMutation("post", "/schedules");

  const navigate = useNavigate();

  function submit() {
    console.log("Create", { name, description });
    createSchedule({ body: { name, description } })
      .then(res => {
        console.log("Created");
        navigate(`/schedule/${res.scheduleId}/edit`);
      })
      .catch(err => {
        // TODO: Show error message with a notification or something
        console.error("Failed to create schedule", err);
      });
  }

  return (
    <Grid container gap={2} direction="column">
      <Navbar />
      <NavbarPadding />
      <Container component="main" maxWidth="sm">
        <Grid container spacing={4} direction="column">
          <Grid container spacing={1} direction="column">
            <Typography variant="h5">Create a new ShiftTree</Typography>
            <Typography>
              You can add shfits and invite members after creation
            </Typography>
          </Grid>
          <Grid container direction="row" spacing={2} sx={{ width: "100%" }}>
            <TextField
              label="ShiftTree name"
              sx={{ flexGrow: 1 }}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Grid>
          <TextField
            label="Description (optional)"
            sx={{ flexGrow: 1 }}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Grid container direction="row" sx={{ justifyContent: "end" }}>
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              color="primary"
              onClick={submit}
            >
              Create ShiftTree
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
}
