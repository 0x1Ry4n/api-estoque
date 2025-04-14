// OrderManagement.js
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import OrderForm from './OrderForm';
import OrdersList from './OrderList';

const OrderManagement = () => {
  const [rows, setRows] = useState([]);

  const handleAddOrder = (newOrder) => {
    setRows((prevRows) => [...prevRows, { id: prevRows.length + 1, ...newOrder }]); 
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, mt: 10, fontWeight: 'bold' }}>
        Gerenciamento de Pedidos
      </Typography>
      <OrderForm onAddOrder={handleAddOrder} />
      <Box sx={{ mt: 3 }}>
        <OrdersList rows={rows} on />
      </Box>
    </Box>
  );
};

export default OrderManagement;
