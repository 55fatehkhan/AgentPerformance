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
            </Routes>
        </Router>
    );
}

export default App;
