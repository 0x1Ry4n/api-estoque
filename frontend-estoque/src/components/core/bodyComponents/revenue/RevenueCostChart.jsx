import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import api from '../../../../api';
import dayjs from 'dayjs'; // Utilize a biblioteca dayjs para manipular datas

export default function RevenueCostChart() {
  const [channelData, setChannelData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(
          "/orders/details",
          {
            params: {
              page: 0,
              size: 20,
            },
          }
        );

        const orders = response.data.content;

        // Inicializar arrays para receita e custo por mês
        const revenueData = Array(12).fill(0);
        const costData = Array(12).fill(0);

        orders.forEach((order) => {
          const { totalPrice, quantity, inventory, orderDate } = order;
          const { unitPrice } = inventory;

          // Extraindo o mês da orderDate (1-12) e ajustando para índice (0-11)
          const monthIndex = dayjs(orderDate).month(); // dayjs().month() retorna 0 para Janeiro e 11 para Dezembro

          // Somar receita e custo para o mês correspondente
          revenueData[monthIndex] += totalPrice;
          costData[monthIndex] += quantity * unitPrice;
        });

        setChannelData([
          {
            name: "Receita",
            type: "column",
            data: revenueData, // Dados organizados por mês
          },
          {
            name: "Custos",
            type: "column",
            data: costData, // Dados organizados por mês
          },
        ]);
      } catch (error) {
        console.error("Erro ao buscar dados da API", error);
      }
    };

    fetchData();

    return () => {
      setChannelData([]);
    };
  }, []);

  const options3 = {
    colors: ["#00D100", "#FF2E2E"],
    chart: {
      id: "basic-bar",
      type: "bar",
      stacked: false,
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
      text: "Receita e Custos neste ano",
    },
    plotOptions: {
      bar: {
        columnWidth: "30%",
        horizontal: false,
      },
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez",
      ], // Mapeando para meses
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: "topLeft",
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
