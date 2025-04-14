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
  AddShoppingCart as AddShoppingCartIcon,
  AddCircleOutline,
} from "@mui/icons-material";
import { Autocomplete } from "@mui/material";
import api from "./../../../../api";
import { useForm, Controller } from "react-hook-form";

const ExitForm = ({ onExitAdded }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); 

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => { 
    const fetchProducts = async () => {
      const response = await api.get("/products");
      setProducts(response.data.content);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const fetchInventories = async () => {
        const response = await api.get(`/products/${selectedProduct.id}/inventory`);
        setInventories(response.data);
      };

      fetchInventories();
    }
  }, [selectedProduct]);

  const onSubmit = async (data) => {
    try {
      const productData = {
        ...data
      };

      const response = await api.post("/exits", productData);
      if (response.status === 201) {
        setSnackbarMessage("Saída cadastrado com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        if (typeof onExitAdded === "function") {
            onExitAdded(response.data);
        } else {
          console.error("onExitAdded is not a function");
        }

        reset();
      }
    } catch (error) {
      setSnackbarMessage(
        "Erro ao cadastrar a saída: " +
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
        sx={{ padding: 10, borderRadius: 2, backgroundColor: "#f5f5f5", width: '95%' }}
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
          Cadastrar Saída
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            
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
                        helperText={errors.productId ? errors.productId.message : ""}
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
                    onChange={(_, value) => field.onChange(value ? value.id : "")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Inventário"
                        placeholder="Pesquisar inventários"
                        error={!!errors.inventoryId}
                        helperText={errors.inventoryId ? errors.inventoryId.message : ""}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item md={6}>
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
          </Grid>

            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 4, display: 'flex', alignItems: 'center' }}
              startIcon={<AddCircleOutline />}
            >
              Cadastrar Saída
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

export default ExitForm;
