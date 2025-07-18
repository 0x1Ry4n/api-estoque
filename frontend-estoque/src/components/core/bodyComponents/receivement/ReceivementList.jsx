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
  Autocomplete,
  Box,
  Tooltip
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { addDays, format } from "date-fns";
import { fileExporters } from "../../../../utils/utils";
import { useReceivementListStore } from "./stores/useReceivementListStore";
import Swal from "sweetalert2";

const ReceivementList = () => {
  const {
    rows,
    pagination,
    products,
    suppliers,
    selectedReceivement,
    snackbar,
    setPagination,
    showSnackbar,
    closeSnackbar,
    fetchReceivements,
    fetchProductsAndSuppliers,
    saveReceivement,
    updateStatus,
    deleteReceivement,
    setSelectedReceivement,
    setOpen,
    open,
  } = useReceivementListStore();

  const receivementStatusMap = {
    PENDING: "Pendente",
    COMPLETED: "Completado",
    CANCELED: "Cancelado",
    RETURNED: "Retornado",
  };

  useEffect(() => {
    fetchProductsAndSuppliers();
    fetchReceivements(pagination.page, pagination.pageSize);
  }, []);

  const handleClickOpen = (receivement) => {
    setSelectedReceivement(receivement);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedReceivement(null);
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
      await deleteReceivement(ids);
    }
  };

  const handleSave = async () => {
    await saveReceivement();
    handleClose();
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
      await updateStatus(id, status);
    }
  };

  const handleRefresh = () => {
    fetchReceivements(pagination.page, pagination.pageSize);
    showSnackbar("Lista de recebimentos atualizada!", "info");
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
        <div>
          <Tooltip title="Editar Status">
            <Button
              onClick={() => handleStatusChange(cellData.row.id)}
              variant="outlined"
              size="small"
              color="primary"
              sx={{ mr: 1 }}
            >
              Status
            </Button>
          </Tooltip>
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

      <Dialog
        maxWidth="md"
        PaperProps={{
          sx: {
            width: '700px',
            maxWidth: '90vw',
          },
        }}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          Editar Recebimento
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={4} sx={{ mt: 2 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
              <TextField
                label="Descrição"
                variant="outlined"
                fullWidth
                margin="normal"
                value={selectedReceivement?.description || ""}
                onChange={(e) =>
                  setSelectedReceivement({
                    ...selectedReceivement,
                    description: e.target.value,
                  })
                }
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
                fullWidth
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
                fullWidth
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
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ReceivementList;