import {
  AppBar,
  Button,
  Container,
  FormControl,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function Create() {
  const NO_ORG = "none";

  const [organization, setOrganization] = useState(NO_ORG);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function submit() {
    console.log("Create", { organization, name, description });
  }

  return (
    <Grid container spacing={4}>
      <AppBar position="sticky" color="primary">
        <Toolbar>Navbar placeholder</Toolbar>
      </AppBar>
      <Container component="main" maxWidth="sm">
        <Grid container spacing={4} direction="column">
          <Grid container spacing={1} direction="column">
            <Typography variant="h5">Create a new ShiftTree</Typography>
            <Typography>
              You can add shfits and invite members after creation
            </Typography>
          </Grid>
          <Grid container direction="row" spacing={2} sx={{ width: "100%" }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="owner-id-label">Owner</InputLabel>
              <Select
                labelId="owner-id-label"
                label="Owner"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                fullWidth
              >
                <MenuItem value={NO_ORG}>Myself</MenuItem>
              </Select>
            </FormControl>
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
            <Button variant="contained" color="primary" onClick={submit}>
              Create ShiftTree
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
}
