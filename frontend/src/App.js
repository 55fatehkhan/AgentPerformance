import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import SessionSelection from './SessionSelection';
import FilePerformance from './FilePerformance';
import RuntimePerformance from './RuntimePerformance';
import VoipCost from './VoipCost';
import ClientReport from './ClientReport';
import ThreeWayReport from './ThreeWayReport';
import AgentSaleReport from './AgentSaleReport';
import RetellClientPosting from './RetellClientPosting';
import RetellCallLogs from './RetellCallLogs';
import RetellDisconnectedCall from './RetellDisconnectedCall';
import RetellDIDConnects from './RetellDIDConnects';
import RetellCarrierConnects from './RetellCarrierConnects';
import RetellHAPerAttempt from './RetellHAPerAttempt';
import RetellCallCountOnEachLeads from './RetellCallCountOnEachLeads';
import RetellDifferentDayLeadsDial from './RetellDifferentDayLeadsDial';
import RetellAttemptCountForTransfer from './RetellAttemptCountForTransfer';
import RetellTransferInEachAttempt from './RetellTransferInEachAttempt';
import RetellHAperLineType from './RetellHAperLineType';
import TwillioRecordings from './TwillioRecordings';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/SessionSelection" element={<SessionSelection />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/FilePerformance" element={<FilePerformance />} /> 
                <Route path="/RuntimePerformance" element={<RuntimePerformance />} /> 
                <Route path="/VoipCost" element={<VoipCost />} /> 
                <Route path="/ClientReport" element={<ClientReport />} />
                <Route path="/ThreeWayReport" element={<ThreeWayReport />} />  
                <Route path="/AgentSaleReport" element={<AgentSaleReport />} />  
                <Route path="/RetellClientPosting" element={<RetellClientPosting />} /> 
                <Route path="/RetellCallLogs" element={<RetellCallLogs />} /> 
                <Route path="/RetellDisconnectedCall" element={<RetellDisconnectedCall />} /> 
                <Route path="/RetellDIDConnects" element={<RetellDIDConnects />} /> 
                <Route path="/RetellCarrierConnects" element={<RetellCarrierConnects />} /> 
                <Route path="/RetellHAPerAttempt" element={<RetellHAPerAttempt />} />
                <Route path="/RetellCallCountOnEachLeads" element={<RetellCallCountOnEachLeads />} />
                <Route path="/RetellDifferentDayLeadsDial" element={<RetellDifferentDayLeadsDial />} /> 
                <Route path="/RetellAttemptCountForTransfer" element={<RetellAttemptCountForTransfer />} />
                <Route path="/RetellTransferInEachAttempt" element={<RetellTransferInEachAttempt />} /> 
                <Route path="/RetellHAperLineType" element={<RetellHAperLineType />} /> 
                <Route path="/TwillioRecordings" element={<TwillioRecordings />} /> 
            </Routes>
        </Router>
    );
}

export default App;
