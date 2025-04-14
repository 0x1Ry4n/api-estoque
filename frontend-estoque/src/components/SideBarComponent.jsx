import { useState } from "react";
import "../../public/styles/links.css";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Box,
  Collapse,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import {
  HomeOutlined,
  CalendarTodayOutlined,
  MapOutlined,
  QrCodeOutlined,
  LocalShippingOutlined,
  CategoryOutlined,
  InventoryOutlined,
  AddCircleOutline,
  CreditCardOutlined,
  GroupOutlined,
  ShowChartOutlined,
  ExpandMore,
  ExpandLess,
  Menu as MenuIcon,
  Inventory2Outlined,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SideBarComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname;

  const isSmallScreen = useMediaQuery("(max-width:600px)"); 

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sideBarComponent = [
    { title: "Home", route: "home", component: <HomeOutlined /> },
    { title: "Calendário", route: "calendar", component: <CalendarTodayOutlined /> },
    { title: "Mapa", route: "maps", component: <MapOutlined /> },
    { title: "Fornecedores", route: "suppliers", component: <LocalShippingOutlined /> },
    { title: "Categorias", route: "categories", component: <CategoryOutlined /> },
    { title: "Produtos", route: "products", component: <InventoryOutlined /> },
    { title: "QR Code", route: "qrcode-generator", component: <QrCodeOutlined /> },
    { title: "Inventário", route: "inventory", component: <Inventory2Outlined /> },
    { title: "Entradas", route: "receivements", component: <AddCircleOutline /> },
    { title: "Saídas", route: "exits", component: <CreditCardOutlined /> },
    { title: "Usuários", route: "create-user", component: <GroupOutlined /> }, 
    { title: "Crescimento", route: "growth", component: <ShowChartOutlined /> },
  ];  

  const filteredSideBarComponent = user?.role === "USER"
    ? sideBarComponent.filter((item) => item.title !== "Usuários")
    : sideBarComponent;

  const handleSelectedComponent = (index) => {
    setSelected(index);
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const SidebarContent = (
    <List>
      {filteredSideBarComponent.map((comp, index) => (
        <ListItem disablePadding key={index}>
          <Box width="100%">
            <ListItemButton
              onClick={() => {
                handleSelectedComponent(index);
                navigate(comp.route.toLowerCase());
                if (isSmallScreen) toggleDrawer(); 
              }}
              selected={index === selected && currentPage === "/" + comp.route.toLowerCase()}
              sx={{
                mb: 2,
                bgcolor: selected === index ? "#e0f2f1" : "transparent",
                borderRadius: 2,
                transition: "background-color 0.2s",
                '&:hover': {
                  bgcolor: "#b2dfdb",
                },
              }}
            >
              <ListItemIcon sx={{ color: selected === index ? "#00796b" : "inherit" }}>
                {comp.component}
              </ListItemIcon>
              {!isSmallScreen && (
                <ListItemText
                  primary={comp.title}
                  primaryTypographyProps={{
                    fontSize: "medium",
                    fontWeight: selected === index ? "bold" : "normal",
                    color: selected === index ? "#00796b" : "inherit",
                  }}
                />
              )}
            </ListItemButton>
          </Box>
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      {isSmallScreen ? (
        <>
          <IconButton onClick={toggleDrawer} sx={{ position: "fixed", top: 15, left: 15 }}>
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer}
            sx={{ width: "250px" }}
          >
            {SidebarContent}
          </Drawer>
        </>
      ) : (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            top: 0,
            bgcolor: "#ffffff",
            height: "100vh",
            boxShadow: 2,
            p: 2,
            zIndex: 1000,
            transition: "width 0.3s",
            width: open ? "250px" : "60px",
          }}
        >
          <IconButton onClick={toggleSidebar} sx={{ mt: 15 }}>
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <Collapse in={open}>{SidebarContent}</Collapse>
        </Box>
      )}
    </>
  );
}
