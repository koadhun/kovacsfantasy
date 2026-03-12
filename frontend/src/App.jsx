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
import PerfectChallenge from "./pages/PerfectChallenge";

import Users from "./pages/Users";
import ScheduleResultsEditor from "./pages/admin/ScheduleResultsEditor";
import AdminStandings from "./pages/AdminStandings.jsx";

function hasToken() {
  return !!localStorage.getItem("token");
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          hasToken() ? (
            <Navigate to="/schedule" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

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

      <Route
        path="/fantasy/perfect-challenge"
        element={
          <ProtectedRoute>
            <Layout>
              <PerfectChallenge />
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

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminLayout />
            </Layout>
          </ProtectedRoute>
        }
      >
        <Route path="users" element={<Users />} />
        <Route path="standings" element={<AdminStandings />} />
        <Route path="schedule-results" element={<ScheduleResultsEditor />} />
        <Route index element={<Navigate to="users" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}