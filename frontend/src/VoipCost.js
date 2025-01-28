import React, { useState} from 'react';
import {
  Container, Box, Card, CardContent, Button, Typography,
  TextField, MenuItem, Select, CircularProgress, Modal
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import './VoipCost.css'; 

const VoipCost = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [filteredData, setVoipCostData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formValues, setFormValues] = useState({
    date: '',
    totalCost: '',
    provider: '',
    center: ''
  });

  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    center: '',
    dialer: ''
  });

  const loggedInCenter = sessionStorage.getItem('centerName');

  const handleInputChange = (e) => {

//     const { name, value } = e.target;
//     if (name === 'totalCost') {
//     const regex = /^(\d+(\.\d{0,2})?)?$/; 
//     if (!regex.test(value)) {
//       return; 
//     }
//   }

    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value
    });
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    navigate('/');
};

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Submit the form
  const handleSubmit = async () => {
    if (!formValues.date || !formValues.totalCost || !formValues.provider || !formValues.center) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/voipcosts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formValues)
      });

      if (response.ok) {
        const newEntry = await response.json();
        setVoipCostData((prevData) => [...prevData, newEntry]);
        setFormValues({ date: '', label: '', totalCost: '', provider: '', center: '' });
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error submitting data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleFilterSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/voipcosts/filters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      if (response.ok) {
        const filteredData = await response.json();
        setVoipCostData(filteredData);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'date', headerName: 'Date', width: 150 },
    { field: 'totalCost', headerName: 'Total Cost', width: 150 },
    { field: 'provider', headerName: 'Dialer', width: 150 },
    { field: 'center', headerName: 'Center', width: 150 }
  ];

const convertToCSV = (arr) => {
    const array = [Object.keys(arr[0])].concat(arr);
    return array.map(it => {
        return Object.values(it).join(',');
    }).join('\n');
};

const downloadCSV = () => {
    const csv = convertToCSV(filteredData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'voip_cost_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

  return (
    <Container maxWidth="lg">
   <header className="voipcost-header" style={{ marginTop: '20px' }}>
                <h1>VoIP Costs Dashboard</h1>
                <div className="action-buttons">
                    <Button variant="contained" color="primary" onClick={handleOpenModal}>
                        Add Daily VoIP Cost
                    </Button>
                    <button className="logout-btn" onClick={handleLogout}>Logout 🔒</button>
                </div>
            </header>

         {/* Card for filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            VoIP Cost
          </Typography>
          <Typography variant="h6" gutterBottom>
            Filter
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="From Date"
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, minWidth: 120 }}
            />
            <TextField
              label="To Date"
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, minWidth: 120 }}
            />
            <Select
              label="Center"
              name="center"
              value={filters.center}
              onChange={handleChange}
              displayEmpty
              sx={{ flex: 1, minWidth: 120 }}
            >
              {loggedInCenter === 'both' && <MenuItem value="">Center</MenuItem>}
              {loggedInCenter === 'both' && <MenuItem value="Shark">Shark</MenuItem>}
              {loggedInCenter === 'both' && <MenuItem value="Fortune">Fortune</MenuItem>}
              {loggedInCenter === 'both' && <MenuItem value="Leadsinteractive">Leadsinteractive</MenuItem>}
              {loggedInCenter === 'Shark' && <MenuItem value="">Center</MenuItem>}
              {loggedInCenter === 'Shark' && <MenuItem value="Shark">Shark</MenuItem>}
              {loggedInCenter === 'Fortune' && <MenuItem value="">Center</MenuItem>}
              {loggedInCenter === 'Fortune' && <MenuItem value="Fortune">Fortune</MenuItem>}
            </Select>    
            <Select
              label="Dialer"
              name="dialer"
              value={filters.dialer}
              onChange={handleChange}
              displayEmpty
              sx={{ flex: 1, minWidth: 120 }}
            >
              {loggedInCenter === 'both' && <MenuItem value="">Dialer</MenuItem>}
              {loggedInCenter === 'both' && <MenuItem value="telcast">Telcast</MenuItem>}
              {loggedInCenter === 'both' && <MenuItem value="phdialer">Phdialer</MenuItem>}
              {loggedInCenter === 'both' && <MenuItem value="ccs">CCS</MenuItem>}
              {/* {loggedInCenter === 'both' && <MenuItem value="Both">Both</MenuItem>} */}
              {loggedInCenter === 'Shark' && <MenuItem value="">Dialer</MenuItem>}
              {loggedInCenter === 'Shark' && <MenuItem value="telcast">Telcast</MenuItem>}
              {loggedInCenter === 'Shark' && <MenuItem value="phdialer">Phdialer</MenuItem>}
              {/* {loggedInCenter === 'Shark' && <MenuItem value="Both">Both</MenuItem>} */}
              {loggedInCenter === 'Fortune' && <MenuItem value="">Dialer</MenuItem>}
              {loggedInCenter === 'Fortune' && <MenuItem value="telcast">Telcast</MenuItem>}
            </Select>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button variant="contained" color="primary" size="small" onClick={handleFilterSubmit}>Submit</Button>
              <Button variant="outlined" color="secondary" size="small" onClick={() => setFilters({ fromDate: '', toDate: '', center: '', dialer: '' })}>Reset</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>



      {/* Modal for adding new VoIP Cost */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6" gutterBottom>Add New VoIP Cost</Typography>
          <TextField
            label="Date"
            type="date"
            name="date"
            value={formValues.date}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Total Cost (USD)"
            name="totalCost"
            type="number"
            value={formValues.totalCost}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ mb: 2 }}
            inputProps={{ min: "0", step: "0.01" }} 
          />
          <Select
            label="Provider"
            name="provider"
            value={formValues.provider}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ mb: 2 }}
            displayEmpty
          >
            
            {loggedInCenter === 'both' && <MenuItem value="">Select Dialer</MenuItem>}
            {loggedInCenter === 'both' && <MenuItem value="phdialer">phdialer</MenuItem>}
            {loggedInCenter === 'both' && <MenuItem value="telcast">telcast</MenuItem>}
            {loggedInCenter === 'both' && <MenuItem value="ccs">CCS</MenuItem>}

            {loggedInCenter === 'Shark' && <MenuItem value="">Select Dialer</MenuItem>}
            {loggedInCenter === 'Shark' && <MenuItem value="telcast">telcast</MenuItem>}
            {loggedInCenter === 'Shark' && <MenuItem value="phdialer">phdialer</MenuItem>}
            
            {loggedInCenter === 'Fortune' && <MenuItem value="">Select Dialer</MenuItem>}
            {loggedInCenter === 'Fortune' && <MenuItem value="telcast">telcast</MenuItem>}

          </Select>
          <Select
            label="Center"
            name="center"
            value={formValues.center}
            onChange={handleInputChange}
            fullWidth
            required
            displayEmpty
          >
            {loggedInCenter === 'both' && <MenuItem value="">Select Center</MenuItem>}
            {loggedInCenter === 'both' && <MenuItem value="Shark">Shark</MenuItem>}
            {loggedInCenter === 'both' && <MenuItem value="Fortune">Fortune</MenuItem>}
            {loggedInCenter === 'both' && <MenuItem value="Leadsinteractive">Leadsinteractive</MenuItem>}

            {loggedInCenter === 'Shark' && <MenuItem value="Shark">Shark</MenuItem>}
            {loggedInCenter === 'Fortune' && <MenuItem value="Fortune">Fortune</MenuItem>}
          </Select>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
            <Button variant="outlined" color="secondary" onClick={handleCloseModal}>Cancel</Button>
          </Box>
        </Box>
      </Modal>

        {/* Loading Spinner */}
        {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ ml: 2 }}>please wait...</Typography>
                </Box>
            )}

              {/* Results Table */}
              {isSubmitted && !loading && filteredData.length > 0 && (
                <Card>
                    <CardContent>
                    <Button 
                            variant="contained" 
                            color="primary" 
                            style={{ marginTop: '5px', marginBottom: '15px' }} 
                            onClick={downloadCSV}>
                            Download CSV
                        </Button>
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={filteredData}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[10, 20, 50]}
                                checkboxSelection
                                disableSelectionOnClick
                                getRowId={(row) => row.date} 
                            />
                        </div>
                      
                    </CardContent>
                </Card>
            )}
    </Container>
  );
};

// Modal styling
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

export default VoipCost;
