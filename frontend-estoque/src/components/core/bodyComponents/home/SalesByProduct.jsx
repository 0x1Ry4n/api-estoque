import React from "react";
import ApexCharts from "react-apexcharts";
import { Box, useMediaQuery, useTheme } from "@mui/material";

export default function SalesByProduct({ receivements }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
      position: isSmallScreen ? "bottom" : "right",
      fontSize: "14px",
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    title: {
      text: "Inventários com mais entradas",
      style: {
        fontSize: isSmallScreen ? "14px" : "16px"
      }
    },
    chart: {
      type: "pie",
      width: "100%",
      height: isSmallScreen ? 350 : 400,
    },
    responsive: [{
      breakpoint: theme.breakpoints.values.sm,
      options: {
        legend: {
          position: "bottom"
        }
      }
    }]
  };

  return (
    <Box
      sx={{
        margin: { xs: 1, sm: 3 },
        bgcolor: "white",
        borderRadius: 2,
        padding: { xs: 1, sm: 3 },
        height: "100%",
      }}
    >
      <ApexCharts
        options={donutOption}
        series={series}
        type="pie"
        width="100%"
        height={isSmallScreen ? 600 : 800}
      />
    </Box>
  );
}