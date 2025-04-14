import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = () => {
  const [baseCode, setBaseCode] = useState(''); 
  const [quantity, setQuantity] = useState(1);
  const [accumulator, setAccumulator] = useState(1); // Estado para o acumulador
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const canvasRefs = useRef([]);

  const handleBaseCodeChange = (event) => {
    setBaseCode(event.target.value);
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10); 
    if (value > 0) {
      setQuantity(value); 
    } 
  };

  const handleAccumulatorChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0) {
      setAccumulator(value); // Atualiza o acumulador
    }
  };

  const handleDownloadAll = () => {
    for (let i = 0; i < quantity; i++) {
      const qrCodeCanvas = canvasRefs.current[i];
      if (qrCodeCanvas) {
        const pngUrl = qrCodeCanvas.toDataURL('image/png');
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
        sx={{
            mt: 10,
            height: '100vh',
        }}>
      <Paper elevation={4} sx={{ padding: 10, borderRadius: 2, backgroundColor: '#f5f5f5', width: '95%' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center'  }}>
          Gerar Vários QR Codes
        </Typography>
        <TextField
          label="Digite a base do código"
          variant="outlined"
          fullWidth
          value={baseCode}
          onChange={handleBaseCodeChange}
          sx={{ mb: 4 }}
        />
        <TextField
          label="Quantidade de QR Codes"
          variant="outlined"
          type="number"
          fullWidth
          value={quantity}
          onChange={handleQuantityChange}
          sx={{ mb: 4 }}
        />
        <TextField
          label="Acumulador (inicial)"
          variant="outlined"
          type="number"
          fullWidth
          value={accumulator}
          onChange={handleAccumulatorChange}
          sx={{ mb: 4 }}
        />
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={4} justifyContent="center">
            {Array.from({ length: Math.min(quantity, 5) }).map((_, index) => (
              <Grid item key={index} xs={6} sm={4} md={3} lg={2} sx={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                <QRCodeCanvas
                  ref={(el) => (canvasRefs.current[index] = el)}
                  value={`${baseCode}-${String(accumulator + index).padStart(3, '0')}`} // Use o acumulador para gerar o código
                  size={256}
                  style={{ marginBottom: '16px' }}
                  marginSize={2}
                />
              </Grid>
            ))}
            {quantity > 5 && (
              <Grid item xs={6} sm={4} md={3} lg={2} sx={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  +{quantity - 5} ...
                </Typography>
              </Grid>
            )}
          </Grid>
          {baseCode && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadAll}
              sx={{ mt: 2 }}
            >
              Baixar Todos os QR Codes
            </Button>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRCodeGenerator;
