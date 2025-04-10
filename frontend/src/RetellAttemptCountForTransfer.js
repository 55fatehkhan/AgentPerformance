import './RetellAttemptCountForTransfer.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const RetellAttemptCountForTransfer = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const [filters, setFilters] = useState({
        call_disposition: '',
        disconnect_reason: ''
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
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/RetellAttemptCount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters),
            });

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching Retell Attempt Count data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilters({
            call_disposition: [],
            disconnect_reason: []
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
        link.setAttribute('download', 'retellAttemptCount_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { field: 'phone', headerName: 'Phone', width: 200 },
        { field: 'attempbeforeXFER', headerName: 'AttemptCount', width: 150 },
        { field: 'createdAt', headerName: 'LeadsReceiveDate', width: 150 }
    ];

    return (
        <div className="retellAttemptCount-container">
            <header className="retellAttemptCount-header">
                <h1>Retell- Attempt Count and Leads belong from which date</h1>
                <div className="user-info">
                    <button className="logout-btn" onClick={handleLogout}>Logout 🔒</button>
                </div>
            </header>

            <div className="filter-section">
                <form onSubmit={handleSubmit} className="filter-form">
                    <div className="filter-row">
                   
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
                    </div>
                    <div className="filter-actions">
                        <button type="submit" className="submit-btn">Submit</button>
                        <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
                    </div>
                </form>
            </div>

            <div className="retellAttemptCount-content">
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
                                    getRowId={(row) => `${row.createdAt}-${row.phone}-${row.attempbeforeXFER}`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default RetellAttemptCountForTransfer;
