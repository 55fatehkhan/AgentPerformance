import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SessionSelection.css';

const SessionSelection = () => {
    const navigate = useNavigate();

    // Fetch values from session storage
    const [role, setRole] = useState('');
    const [centerName, setCenterName] = useState('');

    useEffect(() => {
        setRole(sessionStorage.getItem('role'));
        setCenterName(sessionStorage.getItem('centerName'));
    }, []);

    const goToDashboard = () => {
        navigate('/Dashboard');
    };

    const goToFilePerformance = () => {
        navigate('/FilePerformance'); 
    };

    const goToRuntimeAnalysis = () => {
        navigate('/RuntimePerformance'); 
    };
    
    const goToVoipCost = () => {
        navigate('/VoipCost'); 
    };
    const goToClientReport = () => {
        navigate('/ClientReport'); 
    };
    const goToThreeWayReport = () => {
        navigate('/ThreeWayReport'); 
    };
    const goToAgentSaleReport = () => {
        navigate('/AgentSaleReport'); 
    };
    const goToClientPostingRetell = () => {
        navigate('/RetellClientPosting'); 
    };
    const goToRetellCallLogs = () => {
        navigate('/RetellCallLogs'); 
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
                <div className="card" onClick={goToVoipCost}>
                    <h2>VoIP Cost</h2>
                    <p>Check the VoIP Cost</p>
                </div>
                <div className="card" onClick={goToClientReport}>
                    <h2>Client Report</h2>
                    <p>Client Report analysis and along with how our data performs for client, everything</p>
                </div>
                <div className="card" onClick={goToThreeWayReport}>
                    <h2>Threeway Report</h2>
                    <p>Threeway Report for analysis</p>
                </div>
                <div className="card" onClick={goToAgentSaleReport}>
                    <h2>Agents Wise Sale, Inbound Vs Outbound</h2>
                    <p>Agent Wise sale, Center wise or Campaign wise</p>
                </div>


  {/* Conditionally Render Client Posting Section */}
                {(role === 'QC' && centerName === 'both') && (
                    <div className="card restricted-card" onClick={goToClientPostingRetell}>
                        <h2>ONLY FOR CARLOS: Client Posting</h2>
                        <p>Disclaimer: ONLY FOR CARLOS and his QC Team. You can post leads to the client after verification, like listening to recordings, etc.</p>
                    </div>
                )}

                {(role === 'admin' && centerName === 'both') && (
                    <div className="card restricted-card" onClick={goToRetellCallLogs}>
                        <h2>ONLY FOR Internal Team: STL</h2>
                        <p>Retell Call logs, daily. We can get here every sort of detail of dialing as per required date</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SessionSelection;
