import React, { useState } from 'react'; 
import ExitForm from './ExitForm'; 
import ExitList from './ExitList'; 
import { Box, Typography } from '@mui/material'; 

const ExitManagement = () => {
    const [rows, setRows] = useState([]); 

  const handleAddExit = (newExit) => {
    setRows((prevRows) => [...prevRows, newExit]); 
  };

  return (
    <Box sx={{ }}>
      <Typography variant="h4" sx={{ mb: 4, mt: 10, fontWeight: 'bold' }}>
        Gerenciamento de Saídas
      </Typography>
      <ExitForm onExitAdded={handleAddExit}  /> 
      <Box sx={{ mt: 3 }}> 
        <ExitList 
            rows={rows}
        /> 
      </Box>
    </Box>
  );
};

export default ExitManagement; 
