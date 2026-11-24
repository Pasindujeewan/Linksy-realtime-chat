import { RouterProvider } from "react-router";
import { router } from "./router/mainRouter.tsx";
import { ToastProvider } from "./contexts/ToastContext";
import { UserProvider } from "./contexts/UserContext";
import { ChatSocketProvider } from "./contexts/ChatSocketContext";
import { ConfirmationDialogProvider } from "./contexts/ConfirmationDialogContext";
import { MessageNotificationProvider } from "./contexts/MessageNotificationContext";

function App() {
  return (
    <ToastProvider>
      <ConfirmationDialogProvider>
        <UserProvider>
          <ChatSocketProvider>
            <MessageNotificationProvider>
              <RouterProvider router={router} />
            </MessageNotificationProvider>
          </ChatSocketProvider>
        </UserProvider>
      </ConfirmationDialogProvider>
    </ToastProvider>
  );
}

export default App;
