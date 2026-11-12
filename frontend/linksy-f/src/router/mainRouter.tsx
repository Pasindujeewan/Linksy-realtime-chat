import { createBrowserRouter } from "react-router";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import LoginPage from "../features/auth/login/LoginPage";
import ProfilePage from "../features/profile/ProfilePage";
import OtherUserProfilePage from "../features/profile/OtherUserProfilePage";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RegisterPage />,
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users/:userId",
    element: (
      <ProtectedRoute>
        <OtherUserProfilePage />
      </ProtectedRoute>
    ),
  },
]);
