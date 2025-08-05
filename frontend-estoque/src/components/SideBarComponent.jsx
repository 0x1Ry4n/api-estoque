import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  HomeOutlined as HomeOutlinedIcon,
  CalendarTodayOutlined as CalendarTodayOutlinedIcon,
  MapOutlined as MapOutlinedIcon,
  QrCodeOutlined as QrCodeOutlinedIcon,
  LocalShippingOutlined as LocalShippingOutlinedIcon,
  CategoryOutlined as CategoryOutlinedIcon,
  InventoryOutlined as InventoryOutlinedIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  CreditCardOutlined as CreditCardOutlinedIcon,
  GroupOutlined as GroupOutlinedIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  Person2Outlined as Person2OutlinedIcon,
  SellOutlined as SellOutlinedIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import "../../public/styles/links.css";

export default function SideBarComponent({ isSidebarOpen, toggleSidebar }) {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState(0);

  const currentPage = location.pathname;

  const sideBarComponent = [
    { title: "Home", route: "home", component: <HomeOutlinedIcon /> },
    { title: "Calendário", route: "calendar", component: <CalendarTodayOutlinedIcon /> },
    { title: "Mapa", route: "maps", component: <MapOutlinedIcon /> },
    { title: "Clientes", route: "customers", component: <Person2OutlinedIcon /> },
    { title: "Fornecedores", route: "suppliers", component: <LocalShippingOutlinedIcon /> },
    { title: "Categorias", route: "categories", component: <CategoryOutlinedIcon /> },
    { title: "Produtos", route: "products", component: <InventoryOutlinedIcon /> },
    { title: "QR Code", route: "qrcode-generator", component: <QrCodeOutlinedIcon /> },
    { title: "Inventário", route: "inventory", component: <Inventory2OutlinedIcon /> },
    { title: "Entradas", route: "receivements", component: <AddCircleOutlineIcon /> },
    { title: "Saídas", route: "exits", component: <CreditCardOutlinedIcon /> },
    { title: "Pedidos", route: "orders", component: <SellOutlinedIcon /> },
    { title: "Usuários", route: "create-user", component: <GroupOutlinedIcon /> },
  ];

  const filteredSideBarComponent = user?.role === "USER"
    ? sideBarComponent.filter((item) =>
      !["Usuários", "Home", "Mapa"].some((term) => item.title.includes(term))
    )
    : sideBarComponent;

  const handleSelectedComponent = (index) => {
    setSelected(index);
  };

  const SidebarContent = (
    <List sx={{ ml: 1, pt: isMobile ? 12 : 8 }}>
      {filteredSideBarComponent.map((comp, index) => (
        <ListItem disablePadding key={index}>
          <Box width="100%">
            <ListItemButton
              onClick={() => {
                handleSelectedComponent(index);
                navigate(comp.route.toLowerCase());
                if (isMobile) toggleSidebar();
              }}
              selected={index === selected && currentPage === "/" + comp.route.toLowerCase()}
              sx={{
                mb: 1,
                bgcolor: selected === index ? theme.palette.primary.secondary : "transparent",
                borderRadius: 2,
                transition: "background-color 0.2s",
                justifyContent: open || isMobile ? "initial" : "center",
                px: 2.5,
                minHeight: 48,
                '&:hover': {
                  bgcolor: theme.palette.secondary.main,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selected === index ? theme.palette.primary.main : "inherit",
                  minWidth: 0,
                  mr: open || isMobile ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                {comp.component}
              </ListItemIcon>
              {(open || isMobile) && (
                <ListItemText
                  primary={comp.title}
                  primaryTypographyProps={{
                    fontSize: "medium",
                    fontWeight: selected === index ? "bold" : "normal",
                    color: selected === index ? theme.palette.primary.main : "inherit",
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
    <Drawer
      variant="temporary"
      open={isSidebarOpen}
      onClose={toggleSidebar}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: 'background.default',
          boxSizing: 'border-box',
          width: 300,
          p: 2,
          borderRight: 'none',
        },
      }}
    >
      {SidebarContent}
    </Drawer>
  );
}