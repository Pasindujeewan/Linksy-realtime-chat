import { RouterProvider } from "react-router";
import { router } from "./router/mainRouter.tsx";
import { ToastProvider } from "./contexts/ToastContext";
import { UserProvider } from "./contexts/UserContext";

function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </ToastProvider>
  );
}

export default App;
