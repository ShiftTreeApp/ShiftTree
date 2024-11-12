/* eslint-disable react-refresh/only-export-components */
import { ErrorOutline as ErrorOutlineIcon } from "@mui/icons-material";
import { Alert, Snackbar } from "@mui/material";
import { createContext, PropsWithChildren, useContext, useState } from "react";

function useNotifierState() {
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"message" | "error" | null>(
    null,
  );
  return {
    error: (error: any) => {
      console.error(error);
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(error.toString());
      }
      setMessageType("error");
    },
    message: (text: string) => {
      console.log(text);
      setMessage(text);
      setMessageType("message");
    },
    _message: message,
    _snackbarOpen: messageType !== null,
    _messageType: messageType,
    _closeSnackbar: () => {
      setMessageType(null);
    },
  };
}

export type Notifier = ReturnType<typeof useNotifierState>;

const NotifierContext = createContext<Notifier | null>(null);

export function NotifierProvider(props: PropsWithChildren) {
  const notifierState = useNotifierState();

  return (
    <NotifierContext.Provider value={notifierState}>
      <Snackbar
        open={notifierState._snackbarOpen}
        onClose={notifierState._closeSnackbar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          color={notifierState._messageType === "error" ? "error" : "success"}
          onClose={notifierState._closeSnackbar}
          icon={<ErrorOutlineIcon />}
        >
          {notifierState._message}
        </Alert>
      </Snackbar>
      {props.children}
    </NotifierContext.Provider>
  );
}

export function useNotifier() {
  const notifier = useContext(NotifierContext);
  if (!notifier) {
    throw new Error("useNotifier must be used within a NotifierProvider");
  }
  return notifier;
}
