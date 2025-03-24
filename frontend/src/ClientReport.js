import './ClientReport.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const ClientReport = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const [filters, setFilters] = useState({
        centerName: '',
        provider: '',
        Month: '',
        BiweeklyDate: ''
    });

    const Loggedin_centerName = sessionStorage.getItem('centerName');

    const [results, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (Loggedin_centerName) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                center: Loggedin_centerName
            }));
        }
    }, [Loggedin_centerName]);

    const handleInputChange = (e) => {
        const { name, value, multiple } = e.target;

        // Check if it's Month or BiweeklyDate and handle multiple selection
        if (name === 'Month' || name === 'BiweeklyDate') {
            const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
            setFilters({
                ...filters,
                [name]: selectedValues, // Store as an array
            });
        } else {
            // Handle single selection dropdowns
            setFilters({
                ...filters,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setIsSubmitted(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/clientReport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching client report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilters({
            centerName: '',
            provider: '',
            Month: '',
            BiweeklyDate: ''
        });
        setData([]);
        setIsSubmitted(false);
    };

    const convertToCSV = (arr) => {
        const array = [Object.keys(arr[0])].concat(arr);
        return array.map(it => {
            return Object.values(it).join(',');
        }).join('\n');
    };

    const downloadCSV = () => {
        const csv = convertToCSV(results);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'client_report_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        
        { field: 'phone', headerName: 'Phone', width: 150 },
        { field: 'status', headerName: 'Status', width: 150 },
        { field: 'Date', headerName: 'Date Range' , width: 150 },
        { field: 'Month', headerName: 'Month', width: 150 },
        { field: 'Outbound', headerName: 'Campaign', width: 150 },
        { field: 'Source', headerName: 'ListId', width: 150 },
        { field: 'Center', headerName: 'Center Name', width: 150 },
        { field: 'Duration', headerName: 'Duration', width: 150 },
        { field: 'campaign2', headerName: 'Provider', width: 150 },
        { field: 'Transfer Date', headerName: 'TransferDate', width: 150 },
        { field: 'SouceBackup/ListId', headerName: 'DataType', width: 150 }
    ];

    return (
        <div className="clientreport-container">
            <header className="clientreport-header">
                <h1>Client Report Analysis Dashboard</h1>
                <div className="user-info">
                    <button className="logout-btn" onClick={handleLogout}>Logout 🔒</button>
                </div>
            </header>

            <div className="filter-section">
                <form onSubmit={handleSubmit} className="filter-form">
                    <div className="filter-row">
                     
                    
                        <div className="filter-field">
    <label htmlFor="centerName">Center Name</label>
    <select
        id="centerName"
        name="centerName"
        value={filters.centerName}
        onChange={handleInputChange}
    >
                            {Loggedin_centerName === 'both' && <option value="">Select Center</option>}
                            {Loggedin_centerName === 'both' && <option value="Shark">Shark</option>}
                            {Loggedin_centerName === 'both' && <option value="Fortune">Fortune</option>}
                            {/* {Loggedin_centerName === 'both' && <option value="Both">Both</option>} */}

                            {Loggedin_centerName === 'Shark' && <option value="">Select Center</option>}
                            {Loggedin_centerName === 'Shark' && <option value="Shark">Shark</option>}

                            {Loggedin_centerName === 'Fortune' && <option value="">Select Center</option>}
                            {Loggedin_centerName === 'Fortune' && <option value="Fortune">Fortune</option>}
    </select>
</div>

<div className="filter-field">
    <label htmlFor="provider">Dialer</label>
    <select
        id="provider"
        name="provider"
        value={filters.provider}
        onChange={handleInputChange}
    >
                            {Loggedin_centerName === 'both' && <option value="">Dialer</option>}
                            {Loggedin_centerName === 'both' && <option value="telcast">Telcast</option>}
                            {Loggedin_centerName === 'both' && <option value="phdialer">Phdialer</option>}
                            {/* {Loggedin_centerName === 'both' && <option value="Both">Both</option>} */}

                            {Loggedin_centerName === 'Shark' && <option value="">Dialer</option>}
                            {Loggedin_centerName === 'Shark' && <option value="telcast">Telcast</option>}
                            {Loggedin_centerName === 'Shark' && <option value="phdialer">Phdialer</option>}
                            {/* {Loggedin_centerName === 'Shark' && <option value="Both">Both</option>} */}

                            {Loggedin_centerName === 'Fortune' && <option value="">Dialer</option>}
                            {Loggedin_centerName === 'Fortune' && <option value="telcast">Telcast</option>}
    </select>
</div>

</div>
<div className="filter-row">
  
  <div className="filter-field">
    <label htmlFor="Month">Month</label>
    <select
        id="Month"
        name="Month"
        value={filters.Month}
        onChange={handleInputChange}
        multiple // multiple values
    >
     <option value="">Choose</option>
     <option value="Mar-25">Mar-25</option>
     <option value="Feb-25">Feb-25</option>
     <option value="Jan-25">Jan-25</option>
     <option value="Dec-24">Dec-24</option>
     <option value="Nov-24">Nov-24</option>
     <option value="Oct-24">Oct-24</option>
     <option value="Sep-24">Sep-24</option>
     {/* <option value="Aug-24">Aug-24</option>
     <option value="Jul-24">Jul-24</option>
     <option value="Jun-24">Jun-24</option>
     <option value="May-24">May-24</option>
     <option value="Apr-24">Apr-24</option>
     <option value="Mar-24">Mar-24</option>
     <option value="Feb-24">Feb-24</option>
     <option value="Jan-24">Jan-24</option> */}

    </select>
</div>

<div className="filter-field">
    <label htmlFor="BiweeklyDate">Biweekly Date</label>
    <select
        id="BiweeklyDate"
        name="BiweeklyDate"
        value={filters.BiweeklyDate}
        onChange={handleInputChange}
        multiple
    >
     <option value="">Choose</option>
     <option value="Second_Half_March_2025">Second_Half_March_2025</option>
     <option value="First_Half_March_2025">First_Half_March_2025</option>
     <option value="Second_Half_Feb_2025">Second_Half_Feb_2025</option>
     <option value="First_Half_Feb_2025">First_Half_Feb_2025</option>
     <option value="Second_Half_Jan_2025">Second_Half_Jan_2025</option>
     <option value="First_Half_Jan_2025">First_Half_Jan_2025</option>
     <option value="Second_Half_Dec_2024">Second_Half_Dec_2024</option>
     <option value="First_Half_Dec_2024">First_Half_Dec_2024</option>
     <option value="Second_Half_Nov_2024">Second_Half_Nov_2024</option>
     <option value="First_Half_Nov_2024">First_Half_Nov_2024</option>
     <option value="Second_Half_Oct_2024">Second_Half_Oct_2024</option>
     <option value="First_Half_Oct_2024">First_Half_Oct_2024</option>
     <option value="Second_Half_Sept_2024">Second_Half_Sept_2024</option>
     <option value="First_Half_Sept_2024">First_Half_Sept_2024</option>
     {/* <option value="Second_Half_Aug_2024">Second_Half_Aug_2024</option>
     <option value="First_Half_Aug_2024">First_Half_Aug_2024</option>
     <option value="Second_Half_July_2024">Second_Half_July_2024</option>
     <option value="First_Half_July_2024">First_Half_July_2024</option>
     <option value="Second_Half_June_2024">Second_Half_June_2024</option>
     <option value="First_Half_June_2024">First_Half_June_2024</option>
     <option value="Second_Half_May_2024">Second_Half_May_2024</option>
     <option value="First_Half_May_2024">First_Half_May_2024</option> */}
    </select>
</div>

        
                    </div>
                    <div className="filter-actions">
                        <button type="submit" className="submit-btn">Submit</button>
                        <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
                    </div>
                </form>
            </div>

            <div className="clientreport-content">
                {/* Loading Spinner */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ ml: 2 }}>please wait...</Typography>
                </Box>
            )}

            {isSubmitted && !loading && results.length > 0 && (
                <Card>
                    <CardContent>
                    <Button 
                            variant="contained" 
                            color="primary" 
                            style={{ marginTop: '5px', marginBottom: '15px' }} 
                            onClick={downloadCSV}>
                            Download CSV
                        </Button>
                    <div style={{ height: 400, width: '100%', overflow: 'auto' }}>
                        <DataGrid
                            rows={results}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 20, 50]}
                            checkboxSelection
                            disableSelectionOnClick
                            getRowId={(row) => `${row.count}-${row.status}-${row.listId}-${row.centerName}-${row.dataset}`}
                            
                        />
                    </div>
                    </CardContent>
                    </Card>
                    
            )}
            </div>
        </div>
    );
};

export default ClientReport;
