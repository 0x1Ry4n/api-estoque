import React, { useState, useEffect } from "react";
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
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../../../api";
import Swal from "sweetalert2";
import { Controller, useForm } from "react-hook-form";
import { addDays, format } from 'date-fns';

const Products = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [open, setOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await api.get("/category");
      setCategories(response.data.content);
    };

    const fetchSuppliers = async () => {
      const response = await api.get("/supplier");
      setSuppliers(response.data.content);
    };

    fetchCategories();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      console.log(response.data.content);
      setRows(response.data.content);
    } catch (error) {
      console.error("Erro ao buscar produtos: ", error);
      setSnackbarMessage("Erro ao carregar produtos.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClickOpen = (product) => {
    setSelectedProduct(product);
    setOpen(true);
    setIsEditing(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setIsEditing(false);
  };

  const handleDetailOpen = async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      setDetailedProduct(response.data);
      setDetailDialogOpen(true);
    } catch (error) {
      setSnackbarMessage("Erro ao carregar detalhes do produto.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
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
        await api.delete(`/products/${ids[0]}`);
        setRows(rows.filter((row) => !ids.includes(row.id)));
        setSnackbarMessage("Produto deletado com sucesso!");
        setSnackbarSeverity("success");
      } catch (error) {
        console.log(error);
        setSnackbarMessage(
          `Erro ao deletar o produto: ${error.response?.data?.error || error.message
          }`
        );
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handleSave = async () => {
    try {
      const productToSave = {
        ...selectedProduct,
        price: selectedProduct.unitPrice,
      };

      if (isEditing) {
        await api.patch(`/products/${selectedProduct.id}`, productToSave);
        setRows(
          rows.map((row) =>
            row.id === selectedProduct.id ? productToSave : row
          )
        );
        setSnackbarMessage("Produto atualizado com sucesso!");
      } else {
        const newProduct = { id: rows.length + 1, ...productToSave };
        await api.post("/products", newProduct);
        setRows([...rows, newProduct]);
        setSnackbarMessage("Produto adicionado com sucesso!");
      }
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage(
        `Erro ao salvar o produto: ${error.response?.data?.error || error.message
        }`
      );
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const handleRefresh = () => {
    fetchProducts();
    setSnackbarMessage("Lista de produtos atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "Produto",
      width: 300,
      editable: true,
    },
    {
      field: "categoryName",
      headerName: "Categoria",
      width: 200,
      editable: false,
    },
    {
      field: "supplierNames",
      headerName: "Fornecedores",
      width: 200,
      editable: false,
      valueGetter: (params) => {
        return params.row.supplierNames?.join(", ") || "";
      },
    },
    {
      field: "description",
      headerName: "Descrição",
      width: 300,
      editable: true,
    },
    {
      field: "productCode",
      headerName: "Cod. Produto",
      width: 200,
      editable: true,
    },
    {
      field: "unitPrice",
      headerName: "Preço Unitário",
      width: 150,
      editable: true,
    },
    {
      field: "stockQuantity",
      headerName: "Quantidade em Estoque",
      width: 150,
      editable: false,
    },
    {
      field: "totalPrice",
      headerName: "Valor Total",
      width: 150,
      valueGetter: (params) => {
        const totalPrice = params.row.unitPrice * params.row.stockQuantity;
        return totalPrice.toFixed(2);
      },
    },
    {
      field: "expirationDate",
      headerName: "Data de Expiração",
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
      editable: true,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 200,
      renderCell: (cellData) => (
        <>
          <Button onClick={() => handleClickOpen(cellData.row)}>
            <EditIcon />
          </Button>
          <Button onClick={() => handleDelete([cellData.row.id])}>
            <DeleteIcon />
          </Button>
          <Button
            onClick={() => handleDetailOpen(cellData.row.id)}
            color="primary"
          >
            <VisibilityIcon />
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
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
        sx={{ mb: 2 }}
      >
        Atualizar Lista
      </Button>
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
        <DataGrid rows={rows} columns={columns} />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEditing ? "Editar Produto" : "Adicionar Produto"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do Produto"
            fullWidth
            margin="normal"
            value={selectedProduct?.name || ""}
            onChange={(e) =>
              setSelectedProduct({ ...selectedProduct, name: e.target.value })
            }
            InputProps={{ readOnly: true }}
            sx={{ mb: 3 }}
          />
          <Controller
            name="suppliers"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={suppliers || []}
                getOptionLabel={(option) => option.socialReason || ""}
                value={suppliers?.filter((sup) =>
                  selectedProduct?.supplierIds?.includes(sup.id)
                )}
                onChange={(_, value) => {
                  const ids = value.map((v) => v.id);
                  field.onChange(ids);
                  setSelectedProduct({ ...selectedProduct, supplierIds: ids });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Fornecedores" />
                )}
                sx={{ mb: 3 }}
              />
            )}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={categories || []}
                getOptionLabel={(option) => option.name || ""}
                value={
                  categories?.find(
                    (cat) => cat.id === selectedProduct?.categoryId
                  ) || null
                }
                onChange={(_, value) => {
                  field.onChange(value ? value.id : "");
                  setSelectedProduct({
                    ...selectedProduct,
                    categoryId: value?.id,
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Categoria" />
                )}
              />
            )}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Descrição"
            fullWidth
            margin="normal"
            value={selectedProduct?.description || ""}
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                description: e.target.value,
              })
            }
            sx={{ mb: 3 }}
          />
          <TextField
            label="Preço Unitário"
            fullWidth
            type="number"
            margin="normal"
            value={selectedProduct?.unitPrice || ""}
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                unitPrice: parseFloat(e.target.value),
              })
            }
            sx={{ mb: 3 }}
          />
          <TextField
            label="Data de Expiração"
            type="date"
            variant="outlined"
            fullWidth
            margin="normal"
            value={
              selectedProduct?.expirationDate
                ? selectedProduct.expirationDate.split("T")[0]
                : ""
            }
            onChange={(e) =>
              setSelectedProduct({
                ...selectedProduct,
                expirationDate: e.target.value,
              })
            }
            InputLabelProps={{
              shrink: true
            }}
            sx={{ mb: 3 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      >
        <DialogTitle>Detalhes do Produto</DialogTitle>
        <DialogContent>
          {detailedProduct && (
            <div>
              <p>
                <strong>ID:</strong> {detailedProduct.id}
              </p>
              <p>
                <strong>Nome:</strong> {detailedProduct.name}
              </p>
              <p>
                <strong>Descrição:</strong> {detailedProduct.description}
              </p>
              <p>
                <strong>Quantidade:</strong> {detailedProduct.stockQuantity}
              </p>
              <p>
                <strong>Preço unitário:</strong>{" "}
                {detailedProduct.unitPrice.toFixed(2)} BRL
              </p>
              <p>
                <strong>Valor Total:</strong>{" "}
                {(
                  detailedProduct.unitPrice * detailedProduct.stockQuantity
                ).toFixed(2)}{" "}
                BRL
              </p>
              <p>
                <strong>Data de Expiração:</strong>{" "}
                {detailedProduct.expirationDate}
              </p>
              <p>
                <strong>Categoria:</strong> {detailedProduct.category?.name}
              </p>
              <hr />
              <h3>Inventário</h3>
              {detailedProduct.inventory.map((item) => (
                <div key={item.id}>
                  <p>
                    <strong>ID do Item:</strong> {item.id}
                  </p>
                  <p>
                    <strong>Localização:</strong> {item.location}
                  </p>
                  <p>
                    <strong>Quantidade:</strong> {item.quantity}
                  </p>
                  <p>
                    <strong>Quantidade (recebimento):</strong>{" "}
                    {item.receivementQuantity}
                  </p>
                  <p>
                    <strong>Quantidade (saída):</strong> {item.exitQuantity}
                  </p>
                  <p>
                    <strong>Preço Unitário:</strong> {item.unitPrice.toFixed(2)}{" "}
                    BRL
                  </p>
                  <p>
                    <strong>Desconto:</strong> {item.discount} BRL
                  </p>
                  <hr />
                </div>
              ))}

              <h3>Fornecedores</h3>
              {detailedProduct.suppliers.map((supplier) => (
                <div key={supplier.id}>
                  <p>
                    <strong>ID do Fornecedor:</strong> {supplier.id}
                  </p>
                  <p>
                    <strong>Nome:</strong> {supplier.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {supplier.email}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {supplier.phone}
                  </p>
                  <p>
                    <strong>Data de Criação:</strong>{" "}
                    {new Date(supplier.createdAt).toLocaleString()}
                  </p>
                  <hr />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Fechar</Button>
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
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Products;
