/* eslint-disable react-refresh/only-export-components */
import { ErrorOutline as ErrorOutlineIcon } from "@mui/icons-material";
import { Alert, Snackbar } from "@mui/material";
import { createContext, PropsWithChildren, useContext, useState } from "react";

function useNotifierState() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  return {
    error: (error: any) => {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(error.toString());
      }
      setSnackbarOpen(true);
    },
    _errorMessage: errorMessage,
    _snackbarOpen: snackbarOpen,
    _closeSnackbar: () => {
      setSnackbarOpen(false);
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
          color="error"
          onClose={notifierState._closeSnackbar}
          icon={<ErrorOutlineIcon />}
        >
          {notifierState._errorMessage}
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
