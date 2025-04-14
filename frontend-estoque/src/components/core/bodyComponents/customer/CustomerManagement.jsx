import React, { useState } from 'react';
import CustomerForm from './CustomerForm'; // Componente do formulário de clientes
import Customers from './CustomerList'; // Componente da lista de clientes
import { Box, Typography } from '@mui/material';

const CustomerManagement = () => {
    const [rows, setRows] = useState([]);

    const handleAddCustomer = (newCustomer) => {
        setRows((prevRows) => [...prevRows, newCustomer]);
    };

    return (
        <Box sx={{ mt: 10}}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Gerenciamento de Clientes
            </Typography>
            <CustomerForm onAddCustomer={handleAddCustomer} />
            <Box sx={{ mt: 3 }}>
                <Customers rows={rows} />
            </Box>
        </Box>
    );
};

export default CustomerManagement;
