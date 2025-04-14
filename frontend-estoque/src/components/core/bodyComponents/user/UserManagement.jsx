import React, { useState } from 'react';
import CreateUser from './CreateUser'; 
import UserList from './UserList';
import { Box, Typography } from '@mui/material';

const UserManagement = () => {
    const [rows, setRows] = useState([]);

    const handleAddUser = (newUser) => {
        setRows((prevRows) => [...prevRows, newUser]);
    };

    return (
        <Box sx={{ mt: 10 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Gerenciamento de Usuários
            </Typography>
            <CreateUser onAddUser={handleAddUser} /> 
            <Box sx={{ mt: 3 }}>
                <UserList rows={rows} />
            </Box>
        </Box>
    );
};

export default UserManagement;
