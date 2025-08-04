import { useState, useEffect } from "react";
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
import {
  Settings as SettingsIcon
} from "@mui/icons-material";

const Settings = ({ onToggleTheme }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [facialRecognition, setFacialRecognition] = useState(() => {
    const saved = localStorage.getItem("facialRecognition");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem("darkMode")) ?? false;
  });

  const handleToggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    onToggleTheme?.(newValue);
  };

  useEffect(() => {
    localStorage.setItem("facialRecognition", JSON.stringify(facialRecognition));
  }, [facialRecognition]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'self-start',
        ml: !isMobile ? '25%' : '',
        width: isMobile ? '100vw' : '40vw',
        height: '100vh',
        p: isMobile ? 4 : 2,
        mt: 2,
        boxSizing: 'border-box',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 10, width: '100%', maxWidth: 600, borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <SettingsIcon sx={{ color: theme.palette.primary.main, fontSize: 32, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Configurações
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Stack spacing={3}>
          <FormControlLabel
            control={
              <Switch
                checked={facialRecognition}
                onChange={() => setFacialRecognition((prev) => !prev)}
                color="primary"
              />
            }
            label={
              <Typography variant="body1">
                Reconhecimento Facial: <strong>{facialRecognition ? "Ativado" : "Desativado"}</strong>
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={handleToggleDarkMode}
                color="primary"
              />
            }
            label={
              <Typography variant="body1">
                Tema Escuro: <strong>{isDarkMode ? "Ativado" : "Desativado"}</strong>
              </Typography>
            }
          />
        </Stack>
      </Paper>
    </Box>
  );
};

export default Settings;
