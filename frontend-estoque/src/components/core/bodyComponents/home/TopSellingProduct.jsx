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

export default function TopSellingProducts({ exits }) {
  const productMap = {};

  exits.forEach(exit => {
    const { productId, productName, unitPrice, totalPrice, quantity } = exit;

    if (productId && productName && unitPrice !== undefined && quantity !== undefined) {
      if (!productMap[productId]) {
        productMap[productId] = {
          name: productName,
          price: unitPrice,
          quantity: 0,
          amount: 0,
        };
      }

      productMap[productId].quantity += quantity;
      productMap[productId].amount += totalPrice;
    }
  });

  const topProducts = Object.values(productMap);

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
        Produtos com mais Saídas
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
                <TableCell>
                  {product.price !== undefined ? `$${product.price.toFixed(2)}` : "N/A"}
                </TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>
                  {product.amount !== undefined ? `$${product.amount.toFixed(2)}` : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
