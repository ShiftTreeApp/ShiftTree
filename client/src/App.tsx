import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./SignIn.tsx";
import SignUp from "./SignUp.tsx";
import { ApiProvider } from "@/client.tsx";

import { Authenticated, AuthProvider } from "@/auth";
import Home from "@/Home.tsx";
import Create from "@/Create.tsx";
import Profile from "@/Profile.tsx";
//import EditProfile from "@/EditProfile.tsx"; // To be added later
import NotFoundPage from "@/NotFound.tsx";

import { ThemeProvider } from "@mui/material/styles";
import customTheme from "./theme";
import { NotifierProvider } from "@/notifier.tsx";
import SignUpConfirmation from "./SignUpConfirmation.tsx";
import ScheduleShared from "@/schedule/ScheduleShared.tsx";

export default function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <NotifierProvider>
        <ApiProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<SignIn />} />
                <Route path="/register" element={<SignUp />} />
                {/* Put authenticated routes below */}
                <Route
                  path="/signup-confirmation"
                  // must be authenticated to view this page. just testing rn
                  element={<SignUpConfirmation />}
                />
                <Route
                  path="/"
                  element={
                    <Authenticated>
                      <Home />
                    </Authenticated>
                  }
                />
                <Route
                  path="/create"
                  element={
                    <Authenticated>
                      <Create />
                    </Authenticated>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Authenticated>
                      <Profile />
                    </Authenticated>
                  }
                />
                {/* Will be re-added once implemented
                <Route
                  path="/edit_profile"
                  element={
                    <Authenticated>
                      <EditProfile />
                    </Authenticated>
                  }
                />
                */}
                <Route
                  path="/schedule/:scheduleId"
                  element={
                    <Authenticated>
                      <ScheduleShared />
                    </Authenticated>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ApiProvider>
      </NotifierProvider>
    </ThemeProvider>
  );
}
