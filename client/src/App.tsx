import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./SignIn.tsx";
import SignUp from "./SignUp.tsx";
import { ApiProvider } from "@/client.tsx";

import { Authenticated, AuthProvider } from "@/auth";
import Home from "@/Home.tsx";
import Create from "@/Create.tsx";
import Profile from "@/Profile.tsx";
import EditProfile from "@/EditProfile.tsx";
import Schedule from "@/schedule/Schedule.tsx";
import EditTree from "@/schedule/EditTree";
import NotFoundPage from "@/NotFound.tsx";

import { ThemeProvider } from "@mui/material/styles";
import customTheme from "./theme";
import { NotifierProvider } from "@/notifier.tsx";

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
                <Route
                  path="/edit_profile"
                  element={
                    <Authenticated>
                      <EditProfile />
                    </Authenticated>
                  }
                />
                <Route
                  path="/schedule/:scheduleId/edit"
                  element={
                    <Authenticated>
                      <EditTree />
                    </Authenticated>
                  }
                />
                <Route
                  path="/schedule/:scheduleId"
                  element={
                    <Authenticated>
                      <Schedule />
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
