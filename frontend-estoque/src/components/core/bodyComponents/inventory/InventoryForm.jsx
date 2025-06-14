import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  Divider,
} from '@mui/material';
import {
  AddCircleOutline, Inventory2, QrCode2Rounded as QRCodeIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import api from './../../../../api';
import QrScanner from 'react-qr-scanner';
import Autocomplete from '@mui/material/Autocomplete';

const InventoryForm = ({ onInventoryAdded }) => {
  const [products, setProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isScanning, setIsScanning] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      productId: '',
      discount: '',
      inventoryCode: '',
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(Array.isArray(response.data.content) ? response.data.content : []);
      } catch (error) {
        setSnackbarMessage('Erro ao carregar produtos: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    fetchProducts();
  }, []);

  const onSubmit = async (data) => {
    try {
      const response = await api.post(`/products/${data.productId}/inventory`, {
        discount: parseFloat(data.discount),
        inventoryCode: data.inventoryCode,
      });
      if (response.status === 201) {
        setSnackbarMessage('Inventário cadastrado com sucesso!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        if (typeof onInventoryAdded === 'function') {
          onInventoryAdded(response.data);
        }

        reset();
      }
    } catch (error) {
      setSnackbarMessage('Erro ao cadastrar inventário: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleScan = (data) => {
    if (data) {
      reset({ inventoryCode: data.text });
      setOpenModal(false);
    }
  };

  const handleError = (err) => {
    setSnackbarSeverity('error');
    setSnackbarMessage(`Erro ao escanear o qrcode: ${err}`);
    setSnackbarOpen(true);
  };

  const openCameraModal = () => {
    setOpenModal(true);
    setIsScanning(true);
  };

  const closeCameraModal = () => {
    setOpenModal(false);
    setIsScanning(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Paper elevation={4} sx={{ padding: 6, borderRadius: 2, backgroundColor: '#f5f5f5', width: '95%' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <Inventory2 sx={{ mr: 1 }} />
          Cadastrar Inventário
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item md={6} xs={12}>
              <Controller
                name="productId"
                control={control}
                rules={{ required: 'O produto é obrigatório.' }}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={products}
                    getOptionLabel={(option) => option?.name || ''}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    value={products.find((product) => product.id === value) || null}
                    onChange={(_, selectedOption) => onChange(selectedOption ? selectedOption.id : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Produto"
                        variant="outlined"
                        placeholder="Pesquisar Produto"
                        error={!!errors.productId}
                        helperText={errors.productId ? errors.productId.message : ''}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <Controller
                name="discount"
                control={control}
                rules={{ required: 'O desconto é obrigatório (0 ou mais).' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Desconto"
                    fullWidth
                    variant="outlined"
                    type="number"
                    error={!!errors.discount}
                    helperText={errors.discount ? errors.discount.message : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AddCircleOutline />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <Controller
                name="inventoryCode"
                rules={{ required: 'O código de inventário   é obrigatório.' }}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código de Inventário"
                    fullWidth
                    variant="outlined"
                    error={!!errors.inventoryCode}
                    helperText={errors.inventoryCode ? errors.inventoryCode.message : ''}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button onClick={openCameraModal}>
                            <QRCodeIcon sx={{ ml: 5 }} />
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <AddCircleOutline sx={{ mr: 1 }} />
            Cadastrar Inventário
          </Button>
        </Box>
      </Paper>

      <Dialog open={openModal} onClose={closeCameraModal} sx={{ backgroundColor: "#f5f5f5" }}>
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>Escanear QR Code</DialogTitle>
        <Divider />
        <Box sx={{ padding: 4, textAlign: 'center' }}>
          {isScanning && (
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%', borderRadius: 6 }}
            />
          )}
          <Button onClick={closeCameraModal} variant="outlined" sx={{ mt: 2 }}>
            Cancelar
          </Button>
        </Box>
      </Dialog>

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

export default InventoryForm;
