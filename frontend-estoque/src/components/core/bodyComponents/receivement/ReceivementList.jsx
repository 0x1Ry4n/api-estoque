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
  Autocomplete,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { addDays, format } from "date-fns";
import { fileExporters } from "../../../../utils/utils";
import api from "../../../../api";
import Swal from "sweetalert2";

const ReceivementList = () => {
  const [open, setOpen] = useState(false);
  const [selectedReceivement, setSelectedReceivement] = useState(null);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
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

  const receivementStatusMap = {
    PENDING: "Pendente",
    COMPLETED: "Completado",
    CANCELED: "Cancelado",
    RETURNED: "Retornado",
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await api.get("/products");
      setProducts(response.data.content);
    };

    const fetchSuppliers = async () => {
      const response = await api.get("/supplier");
      setSuppliers(response.data.content);
    };

    fetchProducts();
    fetchSuppliers();
    fetchReceivements(pagination.page, pagination.pageSize);
  }, []);

  const fetchReceivements = async (page, pageSize) => {
    try {
      const res = await api.get(`/receivements?page=${page}&size=${pageSize}`);
      setRows(res.data.content);
      setPagination({
        page: res.data.number,
        pageSize: res.data.size,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages
      })
    } catch (error) {
      console.error("Erro ao buscar os recebimentos: ", error);
      setSnackbarMessage("Erro ao carregar os recebimentos.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClickOpen = (category) => {
    setSelectedReceivement(category);
    setOpen(true);
    setIsEditing(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedReceivement(null);
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
        await api.delete(`/receivements/${ids[0]}`);
        setSnackbarMessage("Recebimento deletado com sucesso!");
        setSnackbarSeverity("success");
        fetchReceivements();
      } catch (error) {
        setSnackbarMessage(
          `Erro ao deletar o recebimento: ${error.response?.data?.message || error.response?.data?.error || error.message}`
        );
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await api.patch(`/receivements/${selectedReceivement.id}`, {
          description: selectedReceivement.description,
          quantity: selectedReceivement.quantity,
          supplierId: selectedReceivement.supplierId,
          productId: selectedReceivement.productId,
          status: selectedReceivement.status,
          receivingDate: selectedReceivement.receivingDate,
        });
        setSnackbarMessage("Recebimento atualizado com sucesso!");
      } else {
        const newCategory = {
          description: selectedReceivement.description,
          quantity: selectedReceivement.quantity,
          supplierId: selectedReceivement.supplierId,
          productId: selectedReceivement.productId,
          receivingDate: selectedReceivement.receivingDate,
        };
        await api.post("/receivements", newCategory);
        setSnackbarMessage("Recebimento adicionado com sucesso!");
      }
      setSnackbarSeverity("success");
      fetchReceivements();
    } catch (error) {
      setSnackbarMessage(`
        Erro ao salvar o recebimento: ${error.response?.data?.message || error.response?.data?.error || error.message}
      `);
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const handleStatusChange = async (id) => {
    const { value: status } = await Swal.fire({
      title: "Alterar Status",
      input: "select",
      inputOptions: receivementStatusMap,
      inputPlaceholder: "Selecione um status",
      showCancelButton: true,
      confirmButtonText: "Editar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return "Você precisa selecionar um status!";
        }
      },
    });

    if (status) {
      try {
        await api.patch(`/receivements/${id}/status`, { status: status });
        setSnackbarMessage("Status atualizado com sucesso!");
        setSnackbarSeverity("success");
        fetchReceivements();
      } catch (error) {
        setSnackbarMessage(`Erro ao atualizar o status: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handleRefresh = () => {
    fetchReceivements(pagination.page, pagination.pageSize);
    setSnackbarMessage("Lista de recebimentos atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "description", headerName: "Descrição", width: 100 },
    { field: "productId", headerName: "ID Produto", width: 100 },
    { field: "supplierName", headerName: "Fornecedor", width: 200 },
    { field: "inventoryCode", headerName: "Código (Inventário)", width: 150 },
    { field: "quantity", headerName: "Quantidade", type: "number", width: 150 },
    {
      field: "totalPrice",
      headerName: "Valor Total",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status de Entrada",
      width: 150,
      valueGetter: (params) =>
        receivementStatusMap[params.row.status] || "Desconhecido",
    },
    {
      field: "receivingDate",
      headerName: "Data de Entrada",
      width: 150,
      type: "date",
      valueGetter: (params) => {
        const value = params.value;
        const date = value ? new Date(value) : null;
        return date && !isNaN(date) ? date : null;
      },
      valueFormatter: (params) => {
        const date = addDays(params.value, 1);
        return date && !isNaN(date) ? format(date, "dd/MM/yyyy") : "";
      },
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 200,
      renderCell: (cellData) => (
        <>
          <Button
            onClick={() => handleStatusChange(cellData.row.id)}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ mr: 1 }}
          >
            Status
          </Button>
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
            fileExporters.exportToExcel("Recebimentos", "recebimentos.xlsx", rows)
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
            fetchReceivements(page, pageSize);
          }}
          pageSizeOptions={[20, 50, 100]}
        />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEditing ? "Editar Recebimento" : "Adicionar Recebimento"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Descrição"
            variant="outlined"
            fullWidth
            margin="normal"
            value={selectedReceivement?.description || ""}
            onChange={(e) =>
              setSelectedReceivement({
                ...selectedReceivement,
                name: e.target.value,
              })
            }
            sx={{ mb: 3 }}
          />

          <TextField
            label="Quantidade"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={selectedReceivement?.quantity || ""}
            onChange={(e) =>
              setSelectedReceivement({
                ...selectedReceivement,
                quantity: e.target.value,
              })
            }
            sx={{ mb: 3 }}
          />

          <Autocomplete
            options={products || []}
            getOptionLabel={(option) => option.name || ""}
            value={
              products?.find(
                (prod) => prod.id === selectedReceivement?.productId
              ) || null
            }
            onChange={(_, value) => {
              setSelectedReceivement({
                ...selectedReceivement,
                productId: value?.id,
              });
            }}
            renderInput={(params) => <TextField {...params} label="Produto" />}
            sx={{ mb: 3 }}
          />

          <Autocomplete
            options={suppliers || []}
            getOptionLabel={(option) => option.socialReason || ""}
            value={
              suppliers?.find(
                (sup) => sup.id === selectedReceivement?.supplierId
              ) || null
            }
            onChange={(_, value) => {
              setSelectedReceivement({
                ...selectedReceivement,
                supplierId: value?.id,
              });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Fornecedor" />
            )}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Data de Recebimento"
            type="date"
            variant="outlined"
            fullWidth
            margin="normal"
            value={
              selectedReceivement?.receivingDate
                ? new Date(selectedReceivement.receivingDate)
                  .toISOString()
                  .split("T")[0]
                : ""
            }
            onChange={(e) =>
              setSelectedReceivement({
                ...selectedReceivement,
                receivingDate: e.target.value,
              })
            }
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 3 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>
            {isEditing ? "Confirmar" : "Adicionar"}
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

export default ReceivementList;