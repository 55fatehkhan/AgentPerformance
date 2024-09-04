import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import SessionSelection from './SessionSelection';
import FilePerformance from './FilePerformance';
import RuntimePerformance from './RuntimePerformance';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/SessionSelection" element={<SessionSelection />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/FilePerformance" element={<FilePerformance />} /> 
                <Route path="/RuntimePerformance" element={<RuntimePerformance />} /> 
            </Routes>
        </Router>
    );
}

export default App;
