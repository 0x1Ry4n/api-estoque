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
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  PersonOutline,
  EmailOutlined,
  PhoneOutlined,
  BusinessOutlined,
  WebOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import { fileExporters } from "../../../../utils/utils";
import InputMask from "react-input-mask";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import api from "../../../../api";

const Suppliers = () => {
  const [open, setOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0
  })

  const communicationPreferenceMap = {
    EMAIL: "Email",
    PHONE: "Telefone",
    SMS: "SMS",
    ANY: "Qualquer um",
  };

  useEffect(() => {
    fetchSuppliers(pagination.page, pagination.pageSize);
  }, []);

  const fetchSuppliers = async (page, pageSize) => {
    try {
      const res = await api.get(`/supplier?page=${page}&size=${pageSize}`);
      setRows(res.data.content);
      setPagination({
        page: res.data.number,
        pageSize: res.data.size,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages
      })
    } catch (error) {
      console.error("Erro ao buscar fornecedores: ", error);
      setSnackbarMessage("Erro ao carregar fornecedores.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

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
      try {
        await api.delete(`/supplier/${ids[0]}`);
        setRows(rows.filter((row) => !ids.includes(row.id)));
        setSnackbarMessage("Fornecedor deletado com sucesso!");
        setSnackbarSeverity("success");
      } catch (error) {
        setSnackbarMessage(
          `Erro ao deletar o fornecedor: ${error.response?.data?.message || error.response?.data?.error || error.message
          }`
        );
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handleSave = async () => {
    const { socialReason, cnpj, communicationPreference } = selectedSupplier;

    if (!socialReason || !cnpj || !communicationPreference) {
      setSnackbarMessage("Por favor, preencha todos os campos obrigatórios!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEditing) {
        await api.patch(`/supplier/${selectedSupplier.id}`, selectedSupplier);
        setRows(
          rows.map((row) =>
            row.id === selectedSupplier.id ? selectedSupplier : row
          )
        );
        setSnackbarMessage("Fornecedor atualizado com sucesso!");
      } else {
        const response = await api.post("/supplier", selectedSupplier);
        setRows([...rows, response.data.content]);
        setSnackbarMessage("Fornecedor adicionado com sucesso!");
      }
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage(
        `Erro ao salvar fornecedor: ${error.response?.data?.error || error.message
        }`
      );
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const handleRefresh = () => {
    fetchSuppliers(pagination.page, pagination.pageSize);
    setSnackbarMessage("Lista de fornecedores atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
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
        communicationPreferenceMap[params.row.communicationPreference] ||
        "Desconhecido",
    },
    {
      field: "createdAt",
      headerName: "Data Criação",
      width: 150,
      valueGetter: (params) =>
        new Date(params.value).toLocaleDateString("pt-BR"),
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (cellData) => (
        <>
          <Button onClick={() => handleClickOpen(cellData.row)}>
            <EditIcon />
          </Button>
          <Button onClick={() => handleDelete([cellData.row.id])}>
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        width: "95%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Atualizar Lista
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            fileExporters.exportToExcel("Fornecedores", "fornecedores.xlsx", rows)
          }
        >
          Exportar Excel
        </Button>
      </div>
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
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          rowCount={pagination.totalElements}
          paginationMode="server"
          paginationModel={{
            page: pagination.page,
            pageSize: pagination.pageSize,
          }}
          onPaginationModelChange={({ page, pageSize }) => {
            const newPagination = { ...pagination, page, pageSize };
            setPagination(newPagination);
            fetchSuppliers(page, pageSize);
          }}
          pageSizeOptions={[20, 50, 100]}
        />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEditing ? "Editar Fornecedor" : "Adicionar Fornecedor"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Razão Social"
            fullWidth
            margin="normal"
            value={selectedSupplier?.socialReason || ""}
            onChange={(e) =>
              setSelectedSupplier({
                ...selectedSupplier,
                socialReason: e.target.value,
              })
            }
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessOutlined />
                </InputAdornment>
              ),
            }}
          />

          <InputMask
            mask="99.999.999/9999-99"
            value={selectedSupplier?.cnpj || ""}
            onChange={(e) =>
              setSelectedSupplier({ ...selectedSupplier, cnpj: e.target.value })
            }
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
                      <BusinessOutlined />
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
              setSelectedSupplier({
                ...selectedSupplier,
                email: e.target.value,
              })
            }
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined />
                </InputAdornment>
              ),
            }}
          />

          <InputMask
            mask="(99) 99999-9999"
            value={selectedSupplier?.phone || ""}
            onChange={(e) =>
              setSelectedSupplier({
                ...selectedSupplier,
                phone: e.target.value,
              })
            }
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
                      <PhoneOutlined />
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
              setSelectedSupplier({
                ...selectedSupplier,
                contactPerson: e.target.value,
              })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutline />
                </InputAdornment>
              ),
            }}
          />

          <InputMask
            mask="99999-999"
            value={selectedSupplier?.cep || ""}
            onChange={(e) =>
              setSelectedSupplier({ ...selectedSupplier, cep: e.target.value })
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
                      <LocationOnOutlined />
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
            onChange={(e) =>
              setSelectedSupplier({
                ...selectedSupplier,
                website: e.target.value,
              })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WebOutlined />
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
              setSelectedSupplier({
                ...selectedSupplier,
                communicationPreference: e.target.value,
              })
            }
            variant="outlined"
            required
          >
            <MenuItem value="EMAIL">Email</MenuItem>
            <MenuItem value="PHONE">Telefone</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            {isEditing ? "Salvar Alterações" : "Adicionar Fornecedor"}
          </Button>
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
    </div>
  );
};

export default Suppliers;