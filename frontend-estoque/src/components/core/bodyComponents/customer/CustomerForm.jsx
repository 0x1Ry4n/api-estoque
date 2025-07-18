import React, { useState, useEffect } from 'react';
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
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import { AddCircleOutline, PersonOutline, EmailOutlined, PhoneOutlined, DescriptionOutlined, LocationOnOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import InputMask from 'react-input-mask';
import api from './../../../../api';

const CustomerForm = ({ onCustomerAdded }) => {
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isDefaultCustomer] = useState(false);

  const fetchCEP = async (cep) => {
    try {
      const cleanedCEP = cep.replace(/\D/g, '');
      if (cleanedCEP.length !== 8) return;

      const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setValue('address', data.logradouro);
        setValue('neighborhood', data.bairro);
        setValue('city', data.localidade);
        setValue('state', data.uf);
      } else {
        setSnackbarMessage('CEP não encontrado');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setSnackbarMessage('Erro ao buscar CEP');
      setSnackbarOpen(true);
    }
  };

  const handleCEPBlur = (e) => {
    const cep = e.target.value;
    if (cep && cep.length === 9) { 
      fetchCEP(cep);
    }
  };

  const onSubmit = async (data) => {
    const customerData = {
      name: isDefaultCustomer ? null : data.name,
      cpf: isDefaultCustomer ? null : data.cpf,
      cnpj: isDefaultCustomer ? null : data.cnpj,
      ie: isDefaultCustomer ? null : data.ie,
      im: isDefaultCustomer ? null : data.im,
      email: isDefaultCustomer ? null : data.email,
      phone: isDefaultCustomer ? null : data.phone,
      mobile: isDefaultCustomer ? null : data.mobile,
      address: isDefaultCustomer ? null : data.address,
      number: isDefaultCustomer ? null : data.number,
      complement: isDefaultCustomer ? null : data.complement,
      neighborhood: isDefaultCustomer ? null : data.neighborhood,
      city: isDefaultCustomer ? null : data.city,
      state: isDefaultCustomer ? null : data.state,
      zipCode: isDefaultCustomer ? null : data.cep,
      status: data.status,
      notes: data.notes,
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
      <Paper
        elevation={4}
        sx={{
          padding: 6,
          borderRadius: 3,
          backgr408840oundColor: '#f5f5f5',
          width: "95%"
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <PersonOutline sx={{ mr: 1 }} />
          Cadastrar Cliente
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{ required: 'Nome completo é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    label="Nome Completo"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    sx={{ mb: 2 }}
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                defaultValue=""
                rules={{ required: 'E-mail é obrigatório', pattern: { value: /^\S+@\S+$/i, message: 'Formato de e-mail inválido' } }}
                render={({ field }) => (
                  <TextField
                    label="E-mail"
                    fullWidth
                    variant="outlined"
                    type="email"
                    {...field}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ mb: 2 }}
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                defaultValue=""
                rules={{ required: 'Telefone é obrigatório' }}
                render={({ field }) => (
                  <InputMask
                    mask="(99) 9999-9999"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    {() => (
                      <TextField
                        label="Telefone"
                        fullWidth
                        variant="outlined"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        sx={{ mb: 2 }}
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
            </Grid>


            <Grid item xs={12} sm={6}>
              <Controller
                name="mobile"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <InputMask
                    mask="(99) 99999-9999"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    {() => (
                      <TextField
                        label="Celular"
                        fullWidth
                        variant="outlined"
                        error={!!errors.mobile}
                        helperText={errors.mobile?.message}
                        sx={{ mb: 2 }}
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="cpf"
                control={control}
                defaultValue=""
                rules={{
                  validate: (value) => {
                    if (!value && !control._formValues.cnpj) return 'CPF ou CNPJ é obrigatório';
                    return true;
                  },
                  pattern: {
                    value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                    message: 'Formato de CPF inválido'
                  }
                }}
                render={({ field }) => (
                  <InputMask
                    mask="999.999.999-99"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    {() => (
                      <TextField
                        label="CPF"
                        fullWidth
                        variant="outlined"
                        error={!!errors.cpf}
                        helperText={errors.cpf?.message}
                        sx={{ mb: 2 }}
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="cnpj"
                control={control}
                defaultValue=""
                rules={{
                  pattern: {
                    value: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
                    message: 'Formato de CNPJ inválido',
                  },
                }}
                render={({ field }) => (
                  <InputMask
                    mask="99.999.999/9999-99"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    {() => (
                      <TextField
                        label="CNPJ"
                        fullWidth
                        variant="outlined"
                        error={!!errors.cnpj}
                        helperText={errors.cnpj?.message}
                        sx={{ mb: 2 }}
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
            </Grid>

            <Grid item xs={12} sm={3}>
              <Controller
                name="cep"
                control={control}
                defaultValue=""
                rules={{ required: 'CEP é obrigatório', pattern: { value: /^\d{5}-\d{3}$/, message: 'Formato de CEP inválido' } }}
                render={({ field }) => (
                  <InputMask
                    mask="99999-999"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={handleCEPBlur}
                  >
                    {() => (
                      <TextField
                        label="CEP"
                        fullWidth
                        variant="outlined"
                        error={!!errors.cep}
                        helperText={errors.cep?.message}
                        sx={{ mb: 2 }}
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="address"
                control={control}
                defaultValue=""
                rules={{ required: 'Endereço é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    label="Endereço"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Controller
                name="number"
                control={control}
                defaultValue=""
                rules={{ required: 'Número é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    label="Número"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.number}
                    helperText={errors.number?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="complement"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    label="Complemento"
                    fullWidth
                    variant="outlined"
                    {...field}
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="neighborhood"
                control={control}
                defaultValue=""
                rules={{ required: 'Bairro é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    label="Bairro"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.neighborhood}
                    helperText={errors.neighborhood?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="city"
                control={control}
                defaultValue=""
                rules={{ required: 'Cidade é obrigatória' }}
                render={({ field }) => (
                  <TextField
                    label="Cidade"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="state"
                control={control}
                defaultValue=""
                rules={{ required: 'UF é obrigatória', maxLength: { value: 2, message: 'UF deve ter 2 caracteres' } }}
                render={({ field }) => (
                  <TextField
                    label="UF"
                    fullWidth
                    variant="outlined"
                    inputProps={{ maxLength: 2 }}
                    {...field}
                    error={!!errors.state}
                    helperText={errors.state?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="ie"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    label="IE"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.ie}
                    helperText={errors.ie?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="im"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    label="IM"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.im}
                    helperText={errors.im?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
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
                    sx={{ mb: 2 }}
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Status</Typography>
                <Controller
                  name="status"
                  control={control}
                  defaultValue="ACTIVE"
                  rules={{ required: 'Status é obrigatório' }}
                  render={({ field }) => (
                    <Select {...field} variant="outlined" error={!!errors.status}>
                      <MenuItem value="ACTIVE">Ativo</MenuItem>
                      <MenuItem value="INACTIVE">Inativo</MenuItem>
                      <MenuItem value="BLOCKED">Bloqueado</MenuItem>
                      <MenuItem value="SUSPENDED">Suspenso</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 4, display: "flex", alignItems: "center" }}
          >
            <AddCircleOutline sx={{ mr: 1 }} /> Cadastrar Cliente
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

export default CustomerForm;