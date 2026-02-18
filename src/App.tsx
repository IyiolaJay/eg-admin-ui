import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Performance } from './pages/Performance';
import { Disputes } from './pages/Disputes';
import { DisputeDetail } from './pages/DisputeDetail';
import { FailedOperations } from './pages/FailedOperations';
import { Users } from './pages/Users';
import { Agents } from './pages/Agents';
import { RewardHub } from './pages/RewardHub';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/performance" element={<Performance />} />
        <Route path="/admin/disputes" element={<Disputes />} />
        <Route path="/admin/disputes/:id" element={<DisputeDetail />} />
        <Route path="/admin/agents" element={<Agents />} />
        <Route path="/admin/reward-hub" element={<RewardHub />} />
        <Route path="/admin/failed-operations" element={<FailedOperations />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
