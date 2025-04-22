import React from "react";
import ApexCharts from "react-apexcharts";
import { Box } from "@mui/material";

export default function SalesByProduct({ receivements }) {
  const productCountMap = {};

  receivements.forEach(r => {
    const productId = r.productId;
    if (productCountMap[productId]) {
      productCountMap[productId].count += 1;
    } else {
      productCountMap[productId] = {
        count: 1,
        inventoryCode: r.inventoryCode,
      };
    }
  });

  const labels = Object.values(productCountMap).map(
    r => `${r.inventoryCode} - ${r.count} entradas`
  );
  const series = Object.values(productCountMap).map(r => r.count);

  const donutOption = {
    labels: labels,
    legend: {
      position: "right",
      fontSize: "14",
    },
    title: {
      text: "Inventários com mais entradas",
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
