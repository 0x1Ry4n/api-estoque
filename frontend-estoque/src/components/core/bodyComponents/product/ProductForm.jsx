import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
} from "@mui/material";
import {
  Add as AddIcon,
  PriceCheck as PriceCheckIcon,
  Description as DescriptionIcon,
  DateRange as DateRangeIcon,
  AddShoppingCart as AddShoppingCartIcon,
  AddCircleOutline,
} from "@mui/icons-material";
import { Autocomplete } from "@mui/material";
import api from "./../../../../api";
import { useForm, Controller } from "react-hook-form";
import QrScanner from 'react-qr-scanner'; 

const ProductForm = ({ onProductAdded }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isScanning, setIsScanning] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await api.get("/category");
      setCategories(response.data.content);
    };

    const fetchSuppliers = async () => {
      const response = await api.get("/supplier");
      setSuppliers(response.data.content);
    };

    fetchCategories();
    fetchSuppliers();
  }, []);

  const handleError = (err) => {
    console.error(err);
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

  const handleScan = (data) => {
    if (data) {
      console.log(data);
      reset({ productCode: data.text }); 
      setOpenModal(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const productData = {
        ...data,
        unitPrice: parseFloat(data.unitPrice),
      };

      const response = await api.post("/products", productData);
      if (response.status === 201) {
        setSnackbarMessage("Produto cadastrado com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        if (typeof onProductAdded === "function") {
          onProductAdded(response.data.content);
        } else {
          console.error("onProductAdded is not a function");
        }

        reset();
      }
    } catch (error) {
      setSnackbarMessage(
        "Erro ao cadastrar produto: " +
          (error.response?.data?.message || "Erro desconhecido.")
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box>
      <Paper
        elevation={4}
        sx={{ padding: 10, borderRadius: 2, backgroundColor: "#f5f5f5", width: "95%"}}
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
          <AddShoppingCartIcon sx={{ mr: 1 }} />
          Cadastrar Produto
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item md={6}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{ required: "O nome é obrigatório." }}
                render={({ field }) => (
                  <TextField
                    label="Nome"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.name}
                    helperText={errors.name ? errors.name.message : ""}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AddIcon />
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
            <Grid item md={6}>
              <Controller
                name="unitPrice"
                control={control}
                defaultValue=""
                rules={{ required: "O preço unitário é obrigatório." }}
                render={({ field }) => (
                  <TextField
                    label="Preço Unitário"
                    type="number"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.unitPrice}
                    helperText={
                      errors.unitPrice ? errors.unitPrice.message : ""
                    }
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PriceCheckIcon />
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
            <Grid item md={12}>
              <Controller
                name="description"
                control={control}
                defaultValue=""
                rules={{ required: "A descrição é obrigatória." }}
                render={({ field }) => (
                  <TextField
                    label="Descrição"
                    fullWidth
                    variant="outlined"
                    {...field}
                    error={!!errors.description}
                    helperText={
                      errors.description ? errors.description.message : ""
                    }
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon />
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
                name="productCode"
                rules={{ required: 'O código do produto é obrigatório.' }}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código do Produto"
                    fullWidth
                    variant="outlined"
                    error={!!errors.productCode} 
                    helperText={errors.productCode ? errors.productCode.message : ''}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button onClick={openCameraModal}>Escanear QRCode</Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item md={6}>
              <Controller
                name="categoryId"
                control={control}
                defaultValue=""
                rules={{ required: "A categoria é obrigatória." }}
                render={({ field }) => (
                  <Autocomplete
                    options={categories}
                    getOptionLabel={(option) => option.name}
                    filterSelectedOptions
                    onChange={(_, value) => {
                      field.onChange(value ? value.id : "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Categoria"
                        placeholder="Pesquisar categorias"
                        error={!!errors.categoryId}
                        helperText={
                          errors.categoryId ? errors.categoryId.message : ""
                        }
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item md={6}>
              <Controller
                name="suppliersId"
                control={control}
                defaultValue={[]}
                rules={{ required: "Pelo menos um fornecedor é obrigatório." }}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={suppliers}
                    getOptionLabel={(option) => option.socialReason}
                    filterSelectedOptions
                    onChange={(_, value) => {
                      field.onChange(value.map((item) => item.id));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Fornecedores"
                        placeholder="Pesquisar fornecedores"
                        error={!!errors.suppliersId}
                        helperText={
                          errors.suppliersId ? errors.suppliersId.message : ""
                        }
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item md={6}>
              <Controller
                name="expirationDate"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    label="Data de Expiração"
                    type="date"
                    fullWidth
                    variant="outlined"
                    {...field}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateRangeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 4, display: "flex", alignItems: "center" }}
          >
            <AddCircleOutline sx={{ mr: 1 }} />
            Cadastrar Produto
          </Button>
        </Box>
      </Paper>

      <Dialog open={openModal} onClose={closeCameraModal}>
        <DialogTitle>Escanear QR Code</DialogTitle>
        <Box sx={{ padding: 2, textAlign: 'center' }}>
          {isScanning && (
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
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
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductForm;
