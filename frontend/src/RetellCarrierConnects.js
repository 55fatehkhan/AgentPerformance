import './RetellCarrierConnects.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { nanoid } from 'nanoid'


const RetellDisconnectedCall = () => {
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
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/RetellCarrierConnectsRate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching Retell Carrier Connects Rate data:', error);
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
        link.setAttribute('download', 'retellCarrierConnects_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { field: '_id', headerName: 'CarrierName', width: 200 },
        { field: 'Human', headerName: 'HumanCount', width: 150 },
        { field: 'Machine', headerName: 'MachineCount', width: 150 },
        { field: 'GrandTotal', headerName: 'GrandTotal', width: 150 },
        { field: 'Human Answer%', headerName: 'Human Answer%', width: 150 },
    ];

    return (
        <div className="retellCarrierCallReport-container">
            <header className="retellCarrierCallReport-header">
                <h1>Retell Carrier Connects Rate Report</h1>
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

            <div className="retellCarrierCallReport-content">
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
                                    // getRowId={(row, index) => 
                                    // row._id && row.Human && row.Machine && row.GrandTotal
                                    // ? `${row._id}-${row.Human}-${row.Machine}-${row.GrandTotal}`
                                    // : `row-${index}-${Math.random()}`
                                    // }

                                    // with nanoid to make unique rows
                                    getRowId={(row) => `${row._id}-${row.Human}-${row.Machine}-${row.GrandTotal}-${nanoid(5)}`}

                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default RetellDisconnectedCall;
