import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Avatar, Button } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import api from './../../../../api';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        setError('Erro ao carregar os dados do usuário.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 500, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: '#00796b' }}>
              <AccountCircle sx={{ fontSize: 100 }} />
            </Avatar>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: '#00796b' }}>
              {user?.username}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" align="center" sx={{ color: '#757575' }}>
              <strong>Email:</strong> {user?.email}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" align="center" sx={{ color: '#757575' }}>
              <strong>Tipo:</strong> {user?.role === "ADMIN" ? "Administrador" : "Usuário Comum"}
            </Typography>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              sx={{
                bgcolor: '#00796b',
                '&:hover': { bgcolor: '#004d40' },
                borderRadius: '20px',
                px: 4
              }}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserProfile;
