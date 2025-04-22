import { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = () => {
  const [baseCode, setBaseCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [accumulator, setAccumulator] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const canvasRefs = useRef([]);

  const handleDownloadAll = () => {
    for (let i = 0; i < quantity; i++) {
      const canvas = canvasRefs.current[i];
      if (canvas) {
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${baseCode}-${String(accumulator + i).padStart(3, '0')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
    setSnackbarMessage(`${quantity} QR Codes baixados com sucesso!`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handlePrint = () => window.print();
  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box sx={{
      width: isMobile ? '100vw' : '80vw',
      minHeight: '100vh',
      p: isMobile ? 4 : 2,
      boxSizing: 'border-box',
    }}>
      <Paper elevation={4} sx={{ p: 6, borderRadius: 2, maxWidth: 1000, mx: 'auto' }} className="no-print">
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={4}>
          Gerador de QR Codes
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Base do Código"
              fullWidth
              variant="outlined"
              value={baseCode}
              onChange={(e) => setBaseCode(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <TextField
              label="Quantidade"
              type="number"
              fullWidth
              variant="outlined"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val > 0 && val <= 100) setQuantity(val);
              }}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <TextField
              label="Acumulador Inicial"
              type="number"
              fullWidth
              variant="outlined"
              value={accumulator}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val > 0) setAccumulator(val);
              }}
            />
          </Grid>
        </Grid>

        <Box mt={5} display="flex" justifyContent="center">
          <Box sx={{ border: '1px dashed #ccc', p: 2 }}>
            <QRCodeCanvas
              value={`${baseCode}-${String(accumulator).padStart(3, '0')}`}
              size={160}
            />
            <Typography variant="caption" display="block" mt={1} textAlign="center">
              {`${baseCode}-${String(accumulator).padStart(3, '0')}`}
            </Typography>
          </Box>

        </Box>

        {quantity > 1 && (
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" mt={2}>
              +{quantity - 1} QR Codes não exibidos (mas serão impressos)
            </Typography>
          </Box>
        )}

        <Box display="flex" justifyContent="center" gap={2} mt={5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadAll}
            disabled={!baseCode}
            sx={{ textTransform: 'none', px: 3 }}
          >
            {`Baixar Todos (${quantity - 1})`}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={!baseCode}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Imprimir
          </Button>
        </Box>
      </Paper>

      <Box
        className="print-grid print-only"
        sx={{
          display: 'none',
          mt: 4,
          px: 2,
        }}
      >
        <Grid container spacing={2}>
          {Array.from({ length: quantity }).map((_, index) => (
            <Grid item xs={3} key={index} sx={{ p: '4mm' }}>
              <Box
                sx={{
                  border: '1px dashed #aaa',
                  p: 1,
                  textAlign: 'center',
                }}
              >
                <QRCodeCanvas
                  ref={(el) => (canvasRefs.current[index] = el)}
                  value={`${baseCode}-${String(accumulator + index).padStart(3, '0')}`}
                  size={120}
                />
                <Typography variant="caption" display="block" mt={0.5}>
                  {`${baseCode}-${String(accumulator + index).padStart(3, '0')}`}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <style jsx="true" media="print">
        {`
          @page {
            margin: 10mm;
          }

          body {
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
            page-break-inside: avoid;
          }

          .print-grid .MuiGrid-item {
            break-inside: avoid;
          }
        `}
      </style>

      <style jsx="true">{`
        .print-only {
          display: none;
        }
      `}</style>
    </Box>
  );
};

export default QRCodeGenerator;
