import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import Landing from "./Landing.tsx";
import UserPage from "./UserPage.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<App />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/user" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
