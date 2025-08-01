import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  Grid,
  InputAdornment,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from "@mui/material";
import {
  Edit as EditIcon,
  PersonOutline as PersonOutlineIcon,
  EmailOutlined as EmailOutlinedIcon,
  PhoneOutlined as PhoneOutlinedIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
} from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { DataGridToolbar } from "../../subComponents/DataGridToolbar";
import { CustomerService } from "../../../../services/customerService";
import InputMask from "react-input-mask";

const Customers = () => {
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchCustomers(page, pageSize);
  }, []);

  const fetchCustomers = async (page, pageSize) => {
    try {
      const res = await CustomerService.getCustomer(true, page, pageSize);
      setRows(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (error) {
      console.error("Erro ao buscar clientes: ", error);
      setSnackbarMessage("Erro ao carregar clientes.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClickOpen = (customer) => {
    setSelectedCustomer({
      ...customer,
      status: customer.status || "ACTIVE",
    });
    setOpen(true);
    setIsEditing(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCustomer(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedCustomer.name || !selectedCustomer.email || !selectedCustomer.phone) {
      setSnackbarMessage("Por favor, preencha todos os campos obrigatórios!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      await CustomerService.updateCustomer(selectedCustomer.id, selectedCustomer);
      setRows(
        rows.map((row) =>
          row.id === selectedCustomer.id ? selectedCustomer : row
        )
      );
      setSnackbarMessage("Cliente atualizado com sucesso!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Erro ao salvar cliente.");
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const handleRefresh = () => {
    fetchCustomers();
    setSnackbarMessage("Lista de clientes atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const statusOptions = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    BLOCKED: "Bloqueado",
    SUSPENDED: "Suspenso",
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "name",
      headerName: "Nome",
      width: 200,
    },
    {
      field: "cpf",
      headerName: "CPF",
      width: 175,
    },
    {
      field: "cnpj",
      headerName: "CNPJ",
      width: 175,
    },
    {
      field: "email",
      headerName: "E-mail",
      width: 200
    },
    {
      field: "phone",
      headerName: "Telefone",
      width: 150
    },
    {
      field: "mobile",
      headerName: "Celular",
      width: 150
    },
    {
      field: "addressInfo",
      headerName: "Endereço",
      width: 250,
      valueGetter: (params) =>
        `${params.row.address || ''}, ${params.row.number || ''} - ${params.row.neighborhood || ''}`
    },
    {
      field: "cityState",
      headerName: "Cidade/UF",
      width: 150,
      valueGetter: (params) => `${params.row.city || ''}/${params.row.state || ''}`
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => statusOptions[params.value] || params.value,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div>
          <Tooltip title="Editar">
            <Button onClick={() => handleClickOpen(params.row)}>
              <EditIcon />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Box
      sx={{
        p: "20px",
        bgcolor: "background.paper",
        borderRadius: "8px",
        width: "95%"
      }}
    >
      <div
        style={{
          height: 400,
          width: "100%",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: DataGridToolbar }}
          sx={{
            bgcolor: 'background.variant'
          }}
          slotProps={{ toolbar: { onReload: handleRefresh } }}
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          Editar Cliente
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Nome Completo"
                fullWidth
                margin="normal"
                value={selectedCustomer?.name || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    name: e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="E-mail"
                fullWidth
                margin="normal"
                value={selectedCustomer?.email || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    email: e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputMask
                mask="(99) 9999-9999"
                value={selectedCustomer?.phone || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    phone: e.target.value,
                  })
                }
              >
                {() => (
                  <TextField
                    label="Telefone"
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputMask
                mask="999.999.999-99"
                value={selectedCustomer?.cpf || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    cpf: e.target.value,
                  })
                }
              >
                {() => (
                  <TextField
                    label="CPF"
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionOutlinedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputMask
                mask="99.999.999/9999-99"
                value={selectedCustomer?.cnpj || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    cnpj: e.target.value,
                  })
                }
              >
                {() => (
                  <TextField
                    label="CNPJ"
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionOutlinedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>
            </Grid>

            <Grid item xs={12} sm={3}>
              <InputMask
                mask="99999-999"
                value={selectedCustomer?.zipCode || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    zipCode: e.target.value,
                  })
                }
              >
                {() => (
                  <TextField
                    label="CEP"
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnOutlinedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>
            </Grid>

            <Grid item xs={12} sm={7}>
              <TextField
                label="Endereço"
                fullWidth
                margin="normal"
                value={selectedCustomer?.address || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    address: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <TextField
                label="Número"
                fullWidth
                margin="normal"
                value={selectedCustomer?.number || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    number: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Complemento"
                fullWidth
                margin="normal"
                value={selectedCustomer?.complement || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    complement: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Bairro"
                fullWidth
                margin="normal"
                value={selectedCustomer?.neighborhood || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    neighborhood: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                label="Cidade"
                fullWidth
                margin="normal"
                value={selectedCustomer?.city || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    city: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="UF"
                fullWidth
                margin="normal"
                value={selectedCustomer?.state || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    state: e.target.value,
                  })
                }
                inputProps={{ maxLength: 2 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InputMask
                mask="(99) 99999-9999"
                value={selectedCustomer?.mobile || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    mobile: e.target.value,
                  })
                }
              >
                {() => (
                  <TextField
                    label="Celular"
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="IE"
                fullWidth
                margin="normal"
                value={selectedCustomer?.ie || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    ie: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="IM"
                fullWidth
                margin="normal"
                value={selectedCustomer?.im || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    im: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedCustomer?.status || "ACTIVE"}
                  onChange={(e) =>
                    setSelectedCustomer({
                      ...selectedCustomer,
                      status: e.target.value,
                    })
                  }
                >
                  {Object.entries(statusOptions).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notas"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={selectedCustomer?.notes || ""}
                onChange={(e) =>
                  setSelectedCustomer({
                    ...selectedCustomer,
                    notes: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Customers;