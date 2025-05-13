import { useState } from "react";
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
  Inventory2Outlined,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
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
    <List sx={{ ml: 2, pt: isMobile ? 12 : 8 }}>
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
                bgcolor: selected === index ? "#e0f2f1" : "transparent",
                borderRadius: 2,
                transition: "background-color 0.2s",
                justifyContent: open || isMobile ? "initial" : "center",
                px: 2.5,
                minHeight: 48,
                '&:hover': {
                  bgcolor: "#b2dfdb",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selected === index ? "#00796b" : "inherit",
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
      <Drawer
        variant="temporary"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: '#f5f5f5',
            boxSizing: 'border-box',
            width: 300,
            p: 2,
            borderRight: 'none',
          },
        }}
      >
        {SidebarContent}
      </Drawer>
    </>
  );
}