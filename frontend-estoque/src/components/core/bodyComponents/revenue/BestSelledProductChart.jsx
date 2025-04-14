import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import api from '../../../../api'; // Certifique-se de ajustar a importação de seu serviço API

export default function BestSelledProductChart() {
  const [channelData, setChannelData] = useState([]);

  useEffect(() => {
    const fetchBestSellingProducts = async () => {
      try {
        const response = await api.get('/orders/details'); // Ajuste conforme a rota correta
        const orders = response.data.content;

        // Exemplo de como processar os dados dos produtos mais vendidos
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

        // Organize os dados para serem utilizados no gráfico
        const chartData = Object.keys(productSales).map(product => ({
          name: product,
          data: [productSales[product]], // Agrupar as quantidades vendidas de cada produto
        }));

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
      text: "Top 5 Produtos Vendidas na última semana",
    },
    plotOptions: {
      bar: {
        columnWidth: "15%",
        horizontal: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 1,
    },
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 7,
      },
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"], // Dias da semana como categorias no eixo X
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
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
        type="bar" // Gráfico de barras empilhadas
        width="100%"
        height="320"
      />
    </Box>
  );
}
