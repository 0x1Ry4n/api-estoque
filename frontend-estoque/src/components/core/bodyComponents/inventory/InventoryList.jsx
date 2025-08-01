import { useEffect } from "react";
import {
  Button,
  Snackbar,
  Alert,
  Tooltip,
  Box
} from "@mui/material";
import {
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { DataGridToolbar } from "../../subComponents/DataGridToolbar";
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
        const products = useInventoryListStore.getState().products || [];
        const product = products.find((p) => p.id === params.row.productId);
        const unitPrice = product ? product.unitPrice : 0;
        return (unitPrice * params.row.quantity).toFixed(2);
      },
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (cellData) => (
        <Tooltip title="Excluir">
          <Button onClick={() => handleDelete([cellData.row])}>
            <DeleteIcon />
          </Button>
        </Tooltip>
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
      <div style={{ height: 400, width: "100%", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          sx={{
            bgcolor: 'background.variant'
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          slots={{ toolbar: DataGridToolbar }}
          slotProps={{ toolbar: { onReload: handleRefresh } }}
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
    </Box>
  );
};

export default Inventory;
