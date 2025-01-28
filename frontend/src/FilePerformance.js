import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FilePerformance.css';
import { Box, Typography, CircularProgress, Card, CardContent, Button,  } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const FilePerformance = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        navigate('/');
    };
    // const handleLogout = async () => {
    //     try {
    //         const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/logout`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });

    //         const data = await response.json();

    //         if (data.success) {
    //             navigate('/'); 
    //         } else {
    //             alert('Failed to log out');
    //         }
    //     } catch (error) {
    //         console.error('Logout error:', error);
    //         alert('An error occurred during logout.');
    //     }
    // };

    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        dataset: '',
        center: '',
        dialer: '',
        datatype: '',
        campaign: ''
    });

    const Loggedin_centerName = sessionStorage.getItem('centerName');
    // const Loggedin_role = sessionStorage.getItem('role');

   // console.log(Loggedin_centerName, Loggedin_role);

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
        if (!filters.fromDate || !filters.toDate) {
            alert('Please select both From Date and To Date.');
            return;
        }

        // Calculate the difference in days between From Date and To Date
    const fromDate = new Date(filters.fromDate);
    const toDate = new Date(filters.toDate);
    const timeDifference = toDate.getTime() - fromDate.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);

    // Check if the gap is more than 7 days
    if (dayDifference > 7) {
        alert('Please choose a date range within 7 days.');
        return;
    }

        if (!filters.center) {
            alert('Please select Center');
            return;
        }   
        if (!filters.dialer || !filters.campaign) {
            alert('Please select Dialer and Campaign');
            return;
        }

        try {
            setLoading(true); // Start loading
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/filePerformance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            });
            const result = await response.json();
            setData(result);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error fetching data', error);
        }finally {
            setLoading(false); // End loading
        }
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
        link.setAttribute('download', 'file_performance_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { field: 'listId', headerName: 'List ID', width: 150 },
        { field: 'file', headerName: 'File', width: 150 },
        { field: 'dataset', headerName: 'Dataset', width: 150 },
        { field: 'phoneCount', headerName: 'Phone Count', width: 150 },
        { field: 'humanCount', headerName: 'Human Count', width: 150 },
        { field: 'nonHumanCount', headerName: 'Non-Human Count', width: 150 },
        { field: 'attemptsCount', headerName: 'Attempts Count', width: 150 },
        { field: 'paidCount', headerName: 'Paid Count', width: 150 },
        { field: 'HA', headerName: 'HA (%)', width: 150 },
        { field: 'NonHA', headerName: 'Non-HA (%)', width: 150 }
    ];

    return (
        <div className="fileperformance-container">
            <header className="fileperformance-header">
                <h1>File Performance Dashboard</h1>
                <div className="user-info">
                    <button className="logout-btn" onClick={handleLogout}>Logout 🔒</button>
                </div>
            </header>

            <div className="filter-section">
                <h3>Filters</h3>
                <div className="filter-row">
                    <div className="filter-field">
                        <label htmlFor="fromDate">From Date:</label>
                        <input type="date" id="fromDate" name="fromDate" value={filters.fromDate} onChange={handleChange} />
                    </div>
                    <div className="filter-field">
                        <label htmlFor="toDate">To Date:</label>
                        <input type="date" id="toDate" name="toDate" value={filters.toDate} onChange={handleChange} />
                    </div>
                    <div className="filter-field">
                        <label htmlFor="center">Center:</label>
                        <select name="center" id="center" value={filters.center} onChange={handleChange} >
                            {Loggedin_centerName === 'both' && <option value="">Center</option>}
                            {Loggedin_centerName === 'both' && <option value="Shark">Shark</option>}
                            {Loggedin_centerName === 'both' && <option value="Fortune">Fortune</option>}

                            {Loggedin_centerName === 'Shark' && <option value="">Center</option>}
                            {Loggedin_centerName === 'Shark' && <option value="Shark">Shark</option>}

                            {Loggedin_centerName === 'Fortune' && <option value="">Center</option>}
                            {Loggedin_centerName === 'Fortune' && <option value="Fortune">Fortune</option>}
                        </select>
                    </div>
                    <div className="filter-field">
                        <label htmlFor="dialer">Dialer:</label>
                        <select name="dialer" id="dialer" value={filters.dialer} onChange={handleChange}>
                        {Loggedin_centerName === 'both' && <option value="">Dialer</option>}
                            {Loggedin_centerName === 'both' && <option value="telcast">Telcast</option>}
                            {Loggedin_centerName === 'both' && <option value="phdialer">Phdialer</option>}
                            {Loggedin_centerName === 'both' && <option value="Both">Both</option>}

                            {Loggedin_centerName === 'Shark' && <option value="">Dialer</option>}
                            {Loggedin_centerName === 'Shark' && <option value="telcast">Telcast</option>}
                            {Loggedin_centerName === 'Shark' && <option value="phdialer">Phdialer</option>}
                            {Loggedin_centerName === 'Shark' && <option value="Both">Both</option>}

                            {Loggedin_centerName === 'Fortune' && <option value="">Dialer</option>}
                            {Loggedin_centerName === 'Fortune' && <option value="telcast">Telcast</option>}
                        </select>
                    </div>
                    <div className="filter-field">
                        <label htmlFor="campaign">Campaign:</label>
                        <select name="campaign" id="campaign" value={filters.campaign} onChange={handleChange}>
                            <option value="">Campaign</option>                           
                            <option value="Outbound">Outbound</option>
                            <option value="Inbound">Inbound</option>
                            <option value="Both">Both</option>
                        </select>
                    </div>
                    {/* Adding Dataset Filter */}
                <div className="filter-field">
                    <label htmlFor="dataset">Dataset:</label>
                    <select
                        name="dataset"
                        id="dataset"
                        value={filters.dataset}
                        onChange={handleChange}
                    >
                        <option value="">Dataset</option>
                        <option value="1">Dataset 1</option>
                        <option value="2">Dataset 2</option>
                        <option value="3">Dataset 3</option>
                    </select>
                </div>
                {/* Adding ListId Filter */}
                <div className="filter-field">
                    <label htmlFor="listId">List ID:</label>
                    <select
                        name="listId"
                        id="listId"
                        value={filters.listId}
                        onChange={handleChange}
                    >
                        <option value="">List ID</option>
                        <option value="Jared1">Jared1</option>
                        <option value="Jared2">Jared2</option>
                        <option value="Jared3">Jared3</option>
                        <option value="Jared4">Jared4</option>
                        <option value="Jared5">Jared5</option>
                        <option value="Jared6">Jared6</option>
                        <option value="Jared7">Jared7</option>
                        <option value="Jared8">Jared8</option>
                        <option value="Jared9">Jared9</option>
                        <option value="IQAutoInsurance">IQAutoInsurance</option>
                        <option value="ReverseMortgage">ReverseMortgage</option>
                        {/* <option value="AllJared">All Jared</option> */}
                        <option value="Danish">Danish</option>
                        {/* <option value="AutoInsuranceGold">AutoInsuranceGold</option> */}
                    </select>
                </div>
                {/* Adding File Number Filter */}
                {/* <div className="filter-field">
                    <label htmlFor="fileNumber">File Number:</label>
                    <select
                        name="fileNumber"
                        id="fileNumber"
                        value={filters.fileNumber}
                        onChange={handleChange}
                    >
                        <option value="">File Number</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="18">18</option>
                        <option value="19">19</option>
                    </select>
                </div> */}
                    <div className="filter-actions">
                        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
                        <button className="reset-btn" onClick={() => setFilters({ fromDate: '', toDate: '', dataset: '', center: '', dialer: '', datatype: '', campaign: '', dataset: '', fileNumber: '', listId: '' })}>Reset</button>
                    </div>
                </div>
            </div>


              {/* Loading Spinner */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ ml: 2 }}>Data is large, fetching, please wait...</Typography>
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
                    <div style={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={data}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 20, 50]}
                            checkboxSelection
                            disableSelectionOnClick
                            getRowId={(row) => `${row.listId}-${row.dataset}-${row.phoneCount}-${row.humanCount}`}
                        />
                    </div>
                    </CardContent>
                    </Card>
            )}
        </div>
    );
};

export default FilePerformance;
