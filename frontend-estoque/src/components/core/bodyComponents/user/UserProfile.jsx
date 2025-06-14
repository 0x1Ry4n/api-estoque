import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, CircularProgress, Avatar, Button, useMediaQuery, useTheme } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import api from './../../../../api';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      ml: !isMobile ? '25%' : '',
      width: isMobile ? '100vw' : '40vw',
      p: isMobile ? 4 : 2,
      mt: 2,
      boxSizing: 'border-box',
    }}>
      <Paper elevation={6} sx={{ p: 10, width: '100%', maxWidth: 500, borderRadius: 2 }}>
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
