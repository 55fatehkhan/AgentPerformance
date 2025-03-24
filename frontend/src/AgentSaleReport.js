import './AgentSaleReport.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const AgentSaleReport = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const [filters, setFilters] = useState({
        centerName: '',
        provider: '',
        fromDate: '',
        toDate: '',
        campaign: ''
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
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/AgentSaleReport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching agent sale report data:', error);
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
            campaign: ''
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
        link.setAttribute('download', 'agentwiseSale_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { field: 'agent', headerName: 'Agent Name', width: 200 },
        { field: 'totalAttempts', headerName: 'Total Attempts', width: 150 },
        { field: 'totalPaid', headerName: 'Total Paid', width: 150 }
    ];

    return (
        <div className="agentSaleReport-container">
            <header className="agentSaleReport-header">
                <h1>Agent Wise Sale Analysis Dashboard</h1>
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
                            <label htmlFor="campaign">Campaign ID</label>
                            <select
                                id="campaign"
                                name="campaign"
                                value={filters.campaign}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Campaign</option>
                                <option value="Outbound">Outbound</option>
                                <option value="Inbound">Inbound</option>
                                <option value="Both">Both</option>
                            </select>
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
                                {Loggedin_centerName === 'both' && <option value="Shark">Shark</option>}
                                {Loggedin_centerName === 'both' && <option value="Fortune">Fortune</option>}
                                {Loggedin_centerName === 'Shark' && <option value="Shark">Shark</option>}
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
                                <option value="">Select Dialer</option>
                                <option value="telcast">Telcast</option>
                                <option value="phdialer">Phdialer</option>
                            </select>
                        </div>
                    </div>
                    <div className="filter-actions">
                        <button type="submit" className="submit-btn">Submit</button>
                        <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
                    </div>
                </form>
            </div>

            <div className="AgentSaleReport-content">
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
                                    getRowId={(row) => row.agent}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AgentSaleReport;
