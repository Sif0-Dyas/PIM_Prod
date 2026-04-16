import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SERVER_URL, CATEGORIES, CONDITIONS } from '../constants/apiConstants';
import { getItems } from '../services/itemService';
import { getLocations } from '../services/locationService';
import { FiSearch, FiSliders, FiPackage, FiX } from 'react-icons/fi';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', locationId: '', category: '', condition: '' });
    const [showFilters, setShowFilters] = useState(false);

    const fetchLocations = useCallback(async () => {
        const data = await getLocations();
        setLocations(data.locations);
    }, []);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getItems(filters);
            setItems(data.items);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchLocations(); }, [fetchLocations]);
    useEffect(() => { fetchItems(); }, [fetchItems]);

    const primaryImage = (item) => item.images?.find(i => i.isPrimary) || item.images?.[0];
    const hasActiveFilters = filters.locationId || filters.category || filters.condition;

    const clearFilter = (key) => setFilters(f => ({ ...f, [key]: '' }));

    return (
        <div className="flex flex-col h-full">
            {/* Search bar */}
            <div className="sticky top-0 bg-gray-50 z-10 px-4 pt-4 pb-3 space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                            showFilters || hasActiveFilters
                                ? 'bg-blue-50 border-blue-400 text-blue-600'
                                : 'bg-white border-gray-200 text-gray-500'
                        }`}
                    >
                        <FiSliders size={16} />
                        {hasActiveFilters ? 'Filtered' : 'Filter'}
                    </button>
                </div>

                {/* Filter panel */}
                {showFilters && (
                    <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
                        {[
                            { key: 'locationId', placeholder: 'All Locations', options: locations.map(l => ({ value: l.id, label: l.name })) },
                            { key: 'category',   placeholder: 'All Categories', options: CATEGORIES.map(c => ({ value: c, label: c })) },
                            { key: 'condition',  placeholder: 'All Conditions', options: CONDITIONS.map(c => ({ value: c.value, label: c.label })) },
                        ].map(({ key, placeholder, options }) => (
                            <select
                                key={key}
                                value={filters[key]}
                                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">{placeholder}</option>
                                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        ))}
                    </div>
                )}

                {/* Active filter chips */}
                {hasActiveFilters && (
                    <div className="flex gap-2 flex-wrap">
                        {filters.locationId && (
                            <button onClick={() => clearFilter('locationId')} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                                {locations.find(l => l.id == filters.locationId)?.name} <FiX size={11} />
                            </button>
                        )}
                        {filters.category && (
                            <button onClick={() => clearFilter('category')} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                                {filters.category} <FiX size={11} />
                            </button>
                        )}
                        {filters.condition && (
                            <button onClick={() => clearFilter('condition')} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                                {CONDITIONS.find(c => c.value === filters.condition)?.label} <FiX size={11} />
                            </button>
                        )}
                    </div>
                )}

                <p className="text-xs text-gray-400">{total} item{total !== 1 ? 's' : ''}</p>
            </div>

            {/* Grid */}
            <div className="flex-1 px-4 pb-4">
                {loading ? (
                    <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16">
                        <FiPackage size={40} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-500 font-medium text-sm">No items found</p>
                        <p className="text-gray-400 text-xs mt-1">
                            {hasActiveFilters || filters.search ? 'Try adjusting your filters' : 'Add your first item to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {items.map(item => {
                            const img = primaryImage(item);
                            return (
                                <Link key={item.id} to={`/items/${item.id}`} className="bg-white border border-gray-200 rounded-2xl overflow-hidden active:scale-95 transition-transform">
                                    <div className="aspect-square bg-gray-100">
                                        {img ? (
                                            <img src={`${SERVER_URL}${img.url}`} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FiPackage size={28} className="text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                        {item.brand && <p className="text-xs text-gray-400 truncate mt-0.5">{item.brand}</p>}
                                        {item.location && <p className="text-xs text-blue-500 truncate mt-0.5">{item.location.name}</p>}
                                        {item.estimatedValue != null && (
                                            <p className="text-sm font-semibold text-green-600 mt-1">${item.estimatedValue.toFixed(0)}</p>
                                        )}
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

export default Inventory;
