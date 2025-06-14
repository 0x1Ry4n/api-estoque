import { Box, Grid } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import NavBarComponent from "./NavBarComponent";
import SideBarComponent from "./SideBarComponent";

export default function RootComponent() {
  const location = useLocation();

  const noNavBarRoutes = ["/login", "/signup"]; 

  const shouldDisplayNavBar = !noNavBarRoutes.includes(location.pathname);

  return (
    <>
      {shouldDisplayNavBar && <NavBarComponent />}
      <Box sx={{}}>
        <Grid container spacing={0}>
          {shouldDisplayNavBar && (
            <Grid item md={2} sm={0}>
              <SideBarComponent />
            </Grid>
          )}
          <Grid item md={shouldDisplayNavBar ? 10 : 12}>
            <Outlet />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
