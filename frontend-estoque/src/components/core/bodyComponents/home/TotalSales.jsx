import { useMemo, useState } from "react";
import ApexCharts from "react-apexcharts";
import {
  Box,
  useMediaQuery,
  useTheme,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Stack
} from "@mui/material";
import {
  BarChart,
  ShowChart,
  Input,
  Output
} from "@mui/icons-material";

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
  return `Sem ${week}`;
}

export default function SalesAnalysis({ receivements, exits }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [viewMode, setViewMode] = useState('both');
  const [dataType, setDataType] = useState('both');
  const [timeRange, setTimeRange] = useState('12');

  const { series, categories } = useMemo(() => {
    const weekData = {};

    const processItem = (item, dateField, isEntry) => {
      const date = new Date(item[dateField]);
      const weekKey = getWeekYearKey(date);
      if (!weekData[weekKey]) {
        weekData[weekKey] = { entradaQtd: 0, entradaValor: 0, saidaQtd: 0, saidaValor: 0 };
      }
      const total = item.totalPrice || 0;
      if (isEntry) {
        weekData[weekKey].entradaQtd += item.quantity;
        weekData[weekKey].entradaValor += total;
      } else {
        weekData[weekKey].saidaQtd += item.quantity;
        weekData[weekKey].saidaValor += total;
      }
    };

    receivements.forEach(item => processItem(item, "receivingDate", true));
    exits.forEach(item => processItem(item, "exitDate", false));

    let sortedWeeks = Object.keys(weekData).sort();
    if (timeRange !== 'all') {
      sortedWeeks = sortedWeeks.slice(-parseInt(timeRange));
    }
    const categories = sortedWeeks.map(formatWeekLabel);

    const series = [];
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

    const showQuantities = dataType === 'both' || dataType === 'quantity';
    const showValues = dataType === 'both' || dataType === 'value';
    const showEntries = viewMode === 'both' || viewMode === 'entries';
    const showExits = viewMode === 'both' || viewMode === 'exits';

    if (showQuantities) {
      if (showEntries) {
        series.push({
          name: "Entradas (Qtd)",
          type: "column",
          data: allSeries.entradaQtd,
          color: theme.palette.success.main
        });
      }
      if (showExits) {
        series.push({
          name: "Saídas (Qtd)",
          type: "column",
          data: allSeries.saidaQtd,
          color: theme.palette.error.main
        });
      }
    }

    if (showValues) {
      if (showEntries) {
        series.push({
          name: "Entradas (R$)",
          type: "line",
          data: allSeries.entradaValor,
          color: theme.palette.success.dark,
          yAxisIndex: 1
        });
      }
      if (showExits) {
        series.push({
          name: "Saídas (R$)",
          type: "line",
          data: allSeries.saidaValor,
          color: theme.palette.error.dark,
          yAxisIndex: 1
        });
      }
    }

    return { series, categories };
  }, [receivements, exits, viewMode, dataType, timeRange, theme]);

  const chartOptions = {
    chart: {
      type: 'line',
      height: '100%',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          pan: false,
          reset: true
        },
        export: {
          csv: {
            filename: 'analise-movimentacao',
            headerCategory: 'Semana'
          },
          svg: {
            filename: 'analise-movimentacao'
          },
          png: {
            filename: 'analise-movimentacao'
          }
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      },
      fontFamily: theme.typography.fontFamily
    },
    stroke: {
      width: [1, 1, 3, 3],
      curve: 'smooth',
      dashArray: [0, 0, 0, 0]
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    },
    markers: {
      size: 5,
      hover: {
        size: 7
      }
    },
    title: {
      text: 'Análise de Movimentação',
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: theme.palette.text.primary
      }
    },
    subtitle: {
      text: 'Comparativo semanal de entradas e saídas',
      align: 'left',
      style: {
        fontSize: '14px',
        color: theme.palette.text.secondary
      }
    },
    xaxis: {
      categories,
      labels: {
        rotate: isSmallScreen ? -45 : 0,
        style: {
          fontSize: '12px',
          colors: theme.palette.text.secondary
        }
      },
      axisBorder: {
        show: true,
        color: theme.palette.divider
      },
      axisTicks: {
        show: true,
        color: theme.palette.divider
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: [
      {
        seriesName: 'Valor (R$)',
        min: 0,
        tickAmount: 5,
        title: {
          text: 'Valor (R$)',
          style: {
            color: theme.palette.text.secondary,
            fontSize: '12px'
          }
        },
        labels: {
          style: {
            colors: theme.palette.text.secondary
          },
          formatter: (val) => Math.round(val)
        },
        axisBorder: {
          show: true,
          color: theme.palette.divider
        }
      },
    ],
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      markers: {
        radius: 8,
        width: 8,
        height: 8
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (value, { seriesIndex, w }) {
          const seriesName = w.globals.seriesNames[seriesIndex];
          return seriesName.includes('R$')
            ? 'R$ ' + value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
            : value + ' unid.';
        }
      },
      style: {
        fontSize: '14px'
      },
      theme: theme.palette.mode
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    responsive: [{
      breakpoint: theme.breakpoints.values.sm,
      options: {
        chart: {
          height: 400,
          toolbar: {
            show: false
          }
        },
        legend: {
          position: 'bottom',
          offsetY: 0
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return val.toFixed(0);
            }
          }
        }
      }
    }],
  };

  return (
    <Box sx={{
      margin: { xs: 1, sm: 3 },
      bgcolor: "background.paper",
      borderRadius: 2,
      padding: { xs: 4, sm: 6 },
      height: "100%",
      boxShadow: theme.shadows[1]
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: isSmallScreen ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isSmallScreen ? 'flex-start' : 'center',
        mb: 3,
        gap: 2
      }}>
        <Stack
          direction={isSmallScreen ? 'column' : 'row'}
          spacing={2}
          sx={{ width: isSmallScreen ? '100%' : 'auto' }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Período"
            >
              <MenuItem value="4">Últimas 4 semanas</MenuItem>
              <MenuItem value="8">Últimas 8 semanas</MenuItem>
              <MenuItem value="12">Últimas 12 semanas</MenuItem>
              <MenuItem value="all">Todo o período</MenuItem>
            </Select>
          </FormControl>

          {!isSmallScreen ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
                aria-label="Visualização"
                sx={{
                  bgcolor: 'background.default',
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 1
                  }
                }}
              >
                <ToggleButton value="entries" aria-label="Entradas">
                  <Input fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption">Entradas</Typography>
                </ToggleButton>
                <ToggleButton value="exits" aria-label="Saídas">
                  <Output fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption">Saídas</Typography>
                </ToggleButton>
                <ToggleButton value="both" aria-label="Ambos">
                  <Typography variant="caption">Ambos</Typography>
                </ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                value={dataType}
                exclusive
                onChange={(_, newType) => newType && setDataType(newType)}
                size="small"
                aria-label="Tipo de dados"
                sx={{
                  bgcolor: 'background.default',
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 1
                  }
                }}
              >
                <ToggleButton value="quantity" aria-label="Quantidades">
                  <BarChart fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption">Qtd</Typography>
                </ToggleButton>
                <ToggleButton value="value" aria-label="Valores">
                  <ShowChart fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption">R$</Typography>
                </ToggleButton>
                <ToggleButton value="both" aria-label="Ambos">
                  <Typography variant="caption">Ambos</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          ) : null
          }

        </Stack>
      </Box>

      {/* Chart container */}
      <Box sx={{
        flex: 1,
        minHeight: 400,
        position: 'relative'
      }}>
        <ApexCharts
          options={chartOptions}
          series={series}
          height="100%"
          width="100%"
        />
      </Box>

      {/* Footer */}
      <Box sx={{
        mt: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="caption" color="text.secondary">
          Dados atualizados em {new Date().toLocaleDateString('pt-BR')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          * Valores em Reais (R$)
        </Typography>
      </Box>
    </Box>
  );
}