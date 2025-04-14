import React, { useState } from 'react';
import ProductForm from './ProductForm';
import Products from './ProductsList';
import { useAuth } from '../../../../context/AuthContext';
import { Box, Typography } from '@mui/material';

const ProductManagement = () => {
  const [rows, setRows] = useState([]);
  const { user } = useAuth();

  const handleAddProduct = (newProduct) => {
    setRows((prevRows) => [...prevRows, newProduct]);
  };

  return (
    <Box sx={{}}>
      <Typography variant="h4" sx={{ mb: 4, mt: 10, fontWeight: 'bold' }}>
        Gerenciamento de Produtos
      </Typography>
      
      {user?.role === "ADMIN" && (
        <ProductForm onAddProduct={handleAddProduct} />
      )}

      <Box sx={{ mt: 3 }}>
        <Products rows={rows} />
      </Box>
    </Box>
  );
};

export default ProductManagement;
