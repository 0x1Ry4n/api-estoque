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
  useMediaQuery,
  useTheme
} from "@mui/material";

export default function TopSellingProducts({ exits }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
        margin: { xs: 1, sm: 3 },
        bgcolor: "white",
        borderRadius: 2,
        padding: { xs: 1, sm: 3 },
        height: "95%",
        overflowX: "auto"
      }}
    >
      <Typography variant="h6" fontWeight={"bold"} sx={{ mx: { xs: 0, sm: 3 }, mb: 2 }}>
        Produtos com mais Saídas
      </Typography>
      <TableContainer>
        <Table size={isSmallScreen ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bolder", whiteSpace: "nowrap" }}>Nome Produto</TableCell>
              <TableCell sx={{ fontWeight: "bolder", whiteSpace: "nowrap" }}>Preço Unitário</TableCell>
              <TableCell sx={{ fontWeight: "bolder", whiteSpace: "nowrap" }}>Quantidade</TableCell>
              <TableCell sx={{ fontWeight: "bolder", whiteSpace: "nowrap" }}>Valor Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topProducts.map((product, id) => (
              <TableRow key={id}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{product.name}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {product.price !== undefined ? `$${product.price.toFixed(2)}` : "N/A"}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{product.quantity}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
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