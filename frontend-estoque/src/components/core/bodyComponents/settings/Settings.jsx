import { useState, useEffect } from "react";
import { Settings as SettingsIcon } from "@mui/icons-material";
import {
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Paper,
  useMediaQuery,
  useTheme,
  Divider,
  Stack,
} from "@mui/material";

const Settings = ({ onToggleTheme }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [facialRecognition, setFacialRecognition] = useState(() => {
    const saved = localStorage.getItem("facialRecognition");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("facialRecognition", JSON.stringify(facialRecognition));
  }, [facialRecognition]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        px: isMobile ? 10 : 2,
        py: 4,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 850,
          p: isMobile ? 4 : 6,
          borderRadius: 2,
          backgroundColor: "#fafafa",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
          <SettingsIcon sx={{ color: "#00796b", mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Configurações
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={facialRecognition}
                onChange={() => setFacialRecognition((prev) => !prev)}
                color="primary"
              />
            }
            label={
              <Typography>
                Reconhecimento Facial:{" "}
                <strong>{facialRecognition ? "Ativado" : "Desativado"}</strong>
              </Typography>
            }
          />
        </Stack>
      </Paper>
    </Box>
  );
};

export default Settings;
