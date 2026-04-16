import { NavLink } from 'react-router-dom';
import { FiGrid, FiMapPin, FiPackage } from 'react-icons/fi';

const TABS = [
    { to: '/',          label: 'Home',      icon: FiGrid,    end: true  },
    { to: '/locations', label: 'Locations', icon: FiMapPin,  end: false },
    { to: '/inventory', label: 'Inventory', icon: FiPackage, end: false },
];

const BottomNav = () => (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 safe-bottom">
        <div className="flex">
            {TABS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                        `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors ${
                            isActive ? 'text-blue-600' : 'text-gray-400'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                            <span>{label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    </nav>
);

export default BottomNav;
