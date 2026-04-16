import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItems } from '../services/itemService';
import { getLocations } from '../services/locationService';
import { SERVER_URL } from '../constants/apiConstants';
import { FiPackage, FiMapPin, FiDollarSign, FiChevronRight, FiPlusCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ items: 0, locations: 0, value: 0 });
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getItems({}), getLocations()])
            .then(([itemData, locData]) => {
                const items = itemData.items || [];
                const totalValue = items.reduce((sum, i) => sum + (i.estimatedValue || 0), 0);
                setStats({
                    items: itemData.total || 0,
                    locations: locData.locations?.length || 0,
                    value: totalValue,
                });
                setRecent(items.slice(0, 5));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="px-4 pt-6 pb-4">
            {/* Header */}
            <div className="mb-6">
                <p className="text-sm text-gray-500">Welcome back</p>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'Your Inventory'}</h1>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: 'Items',     value: stats.items,                    icon: FiPackage,    color: 'text-blue-600',   bg: 'bg-blue-50'   },
                    { label: 'Locations', value: stats.locations,                icon: FiMapPin,     color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Value',     value: `$${stats.value.toFixed(0)}`,   icon: FiDollarSign, color: 'text-green-600',  bg: 'bg-green-50'  },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-2xl p-3">
                        <div className={`inline-flex p-1.5 rounded-lg ${bg} mb-2`}>
                            <Icon size={16} className={color} />
                        </div>
                        <p className="text-xl font-bold text-gray-900 leading-none">{loading ? '—' : value}</p>
                        <p className="text-xs text-gray-400 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Add item CTA */}
            <Link
                to="/add"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors mb-6"
            >
                <FiPlusCircle size={18} />
                Add Item
            </Link>

            {/* Recent items */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700">Recent Items</h2>
                    <Link to="/inventory" className="text-xs text-blue-600 font-medium">View all</Link>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
                ) : recent.length === 0 ? (
                    <div className="py-10 text-center">
                        <FiPackage size={32} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-sm text-gray-400">No items yet</p>
                        <p className="text-xs text-gray-300 mt-1">Tap Add Item to get started</p>
                    </div>
                ) : (
                    <div>
                        {recent.map((item, i) => {
                            const img = item.images?.find(i => i.isPrimary) || item.images?.[0];
                            return (
                                <Link
                                    key={item.id}
                                    to={`/items/${item.id}`}
                                    className={`flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition-colors ${i < recent.length - 1 ? 'border-b border-gray-100' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                                        {img
                                            ? <img src={`${SERVER_URL}${img.url}`} alt="" className="w-full h-full object-cover" />
                                            : <FiPackage size={16} className="text-gray-300" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{item.location?.name || 'No location'}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {item.estimatedValue != null && (
                                            <p className="text-sm font-medium text-green-600">${item.estimatedValue.toFixed(0)}</p>
                                        )}
                                        <FiChevronRight size={14} className="text-gray-300" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
