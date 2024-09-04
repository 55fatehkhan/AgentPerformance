import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RuntimePerformance.css';
import { Box, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const RuntimePerformance = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const [filters, setFilters] = useState({
        centerName: '',
        provider: '',
        fromDate: '',
        toDate: '',
    });

    const Loggedin_centerName = sessionStorage.getItem('centerName');

    const [data, setData] = useState([]);
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
        const { name, value } = e.target;
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
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/runtimeperformance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching runtime performance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilters({
            centerName: '',
            provider: '',
            fromDate: '',
            toDate: '',
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
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'runtime_performance_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        
        { field: 'listId', headerName: 'List ID', width: 150 },
        { field: 'file', headerName: 'File No.', width: 150 },
        { field: 'dataset', headerName: 'Dataset', width: 150 },
        { field: 'totalNumberDial', headerName: 'Total Numbers Dialed', width: 180 },
        { field: 'humanAnswerCount', headerName: 'Human Answer Count', width: 180 },
        { field: 'HAPercent', headerName: 'HA (%)', width: 150 },
        { field: 'SaleCount', headerName: 'Sale Count', width: 150 },
        { field: 'totalCountsOfFile', headerName: 'Total Counts of File', width: 180 },
        { field: 'centerName', headerName: 'Center Name', width: 180 },
        { field: 'provider', headerName: 'Dialer', width: 180 },
        { field: 'dialedAt', headerName: 'DialedAt', width: 180 }
    ];

    return (
        <div className="runtimeperformance-container">
            <header className="runtimeperformance-header">
                <h1>Runtime Performance Dashboard</h1>
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
                        <div className="filter-field">
    <label htmlFor="centerName">Center Name</label>
    <select
        id="centerName"
        name="centerName"
        value={filters.centerName}
        onChange={handleInputChange}
    >
                            {Loggedin_centerName === 'both' && <option value="">Select Center</option>}
                            {Loggedin_centerName === 'both' && <option value="SHARK">Shark</option>}
                            {Loggedin_centerName === 'both' && <option value="FORTUNE">Fortune</option>}

                            {Loggedin_centerName === 'SHARK' && <option value="">Select Center</option>}
                            {Loggedin_centerName === 'SHARK' && <option value="SHARK">Shark</option>}

                            {Loggedin_centerName === 'FORTUNE' && <option value="">Select Center</option>}
                            {Loggedin_centerName === 'FORTUNE' && <option value="FORTUNE">Fortune</option>}
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
                            {Loggedin_centerName === 'both' && <option value="Telcast">Telcast</option>}
                            {Loggedin_centerName === 'both' && <option value="Phdialer">Phdialer</option>}
                            {Loggedin_centerName === 'both' && <option value="Both">Both</option>}

                            {Loggedin_centerName === 'SHARK' && <option value="">Dialer</option>}
                            {Loggedin_centerName === 'SHARK' && <option value="Telcast">Telcast</option>}
                            {Loggedin_centerName === 'SHARK' && <option value="Phdialer">Phdialer</option>}
                            {Loggedin_centerName === 'SHARK' && <option value="Both">Both</option>}

                            {Loggedin_centerName === 'FORTUNE' && <option value="">Dialer</option>}
                            {Loggedin_centerName === 'FORTUNE' && <option value="Telcast">Telcast</option>}
    </select>
</div>

        
                    </div>
                    <div className="filter-actions">
                        <button type="submit" className="submit-btn">Submit</button>
                        <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
                    </div>
                </form>
            </div>

            <div className="runtimeperformance-content">
                {/* Loading Spinner */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ ml: 2 }}>please wait...</Typography>
                </Box>
            )}

            {isSubmitted && !loading && data.length > 0 && (
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
                            rows={data}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 20, 50]}
                            checkboxSelection
                            disableSelectionOnClick
                            getRowId={(row) => `${row.listId}-${row.humanAnswerCount}-${row.totalNumberDial}-${row.totalCountsOfFile}`}
                        />
                    </div>
                    </CardContent>
                    </Card>
            )}
            </div>
        </div>
    );
};

export default RuntimePerformance;
