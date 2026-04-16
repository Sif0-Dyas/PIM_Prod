import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuth } from '../contexts/AuthContext';

const AppLayout = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-dvh bg-gray-50">
            {/* Page content — pb-20 leaves room above the bottom nav */}
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            {user && <BottomNav />}
        </div>
    );
};

export default AppLayout;
