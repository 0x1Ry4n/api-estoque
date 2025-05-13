import { useState, useEffect } from "react";
import {
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Paper,
  useMediaQuery,
  useTheme
} from "@mui/material";

const Settings = ({ onToggleTheme }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [facialRecognition, setFacialRecognition] = useState(
    JSON.parse(localStorage.getItem("facialRecognition")) ?? true
  );

  useEffect(() => {
    localStorage.setItem("facialRecognition", JSON.stringify(facialRecognition));
  }, [facialRecognition]);

  return (
    <Box
      sx={{
        width: isMobile ? "100vw" : "80vw",
        minHeight: "100vh",
        p: isMobile ? 4 : 2,
        boxSizing: "border-box",
      }}
    >
      <Paper
        elevation={4}
        sx={{ padding: 6, borderRadius: 2, backgroundColor: "#f5f5f5", width: '95%' }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
            Configurações
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={facialRecognition}
              onChange={() => setFacialRecognition((prev) => !prev)}
              color="primary"
            />
          }
          label={`Reconhecimento Facial: ${facialRecognition ? "Ativado" : "Desativado"}`}
        />
      </Paper>
    </Box>
  );
};

export default Settings;
