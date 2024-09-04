import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SessionSelection.css';

const SessionSelection = () => {
    const navigate = useNavigate();

    const goToDashboard = () => {
        navigate('/Dashboard');
    };

    const goToFilePerformance = () => {
        navigate('/FilePerformance'); 
    };

    const goToRuntimeAnalysis = () => {
        navigate('/RuntimePerformance'); 
    };

    return (
        <div className="session-selection-container">
            <h1>Select Section</h1>
            <div className="card-container">
                <div className="card" onClick={goToDashboard}>
                    <h2>Agent Performance Section</h2>
                    <p>Analyze agent performance metrics and reports.</p>
                </div>
                <div className="card" onClick={goToFilePerformance}>
                    <h2>Files Performance Section</h2>
                    <p>Analyse and manage file performance data.</p>
                </div>
                <div className="card" onClick={goToRuntimeAnalysis}>
                    <h2>Runtime Analysis Section</h2>
                    <p>Analyse the files, how they perform on each run</p>
                </div>
            </div>
        </div>
    );
};

export default SessionSelection;
