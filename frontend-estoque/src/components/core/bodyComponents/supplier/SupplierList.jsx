import { useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  MenuItem,
  InputAdornment,
  Box,
  Tooltip
} from "@mui/material";
import { DataGridToolbar } from "../../subComponents/DataGridToolbar";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  PersonOutline as PersonOutlineIcon,
  EmailOutlined as EmailOutlinedIcon,
  PhoneOutlined as PhoneOutlinedIcon,
  BusinessOutlined as BusinessOutlinedIcon,
  WebOutlined as WebOutlinedIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
} from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { useSupplierListStore } from "./stores/useSupplierListStore";
import InputMask from "react-input-mask";
import Swal from "sweetalert2";

const communicationPreferenceMap = {
  EMAIL: "Email",
  PHONE: "Telefone",
  SMS: "SMS",
  ANY: "Qualquer um",
};

const Suppliers = () => {
  const {
    rows,
    pagination,
    open,
    selectedSupplier,
    snackbar,
    setOpen,
    setIsEditing,
    setSelectedSupplier,
    setPagination,
    showSnackbar,
    closeSnackbar,
    fetchSuppliers,
    saveSupplier,
    deleteSupplier,
  } = useSupplierListStore();

  useEffect(() => {
    fetchSuppliers(pagination.page, pagination.pageSize);
  }, []);

  const handleClickOpen = (supplier) => {
    setSelectedSupplier(supplier || {});
    setOpen(true);
    setIsEditing(!!supplier);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSupplier(null);
    setIsEditing(false);
  };

  const handleDelete = async (ids) => {
    const confirmDelete = await Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter essa ação!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    });

    if (confirmDelete.isConfirmed) {
      await deleteSupplier(ids);
    }
  };

  const handleSave = async () => {
    await saveSupplier();
    handleClose();
  };

  const handleRefresh = () => {
    fetchSuppliers(pagination.page, pagination.pageSize);
    showSnackbar("Lista de fornecedores atualizada!", "info");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "socialReason", headerName: "Razão Social", width: 150 },
    { field: "cnpj", headerName: "CNPJ", width: 150 },
    { field: "email", headerName: "E-mail", width: 200 },
    { field: "contactPerson", headerName: "Pessoa de Contato", width: 350 },
    { field: "phone", headerName: "Telefone", width: 150 },
    { field: "cep", headerName: "CEP", width: 150 },
    { field: "website", headerName: "Website", width: 150 },
    {
      field: "communicationPreference",
      headerName: "Preferência Comunicação",
      width: 150,
      valueGetter: (params) =>
        communicationPreferenceMap[params.row.communicationPreference] || "Desconhecido",
    },
    {
      field: "createdAt",
      headerName: "Data Criação",
      width: 150,
      valueGetter: (params) => new Date(params.value).toLocaleDateString("pt-BR"),
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (cellData) => (
        <div>
          <Tooltip title="Editar">
            <Button onClick={() => handleClickOpen(cellData.row)}>
              <EditIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Excluir">
            <Button onClick={() => handleDelete([cellData.row.id])}>
              <DeleteIcon />
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
          sx={{
            bgcolor: 'background.variant'
          }}
          slots={{ toolbar: DataGridToolbar }}
          slotProps={{ toolbar: { onReload: handleRefresh } }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          rowCount={pagination.totalElements}
          paginationMode="server"
          paginationModel={{
            page: pagination.page,
            pageSize: pagination.pageSize,
          }}
          onPaginationModelChange={({ page, pageSize }) => {
            setPagination({ ...pagination, page, pageSize });
            fetchSuppliers(page, pageSize);
          }}
          pageSizeOptions={[20, 50, 100]}
        />
      </div>

      <Dialog
        maxWidth="md"
        PaperProps={{ sx: { width: "700px", maxWidth: "90vw" } }}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Editar Fornecedor</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={4} sx={{ mt: 2 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
              <TextField
                label="Razão Social"
                fullWidth
                margin="normal"
                value={selectedSupplier?.socialReason || ""}
                onChange={(e) =>
                  setSelectedSupplier({ ...selectedSupplier, socialReason: e.target.value })
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessOutlinedIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <InputMask
                mask="99.999.999/9999-99"
                value={selectedSupplier?.cnpj || ""}
                onChange={(e) => setSelectedSupplier({ ...selectedSupplier, cnpj: e.target.value })}
              >
                {() => (
                  <TextField
                    label="CNPJ"
                    fullWidth
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessOutlinedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              </InputMask>

              <TextField
                label="E-mail"
                fullWidth
                margin="normal"
                value={selectedSupplier?.email || ""}
                onChange={(e) =>
                  setSelectedSupplier({ ...selectedSupplier, email: e.target.value })
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <InputMask
                mask="(99) 99999-9999"
                value={selectedSupplier?.phone || ""}
                onChange={(e) => setSelectedSupplier({ ...selectedSupplier, phone: e.target.value })}
              >
                {() => (
                  <TextField
                    label="Telefone"
                    fullWidth
                    margin="normal"
                    required
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

              <TextField
                label="Pessoa de Contato"
                fullWidth
                margin="normal"
                value={selectedSupplier?.contactPerson || ""}
                onChange={(e) =>
                  setSelectedSupplier({ ...selectedSupplier, contactPerson: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <InputMask
                mask="99999-999"
                value={selectedSupplier?.cep || ""}
                onChange={(e) => setSelectedSupplier({ ...selectedSupplier, cep: e.target.value })}
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

              <TextField
                label="Website"
                fullWidth
                margin="normal"
                value={selectedSupplier?.website || ""}
                onChange={(e) => setSelectedSupplier({ ...selectedSupplier, website: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WebOutlinedIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 6 }}
              />

              <TextField
                select
                fullWidth
                label="Preferência de Comunicação"
                value={selectedSupplier?.communicationPreference || ""}
                onChange={(e) =>
                  setSelectedSupplier({ ...selectedSupplier, communicationPreference: e.target.value })
                }
                variant="outlined"
                required
              >
                <MenuItem value="EMAIL">Email</MenuItem>
                <MenuItem value="PHONE">Telefone</MenuItem>
              </TextField>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Suppliers;
