import React from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";

export default function TotalSales({ receivements, exits }) {
  const receivementData = receivements.reduce((acc, receivement) => {
    const date = new Date(receivement.receivingDate).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const exitData = exits.reduce((acc, exit) => {
    const date = new Date(exit.exitDate).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const allDates = Array.from(new Set([
    ...Object.keys(receivementData),
    ...Object.keys(exitData),
  ])).sort((a, b) => new Date(a) - new Date(b)); 

  const receivementQuantity = allDates.map(date => receivementData[date] || 0);
  const exitQuantity = allDates.map(date => exitData[date] || 0);

  const options = {
    title: {
      text: "Recebimentos x Saídas",
      align: "left",
      style: { fontSize: "16px", color: "#666" },
    },
    subtitle: {
      text: "Comparação entre Recebimentos e Saídas por Produto",
      align: "left",
      style: { fontSize: "16px", color: "#666" },
    },
    stroke: { curve: "smooth", width: 3 },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "14px",
      fontFamily: "Helvetica, Arial",
      offsetY: -20,
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: { size: 9 },
    },
    theme: { mode: "light" },
    chart: {
      height: 328,
      type: "line",
      zoom: { enabled: true },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 2,
        blur: 4,
        opacity: 0.2,
      },
    },
    xaxis: {
      categories: allDates,
    },
  };

  const series = [
    { name: "Entradas", data: receivementQuantity },
    { name: "Saídas", data: exitQuantity },
  ];

  return (
    <Box sx={{
      margin: 3,
      bgcolor: "white",
      borderRadius: 2,
      padding: 3,
      height: "100%",
    }}>
      <ApexCharts
        options={options}
        series={series}
        height={300}
        type="line"
        width="100%"
      />
    </Box>
  );
}
