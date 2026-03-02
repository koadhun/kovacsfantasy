import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Schedule from "./pages/Schedule";
import Standings from "./pages/Standings";
import Stats from "./pages/Stats";
import Fantasy from "./pages/Fantasy";
import Profile from "./pages/Profile";

import WeeklyPickEm from "./pages/WeeklyPickEm";
import PickEmLeaderboard from "./pages/PickEmLeaderboard";
import PickEmUserPicks from "./pages/PickEmUserPicks";

import Users from "./pages/Users";

// Admin pages
import ScheduleResultsEditor from "./pages/admin/ScheduleResultsEditor";

export default function App() {
  return (
    <Routes>
      {/* "/" → login, ha nincs token; különben schedule */}
      <Route
        path="/"
        element={
          localStorage.getItem("token") ? (
            <Navigate to="/schedule" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* MAIN APP (protected) */}
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <Layout>
              <Schedule />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/standings"
        element={
          <ProtectedRoute>
            <Layout>
              <Standings />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <Layout>
              <Stats />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fantasy"
        element={
          <ProtectedRoute>
            <Layout>
              <Fantasy />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* WEEKLY PICK'EM */}
      <Route
        path="/fantasy/weekly-pickem"
        element={
          <ProtectedRoute>
            <Layout>
              <WeeklyPickEm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fantasy/weekly-pickem/leaderboard"
        element={
          <ProtectedRoute>
            <Layout>
              <PickEmLeaderboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fantasy/weekly-pickem/user/:userId"
        element={
          <ProtectedRoute>
            <Layout>
              <PickEmUserPicks />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* (ha még bárhol hivatkozol rá, maradhat) */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ✅ ADMIN AREA (AdminLayout + nested admin routes) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="schedule-results" element={<ScheduleResultsEditor />} />

        {/* A már meglévő USERS kezelő oldalad */}
        <Route path="users" element={<Users />} />

        {/* A már meglévő Standings oldalad, amin az admin frissítés már működik */}
        <Route path="standings" element={<Standings />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}