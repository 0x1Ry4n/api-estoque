import React, { useEffect } from "react";
import {
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { fileExporters } from "../../../../utils/utils";
import { useInventoryListStore } from "./stores/useInventoryListStore";
import Swal from "sweetalert2";

const Inventory = () => {
  const {
    rows,
    pagination,
    setPagination,
    fetchInventories,
    fetchProducts,
    deleteInventory,
    snackbar,
    showSnackbar,
    closeSnackbar,
    open,
    isEditing,
    selectedInventory,
    openModal,
    closeModal,
  } = useInventoryListStore();

  useEffect(() => {
    fetchInventories(pagination.page, pagination.pageSize);
    fetchProducts();
  }, []);

  const handleDelete = async (inventory) => {
    const confirmDelete = await Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter essa ação!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    });
    if (confirmDelete.isConfirmed) {
      await deleteInventory(inventory);
    }
  };

  const handleRefresh = () => {
    fetchInventories(pagination.page, pagination.pageSize);
    showSnackbar("Lista de inventário atualizada!", "info");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "productId", headerName: "Produto ID", width: 150 },
    {
      field: "productName",
      headerName: "Nome do Produto",
      width: 200,
      valueGetter: (params) => {
        const product = useInventoryListStore.getState().products?.find(
          (p) => p.id === params.row.productId
        );
        return product ? product.name : "Desconhecido";
      },
    },
    { field: "inventoryCode", headerName: "Código (Inventário)", width: 150 },
    {
      field: "receivementQuantity",
      headerName: "Quantidade (entrada)",
      width: 150,
      type: "number",
    },
    {
      field: "exitQuantity",
      headerName: "Quantidade (saída)",
      width: 150,
      type: "number",
    },
    { field: "quantity", headerName: "Quantidade", width: 150, type: "number" },
    {
      field: "unitPrice",
      headerName: "Preço Unitário",
      width: 150,
      valueGetter: (params) => {
        const product = useInventoryListStore.getState().products?.find(
          (p) => p.id === params.row.productId
        );
        return product ? product.unitPrice.toFixed(2) : "0.00";
      },
    },
    { field: "discount", headerName: "Desconto", width: 150, type: "number" },
    {
      field: "totalValue",
      headerName: "Valor Total (Lote)",
      width: 150,
      valueGetter: (params) => {
        const product = useInventoryListStore.getState().products?.find(
          (p) => p.id === params.row.productId
        );
        const unitPrice = product ? product.unitPrice : 0;
        return (unitPrice * params.row.quantity).toFixed(2);
      },
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (cellData) => (
        <Button onClick={() => handleDelete([cellData.row])}>
          <DeleteIcon />
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px", width: "95%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
          Atualizar Lista
        </Button>
        <Button variant="contained" color="primary" onClick={() => fileExporters.exportToExcel("Inventários", "inventarios.xlsx", rows)}>
          Exportar Excel
        </Button>
      </div>

      <div style={{ height: 400, width: "100%", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          rowCount={pagination.totalElements}
          paginationMode="server"
          paginationModel={{ page: pagination.page, pageSize: pagination.pageSize }}
          onPaginationModelChange={({ page, pageSize }) => {
            setPagination({ ...pagination, page, pageSize });
            fetchInventories(page, pageSize);
          }}
          pageSizeOptions={[20, 50, 100]}
        />
      </div>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Inventory;
