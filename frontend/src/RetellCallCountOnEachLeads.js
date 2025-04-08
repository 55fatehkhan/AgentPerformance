import './RetellCallCountOnEachLeads.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const RetellCallCountOnEachLeads = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: ''
    });

    const Loggedin_centerName = sessionStorage.getItem('centerName');

    const [results, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (Loggedin_centerName) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                centerName: Loggedin_centerName
            }));
        }
    }, [Loggedin_centerName]);

    const handleInputChange = (e) => {
        const { name, options } = e.target;
        let value = [];
        if (e.target.multiple) {
            value = [...options].filter(option => option.selected).map(option => option.value);
        } else {
            value = e.target.value;
        }
        setFilters({
            ...filters,
            [name]: value,
        });
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setIsSubmitted(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/RetellCallCountOnLeads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching Retell Call Count on Each Leads data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilters({
            fromDate: '',
            toDate: ''
        });
        setData([]);
        setIsSubmitted(false);
    };
    

    const convertToCSV = (arr) => {
        if (arr.length === 0) return '';
        const array = [Object.keys(arr[0])].concat(arr);
        return array.map(it => Object.values(it).join(',')).join('\n');
    };

    const downloadCSV = () => {
        const csv = convertToCSV(results);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'retellCallCountOnEachLead_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { field: 'Phone Number', headerName: 'Phone', width: 200 },
        { field: 'First Name', headerName: 'FirstName', width: 150 },
        { field: 'Last Name', headerName: 'LastName', width: 150 },
        { field: 'Status', headerName: 'Status', width: 150 },
        { field: 'Campaign', headerName: 'Campaign', width: 150 },
        { field: 'CreatedAt', headerName: 'CreatedAt', width: 150 },
        { field: 'Total Calls', headerName: 'Attempt/TotalCallCount', width: 150 },
        { field: 'Call Attempt 1', headerName: 'Call Attempt 1', width: 150 },
        { field: 'Call Attempt 2', headerName: 'Call Attempt 2', width: 150 },
        { field: 'Call Attempt 3', headerName: 'Call Attempt 3', width: 150 },
        { field: 'Call Attempt 4', headerName: 'Call Attempt 4', width: 150 },
        { field: 'Call Attempt 5', headerName: 'Call Attempt 5', width: 150 },
        { field: 'Call Attempt 6', headerName: 'Call Attempt 6', width: 150 },
        { field: 'Call Attempt 7', headerName: 'Call Attempt 7', width: 150 },
        { field: 'Call Attempt 8', headerName: 'Call Attempt 8', width: 150 },
        { field: 'Call Attempt 9', headerName: 'Call Attempt 9', width: 150 },
        { field: 'Call Attempt 10', headerName: 'Call Attempt 10', width: 150 }
        
    ];

    return (
        <div className="retellCallCountLeads-container">
            <header className="retellCallCountLeads-header">
                <h1>Retell - Call Count on Each Leads Per day Report</h1>
                <div className="user-info">
                    <button className="logout-btn" onClick={handleLogout}>Logout 🔒</button>
                </div>
            </header>

            <div className="filter-section">
                <form onSubmit={handleSubmit} className="filter-form">
                    <div className="filter-row">
                        <div className="filter-field">
                            <label htmlFor="fromDate">From Date</label>
                            <input
                                type="date"
                                id="fromDate"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="filter-field">
                            <label htmlFor="toDate">To Date</label>
                            <input
                                type="date"
                                id="toDate"
                                name="toDate"
                                value={filters.toDate}
                                onChange={handleInputChange}
                            />
                        </div>

                    </div>
                    <div className="filter-actions">
                        <button type="submit" className="submit-btn">Submit</button>
                        <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
                    </div>
                </form>
            </div>

            <div className="retellCallCountLeads-content">
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ ml: 2 }}>Please wait...</Typography>
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
                                    getRowId={(row) => `${row.CreatedAt}-${row.Campaign}-${row.Status}`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default RetellCallCountOnEachLeads;
