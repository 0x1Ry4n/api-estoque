import React, { Component } from "react";
import RevenueCard from "./RevenueCard";
import { Box, Grid } from "@mui/material";
import RevenueCostChart from "./RevenueCostChart";
import BestSelledProductChart from "./BestSelledProductChart";
import BestSelledProductChartBar from "./BestSelledProductChartBar";
import api from './../../../../api'; // Certifique-se de importar sua configuração da API

export default class Revenue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      totalSalesThisYear: 0,
      revenueThisYear: 0,
      costThisYear: 0,
      revenueTotal: 98000, 
    };
  }

  componentDidMount() {
    this.fetchAllOrders();
  }

  fetchAllOrders = async () => {
    try {
      const response = await api.get('/orders/details');
      const orders = response.data.content;

      this.setState({ orders }, () => {
        this.calculateTotals();
      });
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
  };

  calculateTotals = () => {
    const { orders } = this.state;

    const totalSalesThisYear = orders.reduce((total, order) => total + order.totalPrice, 0);
    const costThisYear = orders.reduce((total, order) => total + (order.inventory.unitPrice * order.quantity), 0);

    this.setState({
      totalSalesThisYear,
      revenueThisYear: totalSalesThisYear, 
      costThisYear,
    });
  };

  render() {
    const { totalSalesThisYear, revenueThisYear, costThisYear, revenueTotal } = this.state;

    const revenuCards = [
      {
        isMoney: true,
        number: totalSalesThisYear.toFixed(2),
        percentage: 55, 
        upOrDown: "up",
        color: "green",
        title: "Receita neste ano",
        subTitle: "vs prev year",
      },
      
      {
        isMoney: true,
        number: costThisYear.toFixed(2),
        percentage: 12, 
        upOrDown: "down",
        color: "red",
        title: "Custos neste ano",
        subTitle: "vs prev year",
      },
      {
        isMoney: true,
        number: revenueTotal.toFixed(2),
        percentage: undefined,
        title: "Lucro líquido",
        subTitle: "vs prev year",
      },
      {
        isMoney: true,
        number: revenueTotal.toFixed(2),
        percentage: undefined,
        title: "Receita total",
        subTitle: "vs prev year",
      },
    ];

    return (
      <Box sx={{ p: 3, mx: 3 }}>
        <Grid container sx={{ mx: 4 }}>
          {revenuCards.map((card, index) => (
            <Grid item md={3} key={index}>
              <Box m={4}>
                <RevenueCard card={card} />
              </Box>
            </Grid>
          ))}
        </Grid>
        <Grid container sx={{ mx: 4 }}>
          <Grid item md={12}>
            <RevenueCostChart />
          </Grid>
        </Grid>
        <Grid container sx={{ mx: 4 }}>
          <Grid item md={6}>
            <BestSelledProductChart />
          </Grid>
          <Grid item md={6}>
            <BestSelledProductChartBar />
          </Grid>
        </Grid>
      </Box>
    );
  }
}
