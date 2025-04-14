import Inter from "../public/static/fonts/Inter.ttf";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import RootComponent from "./components/RootComponent";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Home from "./components/core/bodyComponents/home/Home";
import Revenue from "./components/core/bodyComponents/revenue/Revenue";
import Growth from "./components/core/bodyComponents/growth/Growth";
import Report from "./components/core/bodyComponents/report/Report";
import Setting from "./components/core/bodyComponents/settings/Setting";
import Login from "./components/auth/login/Login";
import PrivateRoute from './components/auth/privateRoute';
import ProductManagement from "./components/core/bodyComponents/product/ProductManagement";
import CategoryManagement from "./components/core/bodyComponents/category/CategoryManagement";
import CustomerManagement from "./components/core/bodyComponents/customer/CustomerManagement";
import SupplierManagement from "./components/core/bodyComponents/supplier/SupplierManagement";
import InventoryManagement from "./components/core/bodyComponents/inventory/InventoryManagement";
import OrderManagement from "./components/core/bodyComponents/order/OrderManagement";
import QRCodeGenerator from "./components/core/bodyComponents/qrcode/QRCodeGenerator";
import UserProfile from "./components/core/bodyComponents/user/UserProfile";
import UserManagement from "./components/core/bodyComponents/user/UserManagement";
import CalendarWithNotes from "./components/core/bodyComponents/calendar/CalendarWithNotes";
import MapComponent from "./components/core/bodyComponents/maps/Maps";
import 'leaflet/dist/leaflet.css';
import ReceivementManagement from "./components/core/bodyComponents/receivement/ReceivementManagement";
import ExitManagement from "./components/core/bodyComponents/exit/ExitManagement";

function App() {
  const theme = createTheme({
    spacing: 4,
    palette: {
      mode: "light",
    },
    typography: {
      fontFamily: "Inter",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-display: swap;
            font-weight: 400;
            src: local('Raleway'), local('Raleway-Regular'), url(${Inter}) format('woff2');
            unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
          }
        `,
      },
    },
  });

  const isAuthenticated = () => {
    return localStorage.getItem('token');
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to={isAuthenticated() ? "/home" : "/login"} />} />
        <Route path="/" element={<PrivateRoute><RootComponent /></PrivateRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/calendar" element={<CalendarWithNotes />} />
          <Route path="/maps" element={<MapComponent />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/create-user" element={<PrivateRoute onlyAdmin={true}> <UserManagement/> </PrivateRoute>} />          
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/suppliers" element={<SupplierManagement />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/receivements" element={<ReceivementManagement />} />
          <Route path="/exits" element={<ExitManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/qrcode-generator" element={<QRCodeGenerator />} />
        </Route>
      </Route>
    )
  );

  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
      <CssBaseline />
    </ThemeProvider>
  );
}

export default App;
