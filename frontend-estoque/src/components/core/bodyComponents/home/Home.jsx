import React, { Component } from "react";
import UilReceipt from "@iconscout/react-unicons/icons/uil-receipt";
import UilBox from "@iconscout/react-unicons/icons/uil-box";
import UilTruck from "@iconscout/react-unicons/icons/uil-truck";
import InfoCard from "../../subComponents/InfoCard";
import TotalSales from "./TotalSales";
import TopSellingProduct from "./TopSellingProduct";
import api from "../../../../api";
import SalesByProduct from "./SalesByProduct";
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      receivements: [],
      exits: [],
      pendingCount: 0,
      inProgressCount: 0,
      invoiceCount: 0,
      loading: true, 
    };
  }

  componentDidMount() {
    this.fetchAllOrders();
  }

  fetchAllOrders = async () => {
    try {
      let response = await api.get("/exits");
      const exits = response.data?.content || [];

      const pendingCount = exits.filter(exit => exit.status === "PENDING").length;
      const inProgressCount = exits.filter(exit => exit.status === "IN_PROGRESS").length;
      const invoiceCount = exits.filter(exit => exit.status === "COMPLETED").length;

      response = await api.get("/receivements");
      const receivements = response.data?.content || [];

      this.setState({
        exits,
        receivements,
        pendingCount,
        inProgressCount,
        invoiceCount,
        loading: false,
      });
    } catch (error) {
      console.error("Erro ao buscar saídas:", error);
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      pendingCount,
      inProgressCount,
      invoiceCount,
      exits,
      receivements,
      loading,
    } = this.state;

    const cardComponent = [
      {
        icon: <UilBox size={60} color={"#F6F4EB"} />,
        title: "Pendente",
        subTitle: pendingCount,
        mx: 3,
        my: 0,
      },
      {
        icon: <UilTruck size={60} color={"#F6F4EB"} />,
        title: "Progresso",
        subTitle: inProgressCount,
        mx: 5,
        my: 0,
      },
      {
        icon: <UilReceipt size={60} color={"#F6F4EB"} />,
        title: "Completado",
        subTitle: invoiceCount,
        mx: 3,
        my: 0,
      },
    ];

    return (
      <Box sx={{ margin: 0, padding: { xs: 1, sm: 3 } }}>
        <Grid
          container
          spacing={2}
          sx={{
            justifyContent: { xs: "center", sm: "space-between" },
            mx: { xs: 0, sm: 0 },
            mb: 2
          }}
        >
          {cardComponent.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <InfoCard card={card} />
            </Grid>
          ))}
        </Grid>
    
        {!loading && (
          <>
            <Grid container spacing={2} sx={{ mx: { xs: 0, sm: 0 } }}>
              <Grid item xs={12} md={8}>
                <TotalSales receivements={receivements} exits={exits} />
              </Grid>
              <Grid item xs={12} md={4}>
                {receivements.length > 0 && (
                  <SalesByProduct receivements={receivements} />
                )}
              </Grid>
            </Grid>
    
            <Grid container spacing={2} sx={{ mx: { xs: 0, sm: 0 }, mt: 2 }}>
              <Grid item xs={12}>
                <TopSellingProduct exits={exits} />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    );
  }
}