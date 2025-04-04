import './RetellClientPosting.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Grid, Card, CardContent, Stack } from '@mui/material';
import axios from 'axios';

const RetellClientPosting = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        email: '',
        phone: '',
        searchPhoneNumber: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePhoneSearch = async () => {
        try {
            // Constructing the query URL with the phone number
            const url = new URL(`${process.env.REACT_APP_API_BACKEND}/search-by-phone`);
            url.searchParams.append('phone', formData.searchPhoneNumber);
    
            // Making the fetch call
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            // Parsing the JSON response
            const data = await response.json();
           // console.log("data; ", data);
    
            if (data.success) {
                // If the fetch was successful and data was found, update the formData state
                setFormData({
                    ...formData,
                    firstName: data.details.firstName,
                    lastName: data.details.lastName,
                    address: data.details.address,
                    city: data.details.city,
                    state: data.details.state,
                    postalCode: data.details.postalCode,
                    email: data.details.email,
                    phone: data.details.phone,
                });
            } else {
                // If no details were found
                alert('No details found for the entered phone number');
            }
        } catch (error) {
            // Log and any errors
            console.error('Failed to fetch details:', error);
            alert('Error fetching details');
        }
    };
    


    const handleSubmit = async (e) => {
        e.preventDefault();
       // console.log('Form Data Submitted:', formData);
        // Later, we'll send this data to the server via API call
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/post-to-client`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to post data.');
        }
    };
   

    const handleReset = () => {
        setFormData({
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            email: '',
            phone: '',
            searchPhoneNumber: ''
        });
    };

    return (
        <Container maxWidth="sm">
            <Card className="form-card">
                <CardContent>
                    <Typography variant="h5" className="form-title">
                        Client Posting Form
                    </Typography>


                    <TextField
                    fullWidth
                    label="Phone Number for Search"
                    name="searchPhoneNumber"
                    value={formData.searchPhoneNumber}
                    onChange={handleChange}
                    required
                />
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handlePhoneSearch}
                    sx={{ mb: 4 }}
                >
                    Search Details
                </Button>



                    <form onSubmit={handleSubmit} autocomplete="off">
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="State"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    fullWidth
                                    label="Postal Code"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Stack spacing={2} direction="row" justifyContent="center">
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        color="primary"
                                        className="submit-button"
                                    >
                                        Post to Client
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outlined" 
                                        color="secondary"
                                        onClick={handleReset}
                                        className="reset-button"
                                    >
                                        Clear
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default RetellClientPosting;
