import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./context/theme";
import RootComponent from "./components/RootComponent";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Home from "./components/core/bodyComponents/home/Home";
import Settings from "./components/core/bodyComponents/settings/Settings";
import Login from "./components/auth/login/Login";
import PrivateRoute from './components/auth/privateRoute';
import ProductManagement from "./components/core/bodyComponents/product/ProductManagement";
import CategoryManagement from "./components/core/bodyComponents/category/CategoryManagement";
import CustomerManagement from "./components/core/bodyComponents/customer/CustomerManagement";
import SupplierManagement from "./components/core/bodyComponents/supplier/SupplierManagement";
import InventoryManagement from "./components/core/bodyComponents/inventory/InventoryManagement";
import QRCodeGenerator from "./components/core/bodyComponents/qrcode/QRCodeGenerator";
import UserProfile from "./components/core/bodyComponents/user/UserProfile";
import UserManagement from "./components/core/bodyComponents/user/UserManagement";
import CalendarWithNotes from "./components/core/bodyComponents/calendar/CalendarWithNotes";
import MapComponent from "./components/core/bodyComponents/maps/Maps";
import ReceivementManagement from "./components/core/bodyComponents/receivement/ReceivementManagement";
import ExitManagement from "./components/core/bodyComponents/exit/ExitManagement";
import 'leaflet/dist/leaflet.css';

function App() {
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) ?? false
  );

  const handleToggleTheme = (value) => {
    setDarkMode(value);
  };

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const isAuthenticated = () => {
    return localStorage.getItem('token');
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to={isAuthenticated() ? "/home" : "/login"} />} />
        <Route path="/" element={<PrivateRoute><RootComponent /></PrivateRoute>}>
          <Route path="/home" element={<PrivateRoute onlyAdmin={true}> <Home /> </PrivateRoute>} />
          <Route path="/calendar" element={<CalendarWithNotes />} />
          <Route path="/maps" element={<PrivateRoute onlyAdmin={true}> <MapComponent /> </PrivateRoute>} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/create-user" element={<PrivateRoute onlyAdmin={true}> <UserManagement /> </PrivateRoute>} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/suppliers" element={<SupplierManagement />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/receivements" element={<ReceivementManagement />} />
          <Route path="/exits" element={<ExitManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/qrcode-generator" element={<QRCodeGenerator />} />
          <Route path="/settings" element={<PrivateRoute onlyAdmin={true}> 
            <Settings onToggleTheme={handleToggleTheme} /> 
          </PrivateRoute>} />
        </Route>
      </Route>
    )
  );

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
