import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export default function TopSellingProducts({ orders }) {
  const productSales = {};

  orders.forEach(order => {
    const productId = order.inventory?.productId;
    const productName = order.inventory?.productName; // Usando optional chaining
    const price = order.inventory?.unitPrice; // Usando optional chaining
    const totalPrice = order.totalPrice;

    if (productId && productName && price !== undefined) { // Verificando se as propriedades estão definidas
      if (productSales[productId]) {
        productSales[productId].quantity += order.quantity;
        productSales[productId].amount += totalPrice;
      } else {
        productSales[productId] = {
          name: productName,
          price: price,
          quantity: order.quantity,
          amount: totalPrice,
        };
      }
    }
  });

  const topProducts = Object.values(productSales);

  return (
    <Box
      sx={{
        margin: 3,
        bgcolor: "white",
        borderRadius: 2,
        padding: 3,
        height: "95%",
      }}
    >
      <Typography variant="h6" fontWeight={"bold"} sx={{ mx: 3 }}>
        Produtos mais vendidos
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bolder" }}>Nome Produto</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }}>Preço Unitário</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }}>Quantidade</TableCell>
              <TableCell sx={{ fontWeight: "bolder" }}>Valor Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topProducts.map((product, id) => (
              <TableRow key={id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price ? product.price.toFixed(2) : 'N/A'}</TableCell> 
                <TableCell>{product.quantity}</TableCell>
                <TableCell>${product.amount ? product.amount.toFixed(2) : 'N/A'}</TableCell> 
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
