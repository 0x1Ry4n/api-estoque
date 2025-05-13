import { useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import CreateUser from './CreateUser';
import UserList from './UserList';

const UserManagement = () => {
    const [rows, setRows] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleAddUser = (newUser) => {
        setRows((prevRows) => [...prevRows, newUser]);
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
                    {isMobile ? 'Usuários' : 'Gerenciamento de Usuários'}
                </Typography>
            </Box>

            <Box sx={{
                mt: 2,
                pb: isMobile ? 8 : 4,
                width: isMobile ? '105%' : '100%',
                overflowX: 'hidden'
            }}>
                <CreateUser onAddUser={handleAddUser} />

                <Box sx={{ mt: 5 }}>
                    <UserList
                        rows={rows}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default UserManagement;
