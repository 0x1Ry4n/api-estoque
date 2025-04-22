import { useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import ProductForm from './ProductForm';
import Products from './ProductsList';
import { useAuth } from '../../../../context/AuthContext';

const ProductManagement = () => {
  const [rows, setRows] = useState([]);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAddProduct = (newProduct) => {
    setRows((prevRows) => [...prevRows, newProduct]);
  };

  return (
    <Box sx={{
      width: isMobile ? '100vw' : '80vw',
      minHeight: '100vh',
      p: isMobile ? 4 : 2,
      boxSizing: 'border-box',
    }}>
      <Box sx={{}}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 'bold',
            fontSize: {
              xs: '1.5rem',
              sm: '1.75rem',
              md: '2rem'
            },
            mb: { xs: 2, sm: 3, md: 4 },
            ml: { xs: 0, sm: 4, md: 5 },
            mt: { xs: 2, sm: 6, md: 10 },
            lineHeight: 1.2,
          }}
        >
          {isMobile ? 'Produtos' : 'Gerenciamento de Produtos'}
        </Typography>
      </Box>

      <Box sx={{
        mt: 2,
        pb: isMobile ? 8 : 4,
        width: isMobile ? '105%' : '100%',
        overflowX: 'hidden'
      }}>
        {user?.role === "ADMIN" && (
          <ProductForm onAddProduct={handleAddProduct} />
        )}

        <Box sx={{ mt: 3 }}>
          <Products rows={rows} />
        </Box>
      </Box>
    </Box >
  );
};

export default ProductManagement;
