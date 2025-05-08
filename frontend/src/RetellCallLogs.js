import './RetellCallLogs.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const RetellCallLogs = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const [filters, setFilters] = useState({
        direction: '',
        duration: '',
        call_disposition: '',
        disconnect_reason: '',
        fromDate: '',
        toDate: '',
        type: '',
        vendor: ''
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

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFilters({
    //         ...filters,
    //         [name]: value,
    //     });
    // };

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
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/RetellCallLogs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching Retell Call logs data:', error);
        } finally {
            setLoading(false);
        }
    };

    // const handleReset = () => {
    //     setFilters({

    //     direction: '',
    //     duration: '',
    //     call_disposition: '',
    //     disconnect_reason: '',
    //     fromDate: '',
    //     toDate: ''

    //     });
    //     setData([]);
    //     setIsSubmitted(false);
    // };

    const handleReset = () => {
        setFilters({
            direction: [],
            duration: '',
            call_disposition: [],
            disconnect_reason: [],
            fromDate: '',
            toDate: '',
            type: [],
            vendor: []
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
        link.setAttribute('download', 'retellCallLogs_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { field: 'DialedAt', headerName: 'DialedAt', width: 200 },
        { field: 'from', headerName: 'From', width: 150 },
        { field: 'to', headerName: 'To', width: 150 },
        { field: 'direction', headerName: 'Direction', width: 150 },
        { field: 'duration_seconds', headerName: 'Duration(s)', width: 150 },
        { field: 'recording_url', headerName: 'Recording', width: 150 },
        { field: 'disconnect_reason', headerName: 'DisconnectReason', width: 150 },
        { field: 'call_cost', headerName: 'CallCost', width: 150 },
       // { field: 'call_id', headerName: 'CallId', width: 150 },
        { field: 'call_disposition', headerName: 'Disposition', width: 150 },
        { field: 'LeadsGetsDateTime', headerName: 'LeadsGetsDateTime', width: 150 },
        { field: 'latency', headerName: 'Latency', width: 150 },
        { field: 'vendor', headerName: 'Vendor', width: 150 },
        { field: 'type', headerName: 'type', width: 150 },
    ];

    return (
        <div className="retellCallReport-container">
            <header className="retellCallReport-header">
                <h1>Retell Call Logs Analysis Dashboard</h1>
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
                            <label htmlFor="vendor">Vendor</label>
                            <select
                                multiple
                                id="vendor"
                                name="vendor"
                                value={filters.vendor}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Vendor</option>
                                <option value="shift44">shift44</option>
                                <option value="shift44homeowners">shift44homeowners</option>
                                <option value="shift44offhours">shift44offhours</option>
                            
                            </select>
                        </div>


                        <div className="filter-field">
                            <label htmlFor="type">Type</label>
                            <select
                                multiple
                                id="type"
                                name="type"
                                value={filters.type}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Type</option>
                                <option value="rtl">RTL</option>
                                <option value="rtlHomeowners">RTLHomeowners</option>
                                <option value="rtlOffHours">RTLOffHours</option>
                            
                            </select>
                        </div>

                        <div className="filter-field">
                            <label htmlFor="direction">Direction</label>
                            <select
                                multiple
                                id="direction"
                                name="direction"
                                value={filters.direction}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Direction</option>
                                <option value="outbound">outbound</option>
                                <option value="inbound">inbound</option>
                                {/* <option value="Both">Both</option> */}
                            </select>
                        </div>

                        <div className="filter-field">
                            <label htmlFor="call_disposition">Disposition</label>
                            <select
                                multiple
                                id="call_disposition"
                                name="call_disposition"
                                value={filters.call_disposition}
                                onChange={handleInputChange}
                            >

                                <option value="">Disposition</option>
                                <option value="AA">AA</option>
                                <option value="ADC">ADC</option>
                                <option value="CALLBK">CALLBK</option>
                                <option value="DNC">DNC</option>
                                <option value="HU">HU</option>
                                <option value="NI">NI</option>
                                <option value="NA">NA</option>
                                <option value="NHO">NHO</option>
                                <option value="WN">WN</option>
                                <option value="XFER">XFER</option>
                                <option value="All">All</option>
                            </select>
                        </div>

                        <div className="filter-field">
                            <label htmlFor="disconnect_reason">Disconnect Reason</label>
                            <select
                                multiple
                                id="disconnect_reason"
                                name="disconnect_reason"
                                value={filters.disconnect_reason}
                                onChange={handleInputChange}
                            >

                                <option value="">Disconnect Reason</option>
                                <option value="voicemail_reached">voicemail_reached</option>
                                <option value="user_hangup">user_hangup</option>
                                <option value="inactivity">inactivity</option>
                                <option value="dial_no_answer">dial_no_answer</option>
                                <option value="dial_failed">dial_failed</option>
                                <option value="call_transfer">call_transfer</option>
                                <option value="agent_hangup">agent_hangup</option>
                            
                            </select>
                        </div>

                        <div className="filter-field">
                            <label htmlFor="duration">Duration</label>
                            <select
                                id="duration"
                                name="duration"
                                value={filters.duration}
                                onChange={handleInputChange}
                            >

                                <option value="">Duration</option>
                                <option value="10">Greater than 10 seconds</option>
                                <option value="30">Greater than 30 seconds</option>
                                <option value="50">Greater than 50 seconds</option>
                            
                            </select>
                        </div>


                      
                    </div>
                    <div className="filter-actions">
                        <button type="submit" className="submit-btn">Submit</button>
                        <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
                    </div>
                </form>
            </div>

            <div className="retellCallReport-content">
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
                                    getRowId={(row) => `${row.DialedAt}-${row.from}-${row.to}`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default RetellCallLogs;
