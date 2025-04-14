import React, { useState } from 'react';
import CategoryForm from './CategoryForm'; 
import Categories from './CategoryList'; 
import { useAuth } from '../../../../context/AuthContext';
import { Box, Typography } from '@mui/material';

const CategoryManagement = () => {
  const [rows, setRows] = useState([]);
  const { user } = useAuth();

  const handleAddCategory = (newCategory) => {
    setRows((prevRows) => [...prevRows, newCategory]);
  };

  return (
    <Box sx={{}}>
      <Typography variant="h4" sx={{ mb: 4, mt: 10, fontWeight: 'bold' }}>
        Gerenciamento de Categorias
      </Typography>

      {user?.role === "ADMIN" && (
        <CategoryForm onAddCategory={handleAddCategory} />
      )}

      <Box sx={{ mt: 3 }}>
        <Categories
          rows={rows}
        />
      </Box>
    </Box>
  );
};

export default CategoryManagement; 
