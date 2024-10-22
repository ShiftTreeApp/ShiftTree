import { BrowserRouter, Route, Routes } from "react-router-dom";
// import * as React from "react";
import SignIn from "./SignIn.tsx";
import SignUp from "./SignUp.tsx";
import { ApiProvider } from "@/client.tsx";

import { Authenticated, AuthProvider } from "@/auth";
import Home from "@/Home.tsx";
import Create from "@/Create.tsx";
import JoinTree from "@/JoinTree.tsx";
import Profile from "@/Profile.tsx"
import EditProfile from "@/EditProfile.tsx"

export default function App() {
  return (
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
              path="/join"
              element={
                <Authenticated>
                  <JoinTree />
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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApiProvider>
  );
}
