import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  AppBar,
  Container,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  AccountCircleOutlined as AccountCircleOutlinedIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import UserAvatar from "./core/subComponents/UserAvatar";
import SideBarComponent from "./SideBarComponent";
import api from '../api';

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
            <AppBar sx={{ padding: 2, height: '63.5px', bgcolor: '#00796b', position: 'fixed', top: 0 }} >
              <Container maxWidth="xxl">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "self-start",
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'self-start' }}>
                    <IconButton
                      onClick={toggleSidebar}
                      sx={{ mr: 2, color: 'white' }}
                    >
                      <MenuIcon />
                    </IconButton>
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
                        <UserAvatar userId={user?.id} sx={{ width: 32, height: 32 }} showable={false} editable={false} />
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
                        <AccountCircleOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      Perfil
                    </MenuItem>
                    <Divider />

                    <MenuItem onClick={handleSettingsClick}>
                      <ListItemIcon>
                        <SettingsIcon fontSize="small" />
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