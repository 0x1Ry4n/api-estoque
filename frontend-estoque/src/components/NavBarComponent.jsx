import {
  Box,
  Grid,
  AppBar,
  Container,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import {
  Settings,
  AccountCircleOutlined,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api';
import SideBarComponent from "./SideBarComponent";

export default function NavBarComponent() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error("Erro ao buscar os dados do usuário:", error);
      }
    };

    fetchUser();
  }, []);

  const handleAvatarClicked = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleClose();
    navigate('/user');
  };

  const handleSettingsClick = () => {
    handleClose();
    navigate('/settings');
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Grid container>
        <Grid item md={12}>
          <Paper elevation={4}>
            <AppBar sx={{ padding: 2, bgcolor: '#00796b', position: 'fixed', top: 0 }} >
              <Container maxWidth="xxl">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      onClick={toggleSidebar}
                      sx={{ mr: 2, color: 'white' }}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Typography fontFamily={"Inter"} variant="h6">
                      Estoque
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      ml: "auto",
                    }}
                  >
                    <IconButton
                      onClick={handleAvatarClicked}
                      size="small"
                      sx={{ mx: 2 }}
                      aria-haspopup="true"
                    >
                      <Tooltip title="Perfil">
                        <Avatar sx={{ width: 32, height: 32 }}>{user?.username?.charAt(0).toUpperCase()}</Avatar>
                      </Tooltip>
                    </IconButton>
                    <Typography fontFamily={"Inter"}>{user?.email || "Carregando..."}</Typography>
                  </Box>

                  <Menu
                    open={open}
                    anchorEl={anchorEl}
                    onClick={handleClose}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={handleProfileClick}>
                      <ListItemIcon>
                        <AccountCircleOutlined fontSize="small" />
                      </ListItemIcon>
                      Perfil
                    </MenuItem>
                    <Divider />

                    <MenuItem onClick={handleSettingsClick}>
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      Configurações
                    </MenuItem>
                  </Menu>
                </Box>
              </Container>
            </AppBar>
          </Paper>
        </Grid>
        <Box sx={{ paddingTop: '64px' }} />
      </Grid>

      <SideBarComponent isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
}