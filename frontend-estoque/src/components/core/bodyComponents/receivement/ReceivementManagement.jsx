import React, { useState } from 'react'; 
import ReceivementForm from './ReceivementForm'; 
import ReceivementList from './ReceivementList'; 
import { Box, Typography } from '@mui/material'; 

const ReceivementManagement = () => {
    const [rows, setRows] = useState([]); 

  const handleAddReceivement = (newReceivement) => {
    setRows((prevRows) => [...prevRows, newReceivement]); 
  };

  return (
    <Box sx={{ }}>
      <Typography variant="h4" sx={{ mb: 4, mt: 10, fontWeight: 'bold' }}>
        Gerenciamento de Recebimentos
      </Typography>
      <ReceivementForm onReceivementAdded={handleAddReceivement}  /> 
      <Box sx={{ mt: 3 }}> 
        <ReceivementList 
            rows={rows}
        /> 
      </Box>
    </Box>
  );
};

export default ReceivementManagement; 
