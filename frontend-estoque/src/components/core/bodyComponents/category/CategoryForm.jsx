import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { AddCircleOutline, CategoryOutlined } from '@mui/icons-material';
import api from './../../../../api'; 
import { useForm, Controller } from 'react-hook-form';

const CategoryForm = ({ onCategoryAdded }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const onSubmit = async (data) => {
    const categoryData = {
      name: data.name,
    };

    try {
      const response = await api.post('/category', categoryData);
      if (response.status === 201) {
        if (typeof onCategoryAdded === 'function') {
          onCategoryAdded(response.data); 
        } else {
          console.error('onCategoryAdded is not a function');
        }

        setSnackbarMessage('Categoria cadastrada com sucesso!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        reset();  
      }
    } catch (error) {
      setSnackbarMessage('Erro ao cadastrar categoria: ' + (error.response?.data?.message || 'Erro desconhecido.'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 10, borderRadius: 2, backgroundColor: '#f5f5f5',  width: "95%",}}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <CategoryOutlined sx={{ mr: 1 }} />
          Cadastrar Categoria
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: 'Nome da categoria é obrigatório' }}
            render={({ field }) => (
              <TextField
                label="Nome da Categoria"
                fullWidth
                variant="outlined"
                {...field}
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryOutlined />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mb: 2 }} 
              />
            )}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <AddCircleOutline sx={{ mr: 1 }} />
            Cadastrar Categoria
          </Button>
        </Box>
      </Paper>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryForm;
