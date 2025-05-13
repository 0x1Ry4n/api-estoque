import ApexCharts from "react-apexcharts";
import { Box, useMediaQuery, useTheme } from "@mui/material";

export default function SalesByProduct({ receivements }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

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
    chart: {
      type: 'pie',
      height: 'auto',
    },
    labels: labels,
    legend: {
      position: isSmallScreen ? "bottom" : "right",
      fontSize: isSmallScreen ? "12px" : "14px",
      itemMargin: {
        horizontal: 8,
        vertical: 4
      },
      formatter: function (seriesName, opts) {
        return isSmallScreen ?
          seriesName.split(' - ')[0] + '...' :
          seriesName;
      }
    },
    title: {
      text: "Inventários com mais entradas",
      align: 'center',
      style: {
        fontSize: isSmallScreen ? "14px" : "16px",
        fontWeight: 'bold',
        color: theme.palette.text.primary
      }
    },
    responsive: [{
      breakpoint: theme.breakpoints.values.sm,
      options: {
        chart: {
          width: '100%'
        },
        legend: {
          position: 'bottom',
          horizontalAlign: 'center'
        }
      }
    }],
    plotOptions: {
      pie: {
        donut: {
          size: isSmallScreen ? '50%' : '65%',
          labels: {
            show: !isSmallScreen,
            total: {
              show: !isSmallScreen,
              label: 'Total',
              color: theme.palette.text.primary
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: !isSmallScreen,
      style: {
        fontSize: isSmallScreen ? '10px' : '12px',
        colors: [theme.palette.background.paper]
      },
      dropShadow: {
        enabled: false
      }
    }
  };

  return (
    <Box
      sx={{
        margin: { xs: 1, sm: 3 },
        bgcolor: "background.paper",
        borderRadius: 2,
        padding: { xs: 1, sm: 3 },
        height: "100%",
        boxShadow: theme.shadows[1]
      }}
    >
      <ApexCharts
        options={donutOption}
        series={series}
        type="pie"
        height={isSmallScreen ? 400 : isMediumScreen ? 450 : 500}
        width="100%"
      />
    </Box>
  );
}