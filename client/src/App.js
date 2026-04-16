import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddItem from './pages/AddItem';
import ItemDetail from './pages/ItemDetail';
import Locations from './pages/Locations';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* All authenticated pages share the sidebar layout */}
                    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                        <Route path="/"           element={<Dashboard />} />
                        <Route path="/inventory"  element={<Inventory />} />
                        <Route path="/add"        element={<AddItem />} />
                        <Route path="/items/:id"  element={<ItemDetail />} />
                        <Route path="/locations"  element={<Locations />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
