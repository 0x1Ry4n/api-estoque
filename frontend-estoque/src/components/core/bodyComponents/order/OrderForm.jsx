import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  Paper,
  Grid,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
} from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import api from './../../../../api';
import { useForm, Controller } from 'react-hook-form';

const OrderForm = ({ onOrderAdded }) => {
  const { control, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch customers and products
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/customer');
        setCustomers(response.data.content);
      } catch (error) {
        setErrorMessage('Erro ao buscar clientes.');
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/products');
        setProducts(response.data.content);
      } catch (error) {
        setErrorMessage('Erro ao buscar produtos.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
    fetchProducts();
  }, []);

  const handleProductChange = async (event, newValue) => {
    if (newValue) {
      setValue('productId', newValue); // O novo valor é o objeto do produto
      setValue('inventoryId', null); // Reset inventory when changing product

      try {
        const response = await api.get(`/products/${newValue.id}/inventory`);
        if (Array.isArray(response.data)) {
          setInventories(response.data);
          if (response.data.length > 0) {
            setValue('inventoryId', response.data[0]); // Seleciona o primeiro inventário
          } else {
            setValue('inventoryId', null); // Nenhum inventário disponível
          }
        } else {
          setInventories([]); // Se não for uma lista, reseta
        }
      } catch (error) {
        console.error('Erro ao buscar inventário:', error);
        setInventories([]); // Limpa a lista de inventários em caso de erro
      }
    }
  };

  const onSubmit = async (data) => {
    if (data.quantity <= 0) {
      setErrorMessage('A quantidade deve ser maior que zero.');
      return;
    }

    const orderData = {
      customerId: data.customerId?.id,
      productId: data.productId?.id,
      inventoryId: data.inventoryId?.id,
      quantity: data.quantity,
      paymentMethod: data.paymentMethod,
      status: data.status,
    };

    try {
      const response = await api.post('/orders', orderData);
      if (response.status === 201) {
        setSuccessMessage('Pedido cadastrado com sucesso!');
        if (typeof onOrderAdded === 'function') {
          onOrderAdded(response.data.content);
        }
        reset(); 
        setInventories([]);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erro desconhecido.');
    }
  };

  const handleSnackbarClose = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 10, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <AddCircleOutline sx={{ mr: 1 }} />
          Cadastrar Pedido
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {loading && <CircularProgress />}
          <Grid container spacing={4}>
            <Grid item md={6}>
            <Controller
              name="customerId"
              control={control}
              rules={{ required: 'O cliente é obrigatório.' }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={customers}
                  getOptionLabel={(option) => option.fullname || ''}
                  onChange={(event, newValue) => {
                    field.onChange(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      variant="outlined"
                      error={!!errors.customerId} 
                      helperText={errors.customerId ? errors.customerId.message : ''} 
                    />
                  )}
                />
              )}
            />
            </Grid>
            <Grid item md={6}>
            <Controller
              name="productId"
              control={control}
              rules={{ required: 'O produto é obrigatório.' }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={products}
                  getOptionLabel={(option) => option.name || ''}
                  onChange={(event, newValue) => {
                    handleProductChange(event, newValue);
                    field.onChange(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Produto"
                      variant="outlined"
                      error={!!errors.productId} 
                      helperText={errors.productId ? errors.productId.message : ''} 
                    />
                  )}
                />
              )}
            />
            </Grid>

            <Grid item md={6}>
            <Controller
              name="inventoryId"
              control={control}
              rules={{ required: 'O inventário é obrigatório.' }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={inventories}
                  getOptionLabel={(option) => `${option.location} (${option.quantity} disponíveis)`}
                  onChange={(event, newValue) => {
                    field.onChange(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Inventário"
                      variant="outlined"
                      error={!!errors.inventoryId} 
                      helperText={errors.inventoryId ? errors.inventoryId.message : ''} 
                    />
                  )}
                  disabled={!getValues('productId')} 
                />
              )}
            />
            </Grid>

            <Grid item md={6}>
            <Controller
              name="quantity"
              control={control}
              rules={{ required: 'A quantidade é obrigatória.', min: { value: 1, message: 'A quantidade deve ser maior que zero.' }}}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Quantidade"
                  type="number"
                  fullWidth
                  variant="outlined"
                  error={!!errors.quantity} 
                  helperText={errors.quantity ? errors.quantity.message : ''} 
                />
              )}
            />
            </Grid>

            <Grid item md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Método de Pagamento</Typography>
                <Controller
                  name="paymentMethod"
                  control={control}
                  defaultValue="CREDIT_CARD"
                  render={({ field }) => (
                    <Select {...field} variant="outlined" required>
                      <MenuItem value="CREDIT_CARD">Cartão de Crédito</MenuItem>
                      <MenuItem value="DEBIT_CARD">Cartão de Débito</MenuItem>
                      <MenuItem value="MONEY">Dinheiro</MenuItem>
                      <MenuItem value="ANY">Qualquer um</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Status de Entrega</Typography>
                <Controller
                  name="status"
                  control={control}
                  defaultValue="DELIVERED"
                  render={({ field }) => (
                    <Select {...field} variant="outlined" required>
                      <MenuItem value="PENDING">Pendente</MenuItem>
                      <MenuItem value="IN_PROGRESS">Em Progresso</MenuItem>
                      <MenuItem value="DELIVERED">Entregue</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4 }}>
            Cadastrar Pedido
          </Button>
        </Box>

        <Snackbar
          open={!!errorMessage || !!successMessage}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={errorMessage ? 'error' : 'success'} sx={{ width: '100%' }}>
            {errorMessage || successMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default OrderForm;
