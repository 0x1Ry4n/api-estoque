import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";
import api from '../../../../api'; // Ajuste a importação conforme necessário

export default function SalesDataChart() {
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/details'); // Ajuste a rota conforme necessário
        const orders = response.data.content;

        const productSales = {};
        const productNames = [];

        // Processar os dados para calcular a quantidade vendida por produto
        orders.forEach(order => {
          const productName = order.inventory.productName;
          const quantity = order.quantity;

          // Somar as quantidades vendidas de cada produto
          if (productSales[productName]) {
            productSales[productName] += quantity;
          } else {
            productSales[productName] = quantity;
            productNames.push(productName); // Adiciona o nome do produto se for a primeira vez
          }
        });

        // Organizar os dados para as séries e categorias do gráfico
        const salesSeries = [
          {
            name: "Quantidade Vendida",
            data: Object.values(productSales),
          },
        ];

        setSeries(salesSeries);
        setCategories(productNames);
      } catch (error) {
        console.error("Erro ao buscar dados dos pedidos", error);
      }
    };

    fetchOrders();
  }, []);

  const options = {
    chart: {
      id: "sales-chart",
      type: "bar",
    },
    dataLabels: {
      enabled: true,
    },
    xaxis: {
      categories: categories,
    },
    title: {
      text: "Quantidade vendida por Produto",
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} units sold`,
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
        height: "100%",
      }}
    >
      <ApexCharts
        options={options}
        series={series}
        height={300}
        type="bar"
        width="100%"
      />
    </Box>
  );
}
