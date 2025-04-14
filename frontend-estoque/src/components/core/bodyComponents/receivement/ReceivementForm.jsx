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
} from "@mui/material";
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  DateRange as DateRangeIcon,
  AddShoppingCart as AddShoppingCartIcon,
  AddCircleOutline,
} from "@mui/icons-material";
import { Autocomplete } from "@mui/material";
import api from "./../../../../api";
import { useForm, Controller } from "react-hook-form";

const ReceivementForm = ({ onReceivementAdded }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    const fetchSuppliers = async () => {
      const response = await api.get("/supplier");
      setSuppliers(response.data.content);
    };

    const fetchProducts = async () => {
      const response = await api.get("/products");
      setProducts(response.data.content);
    };

    fetchProducts();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const fetchInventories = async () => {
        const response = await api.get(
          `/products/${selectedProduct.id}/inventory`
        );
        setInventories(response.data);
      };

      fetchInventories();
    }
  }, [selectedProduct]);

  const onSubmit = async (data) => {
    try {
      const productData = {
        ...data,
      };

      const response = await api.post("/receivements", productData);
      if (response.status === 201) {
        setSnackbarMessage("Recebimento cadastrado com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        if (typeof onReceivementAdded === "function") {
          onReceivementAdded(response.data);
        } else {
          console.error("onReceivementAdded is not a function");
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Paper
        elevation={4}
        sx={{ padding: 10, borderRadius: 2, backgroundColor: "#f5f5f5", width: '95%'}}
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
          Cadastrar Recebimento
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item md={12}>
              <Controller
                name="quantity"
                control={control}
                defaultValue=""
                rules={{ required: "A quantidade obrigatória." }}
                render={({ field }) => (
                  <TextField
                    label="Quantidade"
                    fullWidth
                    type="number"
                    variant="outlined"
                    {...field}
                    error={!!errors.quantity}
                    helperText={errors.quantity ? errors.quantity.message : ""}
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
            <Grid item md={6}>
              <Controller
                name="productId"
                control={control}
                defaultValue=""
                rules={{ required: "O produto é obrigatório." }}
                render={({ field }) => (
                  <Autocomplete
                    options={products}
                    getOptionLabel={(option) => option.name}
                    filterSelectedOptions
                    onChange={(_, value) => {
                      field.onChange(value ? value.id : "");
                      setSelectedProduct(value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Produto"
                        placeholder="Pesquisar produtos"
                        error={!!errors.productId}
                        helperText={
                          errors.productId ? errors.productId.message : ""
                        }
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
                defaultValue=""
                rules={{ required: "O inventário é obrigatório." }}
                render={({ field }) => (
                  <Autocomplete
                    options={inventories}
                    getOptionLabel={(option) => option.inventoryCode}
                    filterSelectedOptions
                    onChange={(_, value) =>
                      field.onChange(value ? value.id : "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Inventário"
                        placeholder="Pesquisar inventários"
                        error={!!errors.inventoryId}
                        helperText={
                          errors.inventoryId ? errors.inventoryId.message : ""
                        }
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item md={6}>
              <Controller
                name="supplierId"
                control={control}
                defaultValue={[]}
                rules={{ required: "O fornecedor é obrigatório." }}
                render={({ field }) => (
                  <Autocomplete
                    options={suppliers}
                    getOptionLabel={(option) => option.socialReason}
                    filterSelectedOptions
                    onChange={(_, value) => {
                      field.onChange(value ? value.id : "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Fornecedor"
                        placeholder="Pesquisar fornecedores"
                        error={!!errors.supplierId}
                        helperText={
                          errors.supplierId ? errors.supplierId.message : ""
                        }
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item md={6}>
              <Controller
                name="receivingDate"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    label="Data de Recebimento"
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
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 4, display: 'flex', alignItems: 'center' }}
            startIcon={<AddCircleOutline />}
          >
            Cadastrar Entrada
          </Button>
        </Box>
      </Paper>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
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

export default ReceivementForm;
