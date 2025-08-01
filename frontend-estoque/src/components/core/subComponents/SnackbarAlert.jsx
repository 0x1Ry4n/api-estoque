import { Snackbar, Alert } from "@mui/material"
import { useState } from "react";

export const SnackbarAlert = ({ message = "", severity = "success", autoHideDuration = 5000 }) => {
    const [open, setOpen] = useState(!!message);

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={handleClose}
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                sx={{ width: "100%" }}
            >
                {message}
            </Alert>
        </Snackbar>
    )
}
