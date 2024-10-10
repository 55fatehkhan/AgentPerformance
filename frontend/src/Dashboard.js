import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Container, Box, Card, CardContent, Button, Typography, TextField, MenuItem, Select, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    // const location = useLocation();
    // const { username, role, center} = location.state || {};

    const handleLogout = () => {
        navigate('/');
    };

    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        center: '',
        dialer: '',
        campaign: ''
    });

    const Loggedin_centerName = sessionStorage.getItem('centerName');

    const [data, setData] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        if (Loggedin_centerName) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                center: Loggedin_centerName
            }));
        }
    }, [Loggedin_centerName]);

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        if (!filters.toDate || !filters.fromDate) {
            alert('Please select both To Date and From Date.');
            return;
        }
        if (!filters.center) {
            alert('Please select Center');
            return;
        }
        if (!filters.campaign) {
            alert('Please select Campaign');
            return;
        }

        // Format dates to YYYY-MM-DD
        const formattedFromDate = filters.fromDate;
        const formattedToDate = filters.toDate;

        try {
            setLoading(true); // Start loading
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/agentPerformance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fromDate: formattedFromDate,
                    toDate: formattedToDate,
                    center: filters.center || null,
                    dialer: filters.dialer || null,
                    campaign: filters.campaign || null
                })
            });
            const result = await response.json();
            setData(result);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false); // End loading
        }
    };

    const columns = [
        { field: '_id', headerName: 'Agent Name', width: 150 },
        { field: 'Human', headerName: 'Human', width: 150 },
        { field: 'Machine', headerName: 'Machine', width: 150 },
        { field: 'GrandTotal', headerName: 'Grand Total', width: 150 },
        { field: 'Human Answer%', headerName: 'Human Answer%', width: 150 },
        { field: 'TotalAttempts', headerName: 'Total Attempts', width: 150 },
        { field: 'TotalPaid', headerName: 'Total Paid', width: 150 },
        { field: 'No of Calls Per Paid', headerName: 'No of Calls Per Paid', width: 200 },
        { field: 'Total Calls per Attempts', headerName: 'No of Calls per Attempts', width: 200 },
        { field: 'totalDurationSeconds', headerName: 'TotalDuration(sec)', width: 200 },
        { field: 'totalDurationMinutes', headerName: 'TotalDuration(mint)', width: 200 },
        { field: 'HumanAnswerPercentageOutofTotalHA', headerName: 'HA% out of Total HA', width: 200 },
        { field: 'totalHumanAnswers', headerName: 'TotalHumanAnswer(selected timeframe)', width: 200 },
        { field: 'totalVoipCost', headerName: 'TotalVoipCost', width: 150 },
        { field: 'allocatedCost', headerName: 'Cost/Agent(Allocated)', width: 150 }
    ]; 

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
        link.setAttribute('download', 'agent_performance_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // console.log("Role:", role);
    // console.log("Center:", center);

    return (
        <Container maxWidth="lg">
            <header className="agentperformance-header" style={{ marginTop: '20px' }}>
                <h1>Agent Performance Dashboard</h1>
                <div className="user-info">
                    <button className="logout-btn" onClick={handleLogout}>Logout 🔒</button>
                </div>
            </header>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                <Typography variant="h6" gutterBottom>
                        Agent Performance
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
                {Loggedin_centerName === 'both' && <MenuItem value="">Center</MenuItem>}
                {Loggedin_centerName === 'both' && <MenuItem value="Shark">Shark</MenuItem>}
                {Loggedin_centerName === 'both' && <MenuItem value="Fortune">Fortune</MenuItem>}

                {Loggedin_centerName === 'Shark' && <MenuItem value="">Center</MenuItem>}
                {Loggedin_centerName === 'Shark' && <MenuItem value="Shark">Shark</MenuItem>}

                {Loggedin_centerName === 'Fortune' && <MenuItem value="">Center</MenuItem>}
                {Loggedin_centerName === 'Fortune' && <MenuItem value="Fortune">Fortune</MenuItem>}
                        </Select>    
                        
                        <Select
                            label="Dialer"
                            name="dialer"
                            value={filters.dialer}
                            onChange={handleChange}
                            displayEmpty
                            sx={{ flex: 1, minWidth: 120 }}
                        >
                {Loggedin_centerName === 'both' && <MenuItem value="">Dialer</MenuItem>}
                {Loggedin_centerName === 'both' && <MenuItem value="telcast">Telcast</MenuItem>}
                {Loggedin_centerName === 'both' && <MenuItem value="phdialer">Phdialer</MenuItem>}
                {Loggedin_centerName === 'both' && <MenuItem value="Both">Both</MenuItem>} 

                {Loggedin_centerName === 'Shark' && <MenuItem value="">Dialer</MenuItem>}
                {Loggedin_centerName === 'Shark' && <MenuItem value="telcast">Telcast</MenuItem>}
                {Loggedin_centerName === 'Shark' && <MenuItem value="phdialer">Phdialer</MenuItem>}
                {Loggedin_centerName === 'Shark' && <MenuItem value="Both">Both</MenuItem>}

                {Loggedin_centerName === 'Fortune' && <MenuItem value="">Dialer</MenuItem>}
                {Loggedin_centerName === 'Fortune' && <MenuItem value="telcast">Telcast</MenuItem>}
                        </Select>
                        <Select
                            label="Campaign"
                            name="campaign"
                            value={filters.campaign}
                            onChange={handleChange}
                            required
                            displayEmpty
                            sx={{ flex: 1, minWidth: 120 }}
                        >
                            <MenuItem value="">Campaign</MenuItem>
                            <MenuItem value="Inbound">Inbound</MenuItem>
                            <MenuItem value="Outbound">Outbound</MenuItem>
                            <MenuItem value="Both">Both</MenuItem>
                        </Select>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Button variant="contained" color="primary" size="small" onClick={handleSubmit}>Submit</Button>
                            <Button variant="outlined" color="secondary" size="small" onClick={() => setFilters({ fromDate: '', toDate: '', center: '', dialer: '', campaign: '' })}>Reset</Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Loading Spinner */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ ml: 2 }}>Fetching data, please wait...</Typography>
                </Box>
            )}

            {/* Results Table */}
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
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={data}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[10, 20, 50]}
                                checkboxSelection
                                disableSelectionOnClick
                                getRowId={(row) => row._id} 
                            />
                        </div>
                      
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default Dashboard;
