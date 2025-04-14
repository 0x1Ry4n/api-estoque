import React from "react";
import { Box } from "@mui/material";
import ApexCharts from "react-apexcharts";

export default function SalesByProduct({ orders }) {
  // Criação de um dicionário para acumular a contagem de pedidos por produto
  const productSales = {};

  // Loop pelos pedidos para acumular as contagens por produto
  orders.forEach(order => {
    const productId = order.inventory.productId;

    if (productSales[productId]) {
      productSales[productId].count += 1; // Incrementa a contagem de pedidos
    } else {
      productSales[productId] = {
        count: 1, // Inicializa a contagem para o produto
        productName: order.inventory.productName, // Nome do produto
      };
    }
  });

  // Obtendo os nomes dos produtos para os rótulos e as contagens para a série
  const labels = Object.values(productSales).map(product => product.productName); // Nomes dos produtos
  const series = Object.values(productSales).map(product => product.count); // Contagens

  const donutOption = {
    labels: labels,
    legend: {
      position: "right",
      fontSize: "14",
    },
    title: {
      text: "Vendas por Produto",
    },
  };

  return (
    <Box
      sx={{
        margin: 3,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "100%",
      }}
    >
      <ApexCharts
        options={donutOption}
        series={series}
        type="pie"
        width="100%"
      />
    </Box>
  );
}
