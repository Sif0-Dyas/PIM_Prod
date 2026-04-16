import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SERVER_URL, CATEGORIES, CONDITIONS } from '../constants/apiConstants';
import { getItem, updateItem, deleteItem } from '../services/itemService';
import { getLocations } from '../services/locationService';
import { uploadImages, setPrimaryImage, deleteImage } from '../services/imageService';
import { FiEdit2, FiTrash2, FiMapPin, FiTag, FiUpload, FiCheck, FiX, FiChevronLeft } from 'react-icons/fi';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [locations, setLocations] = useState([]);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchItem = useCallback(async () => {
        const data = await getItem(id);
        setItem(data.item);
        setForm({
            name: data.item.name || '',
            brand: data.item.brand || '',
            model: data.item.model || '',
            description: data.item.description || '',
            category: data.item.category || '',
            condition: data.item.condition || '',
            serialNumber: data.item.serialNumber || '',
            barcode: data.item.barcode || '',
            purchasePrice: data.item.purchasePrice?.toString() || '',
            estimatedValue: data.item.estimatedValue?.toString() || '',
            purchaseDate: data.item.purchaseDate ? data.item.purchaseDate.split('T')[0] : '',
            notes: data.item.notes || '',
            locationId: data.item.locationId?.toString() || '',
            tags: data.item.tags?.map(t => t.tag.name).join(', ') || ''
        });
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchItem();
        getLocations().then(data => setLocations(data.locations));
    }, [fetchItem]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
            await updateItem(id, payload);
            await fetchItem();
            setEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this item? This cannot be undone.')) return;
        await deleteItem(id);
        navigate('/inventory');
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        await uploadImages(id, files);
        fetchItem();
    };

    const handleSetPrimary = async (imageId) => {
        await setPrimaryImage(id, imageId);
        fetchItem();
    };

    const handleDeleteImage = async (imageId) => {
        await deleteImage(id, imageId);
        fetchItem();
    };

    if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>;
    if (!item) return <div className="text-center py-20 text-gray-500 text-sm">Item not found</div>;

    const primaryImg = item.images?.find(i => i.isPrimary) || item.images?.[0];

    const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
    const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

    return (
        <div>
            {/* Top bar */}
            <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 py-3 flex items-center justify-between">
                <button onClick={() => navigate('/inventory')} className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                    <FiChevronLeft size={18} />
                    Back
                </button>
                <div className="flex items-center gap-2">
                    {editing ? (
                        <>
                            <button onClick={() => setEditing(false)} className="p-2 text-gray-400">
                                <FiX size={20} />
                            </button>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50">
                                <FiCheck size={15} />
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setEditing(true)} className="p-2 text-gray-500">
                                <FiEdit2 size={18} />
                            </button>
                            <button onClick={handleDelete} className="p-2 text-red-400">
                                <FiTrash2 size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Hero image */}
            <div className="aspect-square bg-gray-100 w-full">
                {primaryImg
                    ? <img src={`${SERVER_URL}${primaryImg.url}`} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-200 text-sm">No photo</div>
                }
            </div>

            <div className="px-4 py-4 space-y-4">
                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

                {/* Name */}
                {editing ? (
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputCls} text-lg font-bold`} />
                ) : (
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{item.name}</h1>
                        {item.brand && <p className="text-sm text-gray-500 mt-0.5">{item.brand} {item.model || ''}</p>}
                    </div>
                )}

                {/* Image strip */}
                {(item.images?.length > 0 || true) && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {item.images?.map(img => (
                            <div key={img.id} className="relative shrink-0">
                                <img
                                    src={`${SERVER_URL}${img.url}`}
                                    alt=""
                                    className={`w-16 h-16 object-cover rounded-xl border-2 ${img.isPrimary ? 'border-blue-500' : 'border-transparent'}`}
                                    onClick={() => handleSetPrimary(img.id)}
                                />
                                <button onClick={() => handleDeleteImage(img.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                            </div>
                        ))}
                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 cursor-pointer text-gray-400 active:bg-gray-50">
                            <FiUpload size={18} />
                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                )}

                {/* Fields */}
                {editing ? (
                    <div className="space-y-3">
                        {[['Brand', 'brand'], ['Model', 'model'], ['Serial Number', 'serialNumber'], ['Barcode', 'barcode']].map(([label, key]) => (
                            <div key={key}>
                                <label className={labelCls}>{label}</label>
                                <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputCls} />
                            </div>
                        ))}
                        <div>
                            <label className={labelCls}>Category</label>
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                                <option value="">Select</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Condition</label>
                            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={inputCls}>
                                <option value="">Select</option>
                                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Location</label>
                            <select value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} className={inputCls}>
                                <option value="">No location</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        {[['Purchase Price ($)', 'purchasePrice', 'number'], ['Est. Value ($)', 'estimatedValue', 'number'], ['Purchase Date', 'purchaseDate', 'date']].map(([label, key, type]) => (
                            <div key={key}>
                                <label className={labelCls}>{label}</label>
                                <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputCls} />
                            </div>
                        ))}
                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Notes</label>
                            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Tags (comma separated)</label>
                            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
                        {[
                            ['Category',   item.category],
                            ['Condition',  CONDITIONS.find(c => c.value === item.condition)?.label || item.condition],
                            ['Serial No.', item.serialNumber],
                            ['Barcode',    item.barcode],
                            ['Paid',       item.purchasePrice ? `$${item.purchasePrice.toFixed(2)}` : null],
                            ['Value',      item.estimatedValue ? `$${item.estimatedValue.toFixed(2)}` : null],
                            ['Purchased',  item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : null],
                        ].filter(([, v]) => v).map(([label, value]) => (
                            <div key={label} className="flex justify-between items-center px-4 py-3 text-sm">
                                <span className="text-gray-500">{label}</span>
                                <span className="text-gray-900 font-medium">{value}</span>
                            </div>
                        ))}
                        {item.location && (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-blue-600">
                                <FiMapPin size={14} />
                                {item.location.name}
                            </div>
                        )}
                        {item.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 px-4 py-3">
                                {item.tags.map(t => (
                                    <span key={t.tag.id} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                                        <FiTag size={10} />{t.tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        {item.description && <p className="px-4 py-3 text-sm text-gray-600">{item.description}</p>}
                        {item.notes && <p className="px-4 py-3 text-sm text-gray-400 italic">{item.notes}</p>}
                    </div>
                )}

                {/* Price history */}
                {item.priceHistory?.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Price History</h3>
                        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
                            {item.priceHistory.map(p => (
                                <div key={p.id} className="flex justify-between items-center px-4 py-3 text-sm">
                                    <span className="text-gray-500">${p.price.toFixed(2)} <span className="text-xs text-gray-400">via {p.source}</span></span>
                                    <span className="text-gray-400 text-xs">{new Date(p.checkedAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemDetail;
