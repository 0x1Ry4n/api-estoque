import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import api from '../../../../api'; // Certifique-se de ajustar a importação de seu serviço API

export default function BestSelledProductChart() {
  const [channelData, setChannelData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchBestSellingProducts = async () => {
      try {
        const response = await api.get('/orders/details'); // Ajuste conforme a rota correta
        const orders = response.data.content;

        // Processar os dados dos produtos mais vendidos
        const productSales = {};

        orders.forEach(order => {
          const productName = order.inventory.productName;
          const quantity = order.quantity;

          // Somar as quantidades vendidas de cada produto
          if (productSales[productName]) {
            productSales[productName] += quantity;
          } else {
            productSales[productName] = quantity;
          }
        });

        // Organize os dados para o gráfico
        const chartData = Object.keys(productSales).map(product => ({
          name: product,
          data: [productSales[product]], // Agrupar as quantidades vendidas de cada produto
        }));

        // Definir os nomes dos produtos como categorias
        setCategories(Object.keys(productSales));

        setChannelData(chartData);
      } catch (error) {
        console.error("Erro ao buscar dados da API", error);
      }
    };

    fetchBestSellingProducts();
  }, []);

  // Configuração do gráfico com barras empilhadas
  const options3 = {
    chart: {
      id: "basic-bar",
      type: "bar",
      stacked: true, // Configuração para barras empilhadas
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      offsetY: 0,
    },
    title: {
      text: "Top 5 Produtos Vendidos neste ano",
    },
    plotOptions: {
      bar: {
        distributed: true, // Distribuir cores diferentes para cada barra
        barHeight: "40%",
        horizontal: true, // Barras horizontais
      },
    },
    colors: ["#5A4FCF", "#FFA500", "#C53500", "#FFBF00", "#FF3659"],
    xaxis: {
      categories: categories, // Produtos como categorias no eixo X
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: "topLeft", // Posição fixa do tooltip
        offsetY: 30,
        offsetX: 60,
      },
    },
  };

  return (
    <Box
      sx={{
        marginX: 4,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "95%",
      }}
    >
      <ApexCharts
        options={options3}
        series={channelData}
        type="bar"
        width="100%"
        height="320"
      />
    </Box>
  );
}
