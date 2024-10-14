import { BrowserRouter, Route, Routes } from "react-router-dom";
// import * as React from "react";
import SignIn from "./SignIn.tsx";
import SignUp from "./SignUp.tsx";
import { ApiProvider } from "@/client.tsx";

import { Authenticated, AuthProvider } from "@/auth";
import Home from "@/Home.tsx";

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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApiProvider>
  );
}
