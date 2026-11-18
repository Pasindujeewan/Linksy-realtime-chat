import { RouterProvider } from "react-router";
import { router } from "./router/mainRouter.tsx";
import { ToastProvider } from "./contexts/ToastContext";
import { UserProvider } from "./contexts/UserContext";
import { ChatSocketProvider } from "./contexts/ChatSocketContext";

function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <ChatSocketProvider>
          <RouterProvider router={router} />
        </ChatSocketProvider>
      </UserProvider>
    </ToastProvider>
  );
}

export default App;
