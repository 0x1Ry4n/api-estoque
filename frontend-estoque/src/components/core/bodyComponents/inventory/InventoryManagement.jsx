import React, { useState } from "react";
import InventoryForm from "./InventoryForm";
import InventoryList from "./InventoryList"; 
import { Box, Typography } from "@mui/material";

const InventoryManagement = () => {
  const [rows, setRows] = useState([]);

  const handleAddInventoryItem = (newItem) => {
    setRows((prevRows) => [...prevRows, newItem]);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 4,
        mt: 10,
        p: 4,
        overflowX: "hidden",
        width: "100%",
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: "bold",
          }}
        >
          Gerenciamento de Inventário
        </Typography>
        <InventoryForm onInventoryAdded={handleAddInventoryItem} />
        <Box sx={{ mt: 3 }}>
          <InventoryList rows={rows} />
        </Box>
      </Box>
    </Box>
  );
};

export default InventoryManagement;
