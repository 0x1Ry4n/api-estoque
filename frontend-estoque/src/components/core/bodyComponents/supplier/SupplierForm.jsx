import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
  Select,
  MenuItem,
} from "@mui/material";
import {
  AddCircleOutline,
  PersonOutline,
  EmailOutlined,
  PhoneOutlined,
  BusinessOutlined,
  WebOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import InputMask from "react-input-mask";
import api from "./../../../../api";
import { useForm, Controller } from "react-hook-form";

const SupplierForm = ({ onSupplierAdded }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/supplier", data);
      if (response.status === 201) {
        onSupplierAdded?.(response.data);
        setSnackbarMessage("Fornecedor cadastrado com sucesso!");
        reset();
      } else {
        setSnackbarMessage(
          "Erro ao cadastrar fornecedor: " + response.data.message
        );
      }
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Erro ao cadastrar fornecedor");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <Box>
      <Paper
        elevation={4}
        sx={{
          padding: 10,
          borderRadius: 3,
          backgroundColor: "#f5f5f5",
          width: "95%",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          <PersonOutline sx={{ mr: 1 }} /> Cadastrar Fornecedor
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Campo Razão Social */}
          <Controller
            name="socialReason"
            control={control}
            defaultValue=""
            rules={{ required: "A razão social é obrigatória." }}
            render={({ field }) => (
              <TextField
                label="Razão Social"
                fullWidth
                variant="outlined"
                {...field}
                error={!!errors.socialReason}
                helperText={
                  errors.socialReason ? errors.socialReason.message : ""
                }
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Campo CNPJ com máscara */}
          <Controller
            name="cnpj"
            control={control}
            defaultValue=""
            rules={{ required: "O CNPJ é obrigatório." }}
            render={({ field }) => (
              <InputMask
                mask="99.999.999/9999-99"
                value={field.value}
                onChange={field.onChange}
                required
              >
                {() => (
                  <TextField
                    label="CNPJ"
                    fullWidth
                    variant="outlined"
                    error={!!errors.cnpj}
                    helperText={errors.cnpj ? errors.cnpj.message : ""}
                    sx={{ mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessOutlined />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>
            )}
          />

          {/* Campo E-mail */}
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{
              required: "O e-mail é obrigatório.",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "O e-mail deve ser válido.",
              },
            }}
            render={({ field }) => (
              <TextField
                label="E-mail"
                fullWidth
                variant="outlined"
                {...field}
                error={!!errors.email}
                helperText={errors.email ? errors.email.message : ""}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Campo Telefone com máscara */}
          <Controller
            name="phone"
            control={control}
            defaultValue=""
            rules={{ required: "O telefone é obrigatório." }}
            render={({ field }) => (
              <InputMask
                mask="(99) 99999-9999"
                value={field.value}
                onChange={field.onChange}
                required
              >
                {() => (
                  <TextField
                    label="Telefone"
                    fullWidth
                    variant="outlined"
                    error={!!errors.phone}
                    helperText={errors.phone ? errors.phone.message : ""}
                    sx={{ mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlined />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>
            )}
          />

          {/* Campo Pessoa de Contato */}
          <Controller
            name="contactPerson"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                label="Pessoa de Contato"
                fullWidth
                variant="outlined"
                {...field}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Campo CEP com máscara */}
          <Controller
            name="cep"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <InputMask
                mask="99999-999"
                value={field.value}
                onChange={field.onChange}
              >
                {() => (
                  <TextField
                    label="CEP"
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 4 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnOutlined />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>
            )}
          />

          {/* Campo Website */}
          <Controller
            name="website"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                label="Website"
                fullWidth
                variant="outlined"
                {...field}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WebOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          {/* Campo Preferência de Comunicação */}
          <Controller
            name="communicationPreference"
            control={control}
            defaultValue=""
            rules={{ required: "A preferência de comunicação é obrigatória." }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Preferência de Comunicação"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WebOutlined />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                error={!!errors.communicationPreference}
                helperText={errors.communicationPreference?.message}
              >
                <MenuItem value="EMAIL">Email</MenuItem>
                <MenuItem value="PHONE">Telefone</MenuItem>
              </TextField>
            )}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 4, display: "flex", alignItems: "center" }}
          >
            <AddCircleOutline sx={{ mr: 1 }} /> Cadastrar Fornecedor
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes("Erro") ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupplierForm;
