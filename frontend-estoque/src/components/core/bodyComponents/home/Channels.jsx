import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";

export default function Channels({ orders }) {
  const [channelData, setChannelData] = useState([]);

  useEffect(() => {
    const channels = {
      "Online Store": [],
    };

    orders.forEach(order => {
      const totalPrice = order.totalPrice;

      channels["Online Store"].push(totalPrice);
    });

    const seriesData = Object.entries(channels).map(([name, data]) => ({
      name,
      data: data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0],
    }));

    setChannelData(seriesData);
  }, [orders]);

  const options = {
    chart: {
      id: "sales-by-channel",
      type: "bar",
      stacked: true,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
      offsetY: 0,
    },
    title: {
      text: "Vendas por Setor",
    },
    plotOptions: {
      bar: {
        columnWidth: "10%",
        horizontal: false,
      },
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"], 
    },
  };

  return (
    <Box
      sx={{
        margin: 3,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "95%",
      }}
    >
      <ApexCharts
        options={options}
        series={channelData}
        type="bar"
        width="100%"
        height="320"
      />
    </Box>
  );
}
