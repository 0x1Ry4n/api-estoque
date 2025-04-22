import React, { Component } from "react";
import UilReceipt from "@iconscout/react-unicons/icons/uil-receipt";
import UilBox from "@iconscout/react-unicons/icons/uil-box";
import UilTruck from "@iconscout/react-unicons/icons/uil-truck";
import InfoCard from "../../subComponents/InfoCard";
import TotalSales from "./TotalSales";
import TopSellingProduct from "./TopSellingProduct";
import api from "../../../../api";
import SalesByProduct from "./SalesByProduct";
import { Box, Grid } from "@mui/material";

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
      <Box sx={{ margin: 0, padding: 3 }}>
        <Grid
          container
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginX: 3,
            borderRadius: 2,
            padding: 0,
          }}
        >
          {cardComponent.map((card, index) => (
            <Grid item md={2} key={index}>
              <InfoCard card={card} />
            </Grid>
          ))}
        </Grid>

        {!loading && (
          <>
            <Grid container sx={{ marginX: 3 }}>
              <Grid item md={8}>
                <TotalSales receivements={receivements} exits={exits} />
              </Grid>
              <Grid item md={4}>
                {receivements.length > 0 && (
                  <SalesByProduct receivements={receivements} />
                )}
              </Grid>
            </Grid>

            <Grid container sx={{ margin: 3 }}>
              <Grid item md={8}>
                <TopSellingProduct exits={exits} />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    );
  }
}
