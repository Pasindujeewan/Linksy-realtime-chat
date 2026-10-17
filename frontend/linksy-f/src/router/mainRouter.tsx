import { createBrowserRouter } from "react-router";
import RegisterPage from "../pages/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RegisterPage />,
  },
  { path: "/register", element: <RegisterPage /> },
]);
