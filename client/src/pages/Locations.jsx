import { useState, useEffect } from 'react';
import { LOCATION_TYPES } from '../constants/apiConstants';
import { getLocations, createLocation, deleteLocation } from '../services/locationService';
import { FiPlus, FiTrash2, FiChevronRight, FiMapPin } from 'react-icons/fi';

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [form, setForm] = useState({ name: '', type: 'room', description: '', parentId: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const fetchLocations = async () => {
        const data = await getLocations();
        setLocations(data.locations);
    };

    useEffect(() => { fetchLocations(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await createLocation({ ...form, parentId: form.parentId || undefined });
            setForm({ name: '', type: 'room', description: '', parentId: '' });
            setShowForm(false);
            fetchLocations();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create location');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this location? Items inside will become unassigned.')) return;
        try {
            await deleteLocation(id);
            fetchLocations();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete location');
        }
    };

    const buildTree = (list, parentId = null) =>
        list.filter(l => l.parentId === parentId).map(l => ({ ...l, children: buildTree(list, l.id) }));

    const tree = buildTree(locations);

    const LocationNode = ({ loc, depth = 0 }) => (
        <div>
            <div className="flex items-center justify-between py-3 px-4 active:bg-gray-50" style={{ paddingLeft: `${16 + depth * 16}px` }}>
                <div className="flex items-center gap-2 min-w-0">
                    {depth > 0 && <FiChevronRight size={12} className="text-gray-300 shrink-0" />}
                    <FiMapPin size={15} className="text-blue-500 shrink-0" />
                    <span className="text-sm font-medium text-gray-800 truncate">{loc.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">{loc.type}</span>
                    {loc._count?.items > 0 && (
                        <span className="text-xs text-gray-400 shrink-0">{loc._count.items}</span>
                    )}
                </div>
                <button
                    onClick={() => handleDelete(loc.id)}
                    className="p-2 text-red-400 active:text-red-600 shrink-0"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>
            {loc.children?.map(child => <LocationNode key={child.id} loc={child} depth={depth + 1} />)}
        </div>
    );

    return (
        <div className="px-4 pt-6">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold active:bg-blue-700 transition-colors"
                >
                    <FiPlus size={16} />
                    Add
                </button>
            </div>

            {/* Create form (collapsible) */}
            {showForm && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">New Location</h2>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <input
                            required
                            placeholder="Name (e.g. Living Room)"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {LOCATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <select
                            value={form.parentId}
                            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">No parent (top level)</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Location tree */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {tree.length === 0 ? (
                    <div className="text-center py-12">
                        <FiMapPin size={32} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-sm text-gray-400">No locations yet</p>
                        <p className="text-xs text-gray-300 mt-1">Tap Add to create one</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {tree.map(loc => <LocationNode key={loc.id} loc={loc} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Locations;
