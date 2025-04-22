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
    const goToRetellDisconnetCall = () => {
        navigate('/RetellDisconnectedCall'); 
    };
    const goToRetellDIDConnets = () => {
        navigate('/RetellDIDConnects'); 
    };
    const goToRetellCarrierConnets = () => {
        navigate('/RetellCarrierConnects'); 
    };
    const goToRetellHAPerAttempt = () => {
        navigate('/RetellHAPerAttempt'); 
    };
    const goToRetellCallCountEachLeads = () => {
        navigate('/RetellCallCountOnEachLeads'); 
    };
    const goToRetellLeadsDifferentDateDial = () => {
        navigate('/RetellDifferentDayLeadsDial'); 
    };
    const goToRetellAttemptCountForTransfer = () => {
        navigate('/RetellAttemptCountForTransfer'); 
    };
    const goToRetellTransferInEachAttempt = () => {
        navigate('/RetellTransferInEachAttempt'); 
    };
    const goToRetellHAperLineType = () => {
        navigate('/RetellHAperLineType'); 
    };
    const goToTwillioRecordings = () => {
        navigate('/TwillioRecordings'); 
    };


    return (
        <div className="session-selection-container">
            <h1>Select Section</h1>
            <div className="card-container">
                {/* <div className="card" onClick={goToDashboard}>
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
                </div> */}

                {role !== 'adminretell' && (
    <>
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
    </>
)}



  {/* Conditionally Render Client Posting Section */}
                {(role === 'QC' || 'adminretell' && centerName === 'both') && (
                    <div className="card restricted-card" onClick={goToClientPostingRetell}>
                        <h2>ONLY FOR CARLOS: Client Posting</h2>
                        <p>Disclaimer: ONLY FOR CARLOS and his QC Team. You can post leads to the client after verification, like listening to recordings, etc.</p>
                    </div>
                )}

                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToRetellCallLogs}>
                        <h2>Retell Call logs Analysis</h2>
                        <p>We can get here every sort of detail of dialing from Retell as per requirement, either cost, HA, Disconnection reason, Latency, etc</p>
                    </div>
                )}

                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToRetellDisconnetCall}>
                        <h2>Disconnects Numbers</h2>
                        <p>Retell- check disconnect number to analyse, these are failed even after multiple attempts</p>
                    </div>
                )}
                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToRetellDIDConnets}>
                        <h2>DID Connects Rate</h2>
                        <p>Retell- For Each DID Connects Rate, Human Answer, Machine and Total, to analyse DIDs</p>
                    </div>
                )}
                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToRetellCarrierConnets}>
                        <h2>Carrier Connects Rate</h2>
                        <p>Retell- Carrier Connects Rate analysis, which telephonic is giving us good Human Answer</p>
                    </div>
                )}
                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToRetellHAPerAttempt}>
                        <h2>Human Answer Per Attempts</h2>
                        <p>Retell- Human Answer Per Attempts Report --Note: 0 defines, 1st attempt--</p>
                    </div>
                )}
                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToRetellCallCountEachLeads}>
                        <h2>Each number attempt count per day</h2>
                        <p>Retell- Each number attempt count per day and timestamp with other details</p>
                    </div>
                )}
                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToRetellLeadsDifferentDateDial}>
                        <h2>Leads Dialed of different days</h2>
                        <p>Retell- Each day we dialed the leads of same day and also the older days, from this report we can get the count of leads which belongs which date</p>
                    </div>
                )}
                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToRetellAttemptCountForTransfer}>
                        <h2>Attempt Count for transfer</h2>
                        <p>Retell- By this, we can see how many attempt goes for make that transfer and that lead belong from which date</p>
                    </div>
                )}
                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToRetellTransferInEachAttempt}>
                        <h2>Transfer per attempt wise</h2>
                        <p>Retell- We can see, in each attempt how many transfer we get, date wise</p>
                    </div>
                )}
                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToRetellHAperLineType}>
                        <h2>Human Answer Per LineType</h2>
                        <p>Retell- We can see how much Human answer/performance we are getting as per classified by Line Type</p>
                    </div>
                )}
                {(role === 'adminretell' && centerName === 'both') && (
                    <div className="card" onClick={goToTwillioRecordings}>
                        <h2>Twillio Recordings</h2>
                        <p>Listen the full recording of calls, especially for transfer/paid</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SessionSelection;
