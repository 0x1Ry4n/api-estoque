import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button, 
  useMediaQuery, 
  useTheme, 
  Chip 
} from '@mui/material';
import { 
  Logout as LogoutIcon 
} from '@mui/icons-material';
import { useAuth } from '../../../../context/AuthContext';
import UserAvatar from '../../subComponents/UserAvatar';

const UserProfile = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (token === null) {
      navigate('/login');
    }
    if (user) {
      setLoading(false);
      setError('');
    } else if (token) {
      setLoading(true);
    }
  }, [user, token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      >
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

  if (!user) {
    return null;
  }

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      ml: !isMobile ? '25%' : '',
      width: isMobile ? '100vw' : '40vw',
      height: '100vh',
      p: isMobile ? 4 : 2,
      mt: 2,
      boxSizing: 'border-box',
    }}>
      <Paper elevation={6} sx={{ p: 10, width: '100%', maxWidth: 600, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <UserAvatar userId={user.id} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: '#00796b' }}>
              {user.username}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" align="center" sx={{ color: '#757575' }}>
              <strong>Email:</strong> {user.email}
            </Typography>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Chip
              label={user.role === "ADMIN" ? "Administrador" : "Usuário Comum"}
              color={user.role === "ADMIN" ? "primary" : "default"}
              sx={{
                fontWeight: 'bold',
                color: 'gainsboro',
                height: 25,
                maxWidth: 150,
                p: 2,
                '& .MuiChip-label': {
                  paddingLeft: 1,
                  paddingRight: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
                bgcolor: 'rgba(0, 0, 0, 0.08)',
              }}
            />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              sx={{
                bgcolor: '#00796b',
                '&:hover': { bgcolor: '#004d40' },
                borderRadius: '4px',
                px: 4,
              }}
              startIcon={<LogoutIcon />}
            >
              Sair
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserProfile;
