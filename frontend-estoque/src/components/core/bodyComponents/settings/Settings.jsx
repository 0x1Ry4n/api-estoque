import React, { Component } from "react";
import { Switch, FormControlLabel, Typography, Box } from "@mui/material";

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      facialRecognition: JSON.parse(localStorage.getItem("facialRecognition")) ?? true,
      // darkMode: JSON.parse(localStorage.getItem("darkMode")) ?? false,
    };
  }

  handleToggle = (setting) => {
    this.setState(
      (prevState) => ({ [setting]: !prevState[setting] }),
      () => {
        localStorage.setItem(setting, JSON.stringify(this.state[setting]));

        // if (setting === "darkMode" && this.props.onToggleTheme) {
        //   this.props.onToggleTheme(this.state.darkMode);
        // }
      }
    );
  };

  render() {
    const { facialRecognition } = this.state;

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Configurações
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={facialRecognition}
              onChange={() => this.handleToggle("facialRecognition")}
              color="primary"
            />
          }
          label={`Reconhecimento Facial: ${facialRecognition ? "Ativado" : "Desativado"}`}
        />

        {/* <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => this.handleToggle("darkMode")}
              color="primary"
            />
          }
          label={`Tema Escuro: ${darkMode ? "Ativado" : "Desativado"}`}
        /> */}
      </Box>
    );
  }
}
