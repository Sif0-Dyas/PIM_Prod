import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

const BarcodeScanner = ({ onScan }) => {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const [error, setError] = useState('');
    const [manualCode, setManualCode] = useState('');
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
        setScanning(true);

        reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
            if (result) {
                reader.reset();
                setScanning(false);
                onScan(result.getText());
            }
            if (err && !(err instanceof NotFoundException)) {
                console.error(err);
            }
        }).catch((err) => {
            setError('Camera not available. Enter the barcode manually below.');
            setScanning(false);
        });

        return () => {
            reader.reset();
        };
    }, [onScan]);

    const handleManual = (e) => {
        e.preventDefault();
        if (manualCode.trim()) onScan(manualCode.trim());
    };

    return (
        <div>
            {!error && (
                <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    {scanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="border-2 border-blue-400 w-3/4 h-24 rounded-lg opacity-70" />
                        </div>
                    )}
                    <p className="absolute bottom-3 left-0 right-0 text-center text-white text-xs opacity-75">
                        Point camera at barcode
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleManual} className="flex gap-2">
                <input
                    type="text"
                    placeholder="Enter barcode manually"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={!manualCode.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    Look Up
                </button>
            </form>
        </div>
    );
};

export default BarcodeScanner;
