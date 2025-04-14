import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  Alert,
  FormControlLabel,
  Grid,
  Snackbar
} from '@mui/material';
import { AddCircleOutline, PersonOutline, EmailOutlined, PhoneOutlined, DescriptionOutlined, LocationOnOutlined } from '@mui/icons-material';
import api from './../../../../api';
import { useForm, Controller } from 'react-hook-form';
import InputMask from 'react-input-mask'; 

const CustomerForm = ({ onCustomerAdded }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm();
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState('CREDIT_CARD');
  const [communicationPreference, setCommunicationPreference] = useState('EMAIL');
  const [isDefaultCustomer, setIsDefaultCustomer] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const onSubmit = async (data) => {
    const customerData = {
      fullname: isDefaultCustomer ? null : data.fullname,
      email: isDefaultCustomer ? null : data.email,
      phone: isDefaultCustomer ? null : data.phone,
      cpf: isDefaultCustomer ? null : data.cpf,
      cep: isDefaultCustomer ? null : data.cep,
      notes: data.notes,
      preferredPaymentMethod,
      communicationPreference,
      isDefaultCustomer,
    };

    try {
      const response = await api.post('/customer', customerData);
      if (response.status === 201) {
        if (typeof onCustomerAdded === 'function') {
          onCustomerAdded(response.data); 
        } else {
          console.error('onSupplierAdded is not a function');
        }

        setSnackbarMessage('Cliente cadastrado com sucesso!');
        setSnackbarOpen(true);
        reset(); 
      }
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      setSnackbarMessage('Erro ao cadastrar cliente!');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 10, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <PersonOutline sx={{ mr: 1 }} />
          Cadastrar Cliente
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {!isDefaultCustomer && (
            <>
              <Controller
                name="fullname"
                control={control}
                defaultValue=""
                rules={{ required: 'Nome completo é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    label="Nome Completo"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.fullname}
                    helperText={errors.fullname ? errors.fullname.message : ''}
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
              <Controller
                name="email"
                control={control}
                defaultValue=""
                rules={{ required: 'E-mail é obrigatório', pattern: { value: /^\S+@\S+$/i, message: 'Formato de e-mail inválido' }}}
                render={({ field }) => (
                  <TextField
                    label="E-mail"
                    fullWidth
                    variant="outlined"
                    type="email"
                    {...field}
                    error={!!errors.email}
                    helperText={errors.email ? errors.email.message : ''}
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
              <Controller
                name="phone"
                control={control}
                defaultValue=""
                rules={{ required: 'Telefone é obrigatório' }}
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
                        helperText={errors.phone ? errors.phone.message : ''}
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
              <Controller
                name="cpf"
                control={control}
                defaultValue=""
                rules={{ required: 'CPF é obrigatório', pattern: { value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, message: 'Formato de CPF inválido' }}}
                render={({ field }) => (
                  <InputMask
                    mask="999.999.999-99"
                    value={field.value}
                    onChange={field.onChange}
                    required
                  >
                    {() => (
                      <TextField
                        label="CPF"
                        fullWidth
                        variant="outlined"
                        error={!!errors.cpf}
                        helperText={errors.cpf ? errors.cpf.message : ''}
                        sx={{ mb: 4 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionOutlined />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </InputMask>
                )}
              />
              <Controller
                name="cep"
                control={control}
                defaultValue=""
                rules={{ required: 'CEP é obrigatório', pattern: { value: /^\d{5}-\d{3}$/, message: 'Formato de CEP inválido' }}}
                render={({ field }) => (
                  <InputMask
                    mask="99999-999"
                    value={field.value}
                    onChange={field.onChange}
                    required
                  >
                    {() => (
                      <TextField
                        label="CEP"
                        fullWidth
                        variant="outlined"
                        error={!!errors.cep}
                        helperText={errors.cep ? errors.cep.message : ''}
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
            </>
          )}
          <Controller
            name="notes"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                label="Notas"
                fullWidth
                variant="outlined"
                {...field}
                multiline
                rows={4}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Método de Pagamento Preferido</Typography>
                <Select
                  value={preferredPaymentMethod}
                  onChange={(e) => setPreferredPaymentMethod(e.target.value)}
                  variant="outlined"
                >
                  <MenuItem value="CREDIT_CARD">Cartão de Crédito</MenuItem>
                  <MenuItem value="DEBIT_CARD">Cartão de Débito</MenuItem>
                  <MenuItem value="MONEY">Dinheiro</MenuItem>
                  <MenuItem value="ANY">Qualquer um</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Preferência de Comunicação</Typography>
                <Select
                  value={communicationPreference}
                  onChange={(e) => setCommunicationPreference(e.target.value)}
                  variant="outlined"
                >
                  <MenuItem value="EMAIL">E-mail</MenuItem>
                  <MenuItem value="SMS">SMS</MenuItem>
                  <MenuItem value="PHONE">Telefone</MenuItem>
                  <MenuItem value="ANY">Qualquer um</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                checked={isDefaultCustomer}
                onChange={(e) => setIsDefaultCustomer(e.target.checked)}
              />
            }
            label="Cliente Padrão"
            sx={{ mb: 4 }}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <AddCircleOutline sx={{ mr: 1 }} />
            Cadastrar Cliente
          </Button>
        </form>
      </Paper>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarMessage.includes('Erro') ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerForm;
