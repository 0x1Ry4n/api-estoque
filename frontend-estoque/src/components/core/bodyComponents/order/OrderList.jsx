import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Box, 
  useTheme, 
  useMediaQuery
} from "@mui/material";
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { OrderService } from "../../../../services/orderService";
import { fileExporters } from "../../../../utils/utils";

const Orders = () => {
  const [open, setOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailedOrder, setDetailedOrder] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


  const paymentMethods = {
    CREDIT_CARD: "Cartão de Crédito",
    DEBIT_CARD: "Cartão de Débito",
    MONEY: "Dinheiro",
    PIX: "Pix",
    BANK_SLIP: "Boleto"
  };

  const orderStatus = {
    PENDING: "Pendente",
    IN_TRANSIT: "Em trânsito",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado"
  };

  const closeDetailDialogOpen = () => {
    setDetailDialogOpen(false);
  }

  useEffect(() => {
    fetchOrders(page, pageSize);
  }, []);

  const fetchOrders = async (page, pageSize) => {
    setLoading(true);

    try {
      const response = await OrderService.getOrders(true, page, pageSize);

      if (response.status === 200) {
        const ordersWithId = response.data.content.map(order => ({
          id: order.orderId,
          ...order
        }));
        setRows(ordersWithId);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) return;

      setSnackbarMessage("Erro ao carregar pedidos.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailOpen = async (orderNumber) => {
    try {
      const response = await OrderService.getOrderByOrderNumber(orderNumber);
      setDetailedOrder(response.data);
      setDetailDialogOpen(true);
    } catch (error) {
      setSnackbarMessage("Erro ao carregar detalhes do pedido.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    setSnackbarMessage("Lista de pedidos atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "orderNumber",
      headerName: "Número do Pedido",
      width: 150
    },
    {
      field: "customer.name",
      headerName: "Cliente",
      width: 200,
      valueGetter: (params) => params.row.customer?.name || "N/A",
    },
    {
      field: "totalAmount",
      headerName: "Valor Total",
      width: 120,
      valueGetter: (params) => params.row.totalAmount ? `R$ ${params.row.totalAmount.toFixed(2)}` : "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      valueGetter: (params) => orderStatus[params.value] || params.value
    },
    {
      field: "paymentMethod",
      headerName: "Pagamento",
      width: 180,
      valueGetter: (params) => paymentMethods[params.value] || params.value
    },
    {
      field: "deliveryDate",
      headerName: "Data de Entrega",
      width: 180,
      valueGetter: (params) => params.row.deliveryDate ? new Date(params.row.deliveryDate).toLocaleDateString() : "N/A"
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (cellData) => (
        <>
          <Button onClick={() => handleDetailOpen(cellData.row.orderNumber)} color="primary">
            <VisibilityIcon />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: "95%" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
          Atualizar Lista
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => fileExporters.exportToExcel("Fornecedores", "fornecedores.xlsx", rows)}
        >
          Exportar Excel
        </Button>
      </div>

      <div style={{ height: 400, width: '100%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </div>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            rowCount={totalElements}
            paginationMode="server"
            paginationModel={{
              page,
              pageSize,
            }}
            onPaginationModelChange={({ page, pageSize }) => {
              setPage(page);
              setPageSize(pageSize);
              fetchSuppliers(page, pageSize);
            }}
            pageSizeOptions={[20, 50, 100]}
          />
        )}
      </div>

      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            p: isMobile ? 2 : 4,
            borderRadius: 2,
          },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <DialogTitle>Detalhes do Pedido #{detailedOrder?.orderNumber}</DialogTitle>
          <IconButton onClick={closeDetailDialogOpen}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent dividers>
          {detailedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>Informações do Pedido</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Status:</strong></TableCell>
                      <TableCell>{orderStatus[detailedOrder.status] || detailedOrder.status}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Método de Pagamento:</strong></TableCell>
                      <TableCell>{paymentMethods[detailedOrder.paymentMethod] || detailedOrder.paymentMethod}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Valor Total:</strong></TableCell>
                      <TableCell>R$ {detailedOrder.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Data de Entrega:</strong></TableCell>
                      <TableCell>{new Date(detailedOrder.deliveryDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Observações:</strong></TableCell>
                      <TableCell>{detailedOrder.observation || "Nenhuma"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom>Itens do Pedido</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Quantidade</TableCell>
                      <TableCell>Preço Unitário</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.productCategory}
                            sx={{
                              fontWeight: 'bold',
                              color: 'gray',
                              height: 25,
                              maxWidth: 150,
                              p: 2,
                              '& .MuiChip-label': {
                                paddingLeft: 1,
                                paddingRight: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell>{item.quantity} {item.unit}</TableCell>
                        <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>R$ {(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Informações do Cliente</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Nome:</strong></TableCell>
                      <TableCell>{detailedOrder.customer?.name || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Telefone:</strong></TableCell>
                      <TableCell>{detailedOrder.customer?.phone || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>CPF:</strong></TableCell>
                      <TableCell>{detailedOrder.customer?.cpf || "N/A"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div >
  );
};

export default Orders;