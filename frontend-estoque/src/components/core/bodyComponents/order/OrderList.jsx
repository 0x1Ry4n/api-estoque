import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  FormControl,
  MenuItem,
  TextField,
  Select,
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
  Tooltip,
  useTheme,
  useMediaQuery,
  Autocomplete
} from "@mui/material";
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { formatDocument } from "../../../../utils/utils";
import { DataGrid, GridToolbar, ptBR } from "@mui/x-data-grid";
import { OrderService } from "../../../../services/orderService";
import { fileExporters } from "../../../../utils/utils";
import { CustomerService } from "../../../../services/customerService";

const Orders = () => {
  const [open, setOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailedOrder, setDetailedOrder] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [customers, setCustomers] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await CustomerService.getCustomer(false, 0, 0);
        setCustomers(res.data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);

  const handleSave = async () => {
    if (!selectedOrder) return;

    try {
      console.log(selectedOrder);

      await OrderService.updateOrder(selectedOrder.orderNumber, {
        customerId: selectedOrder.customer?.id,
        status: selectedOrder.status,
        paymentMethod: selectedOrder.paymentMethod,
        deliveryDate: selectedOrder.deliveryDate,
        observation: selectedOrder.observation,
        items: selectedOrder.items
      });

      setSnackbarMessage('Pedido atualizado com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchOrders(page, pageSize);
      closeModal();
    } catch (e) {
      setSnackbarMessage(`Erro ao atualizar o pedido: ${e.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } 
  }

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

  const openModal = async (order) => {
    setSelectedOrder(order);
    setOpen(true);
  }

  const closeModal = () => {
    setOpen(false);
  }

  const handleClickOpen = (order) => {
    openModal(order);
  }

  useEffect(() => {
    fetchOrders(page, pageSize);
  }, []);

  const fetchOrders = async (page, pageSize) => {
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
      width: 200,
      renderCell: (cellData) => (
        <div>
          <Tooltip title="Editar">
            <Button onClick={() => handleClickOpen(cellData.row)}>
              <EditIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Visualizar">
            <Button onClick={() => handleDetailOpen(cellData.row.orderNumber)} color="primary">
              <VisibilityIcon />
            </Button>
          </Tooltip>
        </div>
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
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
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
      </div>


      <Dialog
        maxWidth="md"
        PaperProps={{
          sx: {
            width: '700px',
            maxWidth: '90vw',
          },
        }}
        open={open}
        onClose={closeModal}
      >
        <DialogTitle>
          Editar Pedido
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={4} sx={{ mt: 2 }}>
            <Autocomplete
              options={customers || []}
              loading={customers === null}
              getOptionLabel={(option) => {
                const doc = option.cpf ? `CPF: ${formatDocument(option.cpf)}` :
                  option.cnpj ? `CNPJ: ${formatDocument(option.cnpj)}` : '';
                return `${option.name || 'Sem nome'} ${doc ? `(${doc})` : ''}`;
              }}
              value={selectedOrder?.customer || null}
              onChange={(event, newValue) => setSelectedOrder({ ...selectedOrder, customer: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  variant="outlined"
                  fullWidth
                  error={!customers}
                  helperText={!customers ? "Carregando clientes..." : ""}
                />
              )}
            />

            <FormControl fullWidth variant="outlined">
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Método de Pagamento</Typography>
              <Select
                value={selectedOrder?.paymentMethod || 'CREDIT_CARD'}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, paymentMethod: e.target.value })}
                variant="outlined"
                required
              >
                <MenuItem value="MONEY">Dinheiro</MenuItem>
                <MenuItem value="PIX">PIX</MenuItem>
                <MenuItem value="CREDIT_CARD">Cartão de Crédito</MenuItem>
                <MenuItem value="DEBIT_CARD">Cartão de Débito</MenuItem>
                <MenuItem value="BANK_SLIP">Boleto</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined">
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Status do Pedido</Typography>
              <Select
                value={selectedOrder?.status || 'PENDING'}
                onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                variant="outlined"
                required
              >
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="IN_TRANSIT">Em Trânsito</MenuItem>
                <MenuItem value="DELIVERED">Entregue</MenuItem>
                <MenuItem value="CANCELED">Cancelado</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Data de Entrega"
              type="datetime-local"
              fullWidth
              variant="outlined"
              value={selectedOrder?.deliveryDate ? new Date(selectedOrder.deliveryDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => setSelectedOrder({ ...selectedOrder, deliveryDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Observações"
              fullWidth
              variant="outlined"
              multiline
              rows={5}
              value={selectedOrder?.observation || ''}
              onChange={(e) => setSelectedOrder({ ...selectedOrder, observation: e.target.value })}
            />

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Itens do Pedido</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell>Quantidade</TableCell>
                      <TableCell>Preço Unitário</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder?.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity} {item.unit}</TableCell>
                        <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>R$ {(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

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
                              color: '#303030',
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