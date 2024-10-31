import { BrowserRouter, Route, Routes } from "react-router-dom";
// import * as React from "react";
import SignIn from "./SignIn.tsx";
import SignUp from "./SignUp.tsx";
import { ApiProvider } from "@/client.tsx";

import { Authenticated, AuthProvider } from "@/auth";
import Home from "@/Home.tsx";
import Create from "@/Create.tsx";
//import JoinTree from "@/JoinTree.tsx";

import { ThemeProvider } from "@mui/material/styles";
import customTheme from "./theme";
//import Schedule from "@/Schedule.tsx";
import ScheduleView from "./Schedule_view.tsx";

export default function App() {
  return (
    <ThemeProvider theme={customTheme}>
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
                path="/schedule/:scheduleId"
                element={
                  <Authenticated>
                    <ScheduleView
                      shiftTreeName="First ever ShiftTree"
                      isManager={true}
                    />
                  </Authenticated>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ApiProvider>
    </ThemeProvider>
  );
}
