import React, { Component } from "react";
import { Box, Grid, Paper } from "@mui/material";
import RevenueCard from "../revenue/RevenueCard";
import VisitorsGrowthCharts from "./CustomersGrowthCharts";
import ProductsGrowthCharts from "./ProductsGrowthCharts";
import SalesGrowthCharts from "./SalesGrowthCharts";
export default class Growth extends Component {
  render() {
    const revenuCards = [
      {
        isMoney: false,
        number: "330",
        percentage: 11,
        upOrDown: "down",
        color: "red",
        title: "Pedidos por Mês",
        subTitle: "vs prev month",
      },
      {
        isMoney: false,
        number: "109",
        percentage: 35,
        upOrDown: "up",
        color: "green",
        title: "Total de Clientes",
        subTitle: "vs prev year",
      },
      {
        isMoney: false,
        number: "607",
        percentage: 10,
        upOrDown: "up",
        color: "green",
        title: "Total de Produtos",
        subTitle: "vs prev month",
      },
      {
        isMoney: false,
        number: "1200",
        percentage: "30",
        title: "Total de Fornecedores",
        color: "green",
        subTitle: "vs prev week",
      },
    ];
    return (
      <Box sx={{ p: 3, mx: 3 }}>
        <Grid container sx={{ mx: 4 }}>
          {revenuCards.map((card) => (
            <Grid item md={3}>
              <Box m={4}>
                <RevenueCard card={card} />
              </Box>
            </Grid>
          ))}
        </Grid>
        <Grid container sx={{ mx: 4 }}>
          <Grid item md={6}>
            <SalesGrowthCharts />
          </Grid>
          <Grid item md={6}>
            <VisitorsGrowthCharts />
          </Grid>
        </Grid>
        <Grid container sx={{ mx: 4 }}>
          <Grid item md={6}>
            <ProductsGrowthCharts />
          </Grid>
        </Grid>
      </Box>
    );
  }
}
