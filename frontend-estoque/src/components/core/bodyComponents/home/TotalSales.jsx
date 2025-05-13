import { useMemo, useState } from "react";
import ApexCharts from "react-apexcharts";
import { Box, useMediaQuery, useTheme, FormControl, MenuItem, Select, InputLabel } from "@mui/material";

function getWeekYearKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNumber = Math.ceil((((d - week1) / 86400000) + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-${weekNumber}`;
}

function formatWeekLabel(key) {
  const [year, week] = key.split("-");
  const month = new Date(`${year}-01-01`);
  month.setDate((week - 1) * 7);
  return `Sem ${week} - ${month.toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit'
  })}`;
}

export default function TotalSales({ receivements, exits }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [filter, setFilter] = useState("all");

  const { series, categories } = useMemo(() => {
    const weekData = {};

    const processItem = (item, dateField, isEntry) => {
      const date = new Date(item[dateField]);
      const weekKey = getWeekYearKey(date);
      if (!weekData[weekKey]) {
        weekData[weekKey] = {
          entradaQtd: 0,
          entradaValor: 0,
          saidaQtd: 0,
          saidaValor: 0,
        };
      }
      const total = item.totalPrice || 0;
      if (isEntry) {
        weekData[weekKey].entradaQtd += 1;
        weekData[weekKey].entradaValor += total;
      } else {
        weekData[weekKey].saidaQtd += 1;
        weekData[weekKey].saidaValor += total;
      }
    };

    receivements.forEach(item => processItem(item, "receivingDate", true));
    exits.forEach(item => processItem(item, "exitDate", false));

    const sortedWeeks = Object.keys(weekData).sort();
    const categories = sortedWeeks.map(formatWeekLabel);

    const allSeries = {
      entradaQtd: [],
      saidaQtd: [],
      entradaValor: [],
      saidaValor: []
    };

    sortedWeeks.forEach(key => {
      const data = weekData[key];
      allSeries.entradaQtd.push(data.entradaQtd);
      allSeries.saidaQtd.push(data.saidaQtd);
      allSeries.entradaValor.push(data.entradaValor);
      allSeries.saidaValor.push(data.saidaValor);
    });

    const series = [];

    if (filter === "all" || filter === "entrada") {
      series.push({ name: "Qtd Entradas", type: "column", data: allSeries.entradaQtd });
      series.push({ name: "R$ Entradas", type: "line", data: allSeries.entradaValor });
    }

    if (filter === "all" || filter === "saida") {
      series.push({ name: "Qtd Saídas", type: "column", data: allSeries.saidaQtd });
      series.push({ name: "R$ Saídas", type: "line", data: allSeries.saidaValor });
    }

    return { series, categories };
  }, [receivements, exits, filter]);

  const options = {
    chart: {
      height: isSmallScreen ? 350 : 450,
      type: 'line',
      stacked: false,
      zoom: {
        enabled: !isSmallScreen,
        type: 'x',
        autoScaleYaxis: true
      },
      toolbar: {  
        show: true,
        tools: {
          download: true,
          selection: !isSmallScreen,
          zoom: !isSmallScreen,
          zoomin: !isSmallScreen,
          zoomout: !isSmallScreen,
          pan: !isSmallScreen,
          reset: !isSmallScreen
        }
      }
    },
    stroke: {
      width: [2, 2, 2, 2], 
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 4
      }
    },
    colors: ['#008FFB', '#00E396', '#FF4560', '#775DD0'],
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 5
    },
    title: {
      text: 'Movimentação Diária - Entradas e Saídas',
      align: 'left',
      style: {
        fontSize: isSmallScreen ? '14px' : '16px',
        fontWeight: 'bold',
        color: theme.palette.text.primary
      }
    },
    subtitle: {
      text: 'Comparação entre quantidade e valor total',
      align: 'left',
      style: {
        fontSize: isSmallScreen ? '12px' : '14px',
        color: theme.palette.text.secondary
      }
    },
    xaxis: {
      categories,
      labels: {
        rotate: isSmallScreen ? -45 : 0,
        style: {
          fontSize: isSmallScreen ? '10px' : '12px'
        }
      }
    },
    yaxis: [
      {
        seriesName: 'Quantidade',
        min: 0,
        tickAmount: 6,
        title: { text: 'Quantidade' },
        labels: {
          formatter: val => val.toFixed(0)
        }
      },
      {
        seriesName: 'Valor',
        opposite: true,
        min: 0,
        tickAmount: 4,
        title: { text: 'Valor (R$)' },
        labels: {
          formatter: val => 'R$ ' + val.toFixed(2).replace('.', ','),
        }
      }
    ],
    legend: {
      position: isSmallScreen ? 'bottom' : 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    tooltip: {
      shared: true,
      y: {
        formatter: function (value, { seriesIndex }) {
          return seriesIndex % 2 === 0
            ? value + ' unid.'
            : 'R$ ' + value.toFixed(2).replace('.', ',');
        }
      }
    },
    responsive: [{
      breakpoint: theme.breakpoints.values.sm,
      options: {
        chart: {
          height: 400
        },
        legend: {
          position: 'bottom',
          offsetY: 0
        },
        xaxis: {
          labels: {
            rotate: -45
          }
        }
      }
    }]
  };

  return (
    <Box sx={{
      margin: { xs: 1, sm: 3 },
      bgcolor: "background.paper",
      borderRadius: 2,
      padding: { xs: 1, sm: 3 },
      height: "100%",
      boxShadow: theme.shadows[1]
    }}>
      <FormControl fullWidth size="small" sx={{ mt: 5, ml: 2, mb: 2, width: "50%" }}>
        <InputLabel>Filtro</InputLabel>
        <Select
          label="Filtro"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="entrada">Somente Entradas</MenuItem>
          <MenuItem value="saida">Somente Saídas</MenuItem>
        </Select>
      </FormControl>

      <ApexCharts
        options={options}
        series={series}
        height={isSmallScreen ? 400 : 450}
        width="100%"
      />
    </Box>
  );
}
