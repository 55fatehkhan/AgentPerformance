import './TwillioRecordings.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, TextField, Card, CardContent, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const TwilioRecording = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [recordingData, setRecordingData] = useState(null);

    // Handle phone number input change
    const handleInputChange = (e) => {
        setPhone(e.target.value);
    };

    // Handle form submission to get recording
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/twilioRecording`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone }),
            });

            const result = await response.json();
            setRecordingData(result);
        } catch (error) {
            console.error('Error fetching Twilio recording:', error);
        } finally {
            setLoading(false);
        }
    };

   
    return (
        <div className="twilioRecording-container">
            <header className="twilioRecording-header">
                <h1>Twilio Recording</h1>
            </header>

            <div className="twilioRecording-content">
                <form onSubmit={handleSubmit} className="phone-form">
                    <div className="phone-input">
                        <TextField
                            label="Enter 10 Digit Phone Number"
                            variant="outlined"
                            value={phone}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            inputProps={{ maxLength: 10 }}
                        />
                    </div>

                    <div className="submit-button">
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Get Recording'}
                        </Button>
                    </div>
                </form>

                {recordingData && (
                    <div className="recording-result">
                        <h3>Recording Data:</h3>
                        <pre>{JSON.stringify(recordingData, null, 2)}</pre>

                        {/* Displaying the clickable link */}
                        {recordingData.mediaUrl && (
                            <div>
                                <Typography variant="body1" component="p">
                                    <a href={recordingData.mediaUrl} target="_blank" rel="noopener noreferrer">
                                        Click here to listen to the recording
                                    </a>
                                </Typography>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TwilioRecording;