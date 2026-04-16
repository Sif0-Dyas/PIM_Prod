import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, CONDITIONS } from '../constants/apiConstants';
import { createItem } from '../services/itemService';
import { getLocations } from '../services/locationService';
import { uploadImages } from '../services/imageService';
import { analyzePhoto, lookupBarcode } from '../services/lookupService';
import BarcodeScanner from '../components/BarcodeScanner';
import PhotoCapture from '../components/PhotoCapture';
import { FiCamera, FiBarChart2, FiEdit3, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';

const MODES = [
    { id: 'photo',   label: 'Photo',   icon: FiCamera,    desc: 'AI fills in the details' },
    { id: 'barcode', label: 'Barcode', icon: FiBarChart2,  desc: 'Scan to look up the product' },
    { id: 'manual',  label: 'Manual',  icon: FiEdit3,      desc: 'Fill in details yourself' }
];

const emptyForm = {
    name: '', description: '', brand: '', model: '', serialNumber: '',
    barcode: '', category: '', condition: '', purchasePrice: '',
    estimatedValue: '', purchaseDate: '', notes: '', locationId: '', tags: ''
};

const AddItem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [error, setError] = useState('');
    const [priceRange, setPriceRange] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        getLocations().then(data => setLocations(data.locations));
    }, []);

    const prefill = (data) => {
        setForm(prev => ({
            ...prev,
            name: data.name || prev.name,
            brand: data.brand || prev.brand,
            model: data.model || prev.model,
            description: data.description || prev.description,
            category: data.category || prev.category,
            condition: data.condition || prev.condition,
            estimatedValue: data.estimatedValue?.toString() || prev.estimatedValue,
            notes: data.notes || prev.notes
        }));
        if (data.barcode) setForm(prev => ({ ...prev, barcode: data.barcode }));
        if (data.lowestPrice || data.highestPrice) {
            setPriceRange({ low: data.lowestPrice, high: data.highestPrice });
        }
    };

    const handlePhotoAnalyzed = async (base64, mimeType) => {
        setCapturedImage({ base64, mimeType });
        setLookupLoading(true);
        setError('');
        try {
            const data = await analyzePhoto(base64, mimeType);
            prefill(data.result);
            setMode('manual');
        } catch {
            setError('Photo analysis failed. Fill in details manually.');
            setMode('manual');
        } finally {
            setLookupLoading(false);
        }
    };

    const handleBarcodeScanned = async (barcode) => {
        setLookupLoading(true);
        setError('');
        setForm(prev => ({ ...prev, barcode }));
        try {
            const data = await lookupBarcode(barcode);
            prefill(data.result);
            setMode('manual');
        } catch {
            setError('Product not found. Fill in details manually.');
            setMode('manual');
        } finally {
            setLookupLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...form,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
            };
            const data = await createItem(payload);

            if (capturedImage) {
                const blob = await fetch(`data:${capturedImage.mimeType};base64,${capturedImage.base64}`).then(r => r.blob());
                await uploadImages(data.item.id, [blob], 'capture.jpg');
            }

            navigate(`/items/${data.item.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create item');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
    const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

    // Mode selection screen
    if (!mode) {
        return (
            <div className="px-4 pt-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Add Item</h1>
                    <p className="text-sm text-gray-500 mt-1">How would you like to add this item?</p>
                </div>
                <div className="space-y-3">
                    {MODES.map(({ id, label, icon: Icon, desc }) => (
                        <button
                            key={id}
                            onClick={() => setMode(id)}
                            className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl active:bg-gray-50 transition-colors text-left"
                        >
                            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                <Icon size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                            </div>
                            <FiChevronRight size={16} className="text-gray-300 shrink-0" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (mode === 'photo') {
        return (
            <div>
                <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 py-3 flex items-center gap-2">
                    <button onClick={() => setMode(null)} className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                        <FiChevronLeft size={18} />
                        Back
                    </button>
                </div>
                <div className="px-4 py-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Take a Photo</h2>
                    {lookupLoading ? (
                        <div className="text-center py-16 text-gray-400 text-sm">Analysing with AI...</div>
                    ) : (
                        <PhotoCapture onCapture={handlePhotoAnalyzed} />
                    )}
                </div>
            </div>
        );
    }

    if (mode === 'barcode') {
        return (
            <div>
                <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 py-3 flex items-center gap-2">
                    <button onClick={() => setMode(null)} className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                        <FiChevronLeft size={18} />
                        Back
                    </button>
                </div>
                <div className="px-4 py-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Scan Barcode</h2>
                    {lookupLoading ? (
                        <div className="text-center py-16 text-gray-400 text-sm">Looking up product...</div>
                    ) : (
                        <BarcodeScanner onScan={handleBarcodeScanned} />
                    )}
                </div>
            </div>
        );
    }

    // Manual / pre-filled form
    return (
        <div>
            {/* Top bar */}
            <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-4 py-3 flex items-center justify-between">
                <button onClick={() => setMode(null)} className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                    <FiChevronLeft size={18} />
                    Back
                </button>
                <button
                    form="add-item-form"
                    type="submit"
                    disabled={loading || !form.name}
                    className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                    <FiCheck size={15} />
                    {loading ? 'Saving…' : 'Save'}
                </button>
            </div>

            <div className="px-4 py-4">
                {lookupLoading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-sm text-blue-700">
                        Looking up product details...
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-sm text-red-700">{error}</div>
                )}
                {priceRange && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-sm text-green-700">
                        Market price: ${priceRange.low?.toFixed(2) || '?'} – ${priceRange.high?.toFixed(2) || '?'}
                    </div>
                )}

                <form id="add-item-form" onSubmit={handleSubmit} className="space-y-3">
                    {/* Name — prominent */}
                    <div>
                        <label className={labelCls}>Item Name <span className="text-red-400">*</span></label>
                        <input
                            required
                            placeholder="e.g. Sony WH-1000XM5"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={`${inputCls} text-base font-medium`}
                        />
                    </div>

                    {[['Brand', 'brand', 'text', 'e.g. Sony'], ['Model', 'model', 'text', 'e.g. WH-1000XM5'], ['Serial Number', 'serialNumber'], ['Barcode / UPC', 'barcode']].map(([label, key, type = 'text', placeholder = '']) => (
                        <div key={key}>
                            <label className={labelCls}>{label}</label>
                            <input type={type} placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputCls} />
                        </div>
                    ))}

                    <div>
                        <label className={labelCls}>Category</label>
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                            <option value="">Select category</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={labelCls}>Condition</label>
                        <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={inputCls}>
                            <option value="">Select condition</option>
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

                    {[['Purchase Price ($)', 'purchasePrice', 'number'], ['Estimated Value ($)', 'estimatedValue', 'number'], ['Purchase Date', 'purchaseDate', 'date']].map(([label, key, type]) => (
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
                        <input placeholder="e.g. fragile, electronics" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItem;
