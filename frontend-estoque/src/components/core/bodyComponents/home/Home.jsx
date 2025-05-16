import { useState, useEffect } from "react";
import UilReceipt from "@iconscout/react-unicons/icons/uil-receipt";
import UilBox from "@iconscout/react-unicons/icons/uil-box";
import UilTruck from "@iconscout/react-unicons/icons/uil-truck";
import UilCancel from "@iconscout/react-unicons/icons/uil-cancel";
import InfoCard from "../../subComponents/InfoCard";
import TotalSales from "./TotalSales";
import TopSellingProducts from "./TopSellingProduct";
import api from "../../../../api";
import SalesByProduct from "./SalesByProduct";
import { Box, Grid, useMediaQuery, useTheme, Typography } from "@mui/material";

const Home = () => {
  const [state, setState] = useState({
    receivements: [],
    exits: [],
    pendingCount: 0,
    returnedCount: 0,
    invoiceCount: 0,
    loading: true,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchAllOrders = async () => {
    try {
      let response = await api.get("/exits");
      const exits = response.data?.content || [];

      const pendingCount = exits.filter(exit => exit.status === "PENDING").length;
      const returnedCount = exits.filter(exit => exit.status === "RETURNED").length;
      const invoiceCount = exits.filter(exit => exit.status === "COMPLETED").length;
      const canceledCount = exits.filter(exit => exit.status === "CANCELED").length

      response = await api.get("/receivements");
      const receivements = response.data?.content || [];
      setState({
        exits,
        receivements,
        pendingCount,
        returnedCount,
        invoiceCount,
        canceledCount,
        loading: false,
      });
    } catch (error) {
      console.error("Erro ao buscar saídas:", error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const {
    pendingCount,
    returnedCount,
    invoiceCount,
    exits,
    receivements,
    loading,
  } = state;

  const cardComponent = [
    {
      icon: <UilCancel size={isMobile ? 40 : 60} color={"#F6F4EB"} />,
      title: "Cancelado",
      subTitle: pendingCount,
      mx: 1,
      my: 0,
    },
    {
      icon: <UilBox size={isMobile ? 40 : 60} color={"#F6F4EB"} />,
      title: "Pendente",
      subTitle: pendingCount,
      mx: 1,
      my: 0,
    },
    {
      icon: <UilTruck size={isMobile ? 40 : 60} color={"#F6F4EB"} />,
      title: "Retornado",
      subTitle: returnedCount,
      mx: 1,
      my: 0,
    },
    {
      icon: <UilReceipt size={isMobile ? 40 : 60} color={"#F6F4EB"} />,
      title: "Completado",
      subTitle: invoiceCount,
      mx: 1,
      my: 0,
    },
  ];

  return (
    <Box sx={{
      width: isMobile ? '97vw' : '80vw',
      minHeight: '100vh',
      p: isMobile ? 4 : 2,
      boxSizing: 'border-box',
      mx: 'auto',
    }}>
      <Grid
        container
        spacing={isMobile ? 2 : 4}
        sx={{
          justifyContent: { xs: "center", sm: "space-between" },
          mx: { xs: 0, sm: 0 },
        }}
      >
        {cardComponent.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <InfoCard card={card} isMobile={isMobile} />
          </Grid>
        ))}
      </Grid>

      {!loading && exits.length === 0 && receivements.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Nenhum dado disponível</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={isMobile ? 1 : 2} sx={{ mt: 2, mx: { xs: 0, sm: 0 } }}>
            <Grid item xs={12} md={8}>
              <TotalSales receivements={receivements} exits={exits} isMobile={isMobile} />
            </Grid>
            <Grid item xs={12} md={4} sx={{ mt: 2 }}>
              {receivements.length > 0 && (
                <SalesByProduct receivements={receivements} isMobile={isMobile} />
              )}
            </Grid>
          </Grid>

          <Grid container spacing={isMobile ? 1 : 2} sx={{ mt: 2, mx: { xs: 0, sm: 0 }}}>
            <Grid item xs={12}>
              <TopSellingProducts receivements={receivements} exits={exits} isMobile={isMobile} />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Home;