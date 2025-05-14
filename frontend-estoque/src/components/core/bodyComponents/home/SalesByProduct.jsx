import ApexCharts from "react-apexcharts";
import { Box, useMediaQuery, useTheme, Typography } from "@mui/material";

export default function SalesByProduct({ receivements }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const inventoryData = receivements.reduce((acc, item) => {
    const { inventoryCode, productId, quantity } = item;
    const key = `${inventoryCode} - ${productId}`;

    if (!acc[key]) {
      acc[key] = {
        entries: 0,
        totalQuantity: 0,
        inventoryCode,
        productId
      };
    }

    acc[key].entries += 1;
    acc[key].totalQuantity += quantity || 1;

    return acc;
  }, {});

  const sortedData = Object.values(inventoryData).sort((a, b) => b.totalQuantity - a.totalQuantity);

  const displayData = sortedData.slice(0, 10);

  const series = [{
    name: 'Dados',
    data: displayData.map(item => item.totalQuantity)
  }];

  const categories = displayData.map(item =>
    `${item.inventoryCode} - ${item.productId}`
  );

  const options = {
    chart: {
      type: 'bar',
      height: 'auto',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          pan: false,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: isSmallScreen,
        columnWidth: '60%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toLocaleString(),
      style: {
        fontSize: '11px',
        colors: [theme.palette.text.primary]
      },
      offsetY: isSmallScreen ? 0 : -20
    },
    colors: [theme.palette.primary.main],
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: isSmallScreen ? '10px' : '12px',
          colors: theme.palette.text.secondary
        },
        formatter: function(value) {
          return !isSmallScreen 
            ? `${value.substring(0, 16)}...` 
            : value.length > 10 
              ? `${value.substring(0, 10)}...` 
              : value;
        }
      },
      axisBorder: {
        show: true,
        color: theme.palette.divider
      },
      axisTicks: {
        show: true,
        color: theme.palette.divider
      }
    },
    yaxis: {
      title: {
        text: 'Quantidade',
        style: {
          fontSize: '12px',
          color: theme.palette.text.secondary
        }
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (value, { seriesIndex, dataPointIndex }) {
          const item = displayData[dataPointIndex];
          return [
            `<div style="font-weight:600">${item.inventoryCode} - ${item.productId}</div>`,
            `<div>Quantidade Total: <strong>${value.toLocaleString()}</strong></div>`,
            `<div>Entradas: <strong>${item.entries}</strong></div>`
          ].join('');
        }
      },
      style: {
        fontSize: '14px'
      }
    },
    title: {
      text: "Top 10 Itens de Inventário por Quantidade",
      align: 'center',
      style: {
        fontSize: isSmallScreen ? "16px" : "18px",
        fontWeight: 'bold',
        color: theme.palette.text.primary
      }
    },
    subtitle: {
      text: "Ordenado pela quantidade total recebida",
      align: 'center',
      style: {
        fontSize: isSmallScreen ? "12px" : "14px",
        color: theme.palette.text.secondary
      }
    },
    responsive: [{
      breakpoint: theme.breakpoints.values.sm,
      options: {
        plotOptions: {
          bar: {
            horizontal: true,
            columnWidth: '40%'
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => val.toLocaleString(),
          style: {
            fontSize: '10px'
          }
        }
      }
    }]
  };

  return (
    <Box
      sx={{
        margin: { xs: 1, sm: 3 },
        bgcolor: "background.paper",
        borderRadius: 2,
        padding: { xs: 4, sm: 6 },
        height: "100%",
        boxShadow: theme.shadows[1]
      }}
    >
      <ApexCharts
        options={options}
        series={series}
        type="bar"
        height="100%"
        width="100%"
      />

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'right' }}>
        Dados atualizados em {new Date().toLocaleDateString('pt-BR')}
      </Typography>
    </Box>
  );
}