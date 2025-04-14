import React, { Component } from "react";
import { Box, Grid } from "@mui/material";

import UilReceipt from "@iconscout/react-unicons/icons/uil-receipt";
import UilBox from "@iconscout/react-unicons/icons/uil-box";
import UilTruck from "@iconscout/react-unicons/icons/uil-truck";
import UilCheckCircle from "@iconscout/react-unicons/icons/uil-check-circle";
import InfoCard from "../../subComponents/InfoCard";
import TotalSales from "./TotalSales";
import Channels from "./Channels";
import TopSellingProduct from "./TopSellingProduct";
import api from "../../../../api";
import SalesByProduct from "./SalesByProduct";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      pendingCount: 0,
      inProgressCount: 0,
      deliveredCount: 0,
      pickedCount: 0,
      invoiceCount: 0,
    };
  }

  componentDidMount() {
    this.fetchAllOrders();
  }

  fetchAllOrders = async () => {
    try {
      const response = await api.get('/orders/details');
      const orders = response.data.content;

      const pendingCount = orders.filter(order => order.orderStatus === 'PENDING').length;
      const inProgressCount = orders.filter(order => order.orderStatus === 'IN_PROGRESS').length;
      const deliveredCount = orders.filter(order => order.orderStatus === 'DELIVERED').length;
      const pickedCount = orders.filter(order => order.orderStatus === 'PICKED').length;
      const invoiceCount = orders.filter(order => order.orderStatus === 'INVOICE').length;

      this.setState({ 
        orders,
        pendingCount,
        inProgressCount,
        deliveredCount,
        pickedCount,
        invoiceCount,
      });
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
  }

  render() {
    const { pendingCount, inProgressCount, deliveredCount, pickedCount, invoiceCount } = this.state;

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
        icon: <UilCheckCircle size={60} color={"#F6F4EB"} />,
        title: "Entregue",
        subTitle: deliveredCount,
        mx: 5,
        my: 0,
      },
      {
        icon: <UilReceipt size={60} color={"#F6F4EB"} />,
        title: "Faturado",
        subTitle: invoiceCount,
        mx: 3,
        my: 0,
      },
    ];

    return (
      <Box
        sx={{
          margin: 0,
          padding: 3,
        }}
      >
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

        <Grid container sx={{ marginX: 3 }}>
          <Grid item md={8}>
            <TotalSales orders={this.state.orders} />
          </Grid>
          <Grid item md={4}>
            <SalesByProduct orders={this.state.orders} />
          </Grid>
        </Grid>

        <Grid container sx={{ margin: 3 }}>
          <Grid item md={6}>
            <Channels orders={this.state.orders} />
          </Grid>
          <Grid item md={6}>
            <TopSellingProduct orders={this.state.orders} />
          </Grid>
        </Grid>
      </Box>
    );
  }
}
