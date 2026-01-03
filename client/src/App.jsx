import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./components/Register";
import Login from "./components/Login";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./components/Dashboard";
import Project from "./pages/Project";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
