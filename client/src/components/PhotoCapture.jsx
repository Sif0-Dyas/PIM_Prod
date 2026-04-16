import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FiCamera, FiUpload, FiRefreshCw } from 'react-icons/fi';

const PhotoCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [mode, setMode] = useState('camera'); // 'camera' | 'preview'
    const [preview, setPreview] = useState(null);
    const [previewMime, setPreviewMime] = useState('image/jpeg');
    const [cameraError, setCameraError] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            // imageSrc is data:image/jpeg;base64,... strip the prefix
            const [header, base64] = imageSrc.split(',');
            const mime = header.match(/:(.*?);/)[1];
            setPreview(imageSrc);
            setPreviewMime(mime);
            setMode('preview');
        }
    }, [webcamRef]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const [header, base64] = evt.target.result.split(',');
            const mime = header.match(/:(.*?);/)[1];
            setPreview(evt.target.result);
            setPreviewMime(mime);
            setMode('preview');
        };
        reader.readAsDataURL(file);
    };

    const handleConfirm = () => {
        const [, base64] = preview.split(',');
        onCapture(base64, previewMime);
    };

    if (mode === 'preview') {
        return (
            <div>
                <img src={preview} alt="Captured" className="w-full rounded-xl mb-4 border border-gray-200" />
                <div className="flex gap-3">
                    <button
                        onClick={() => { setPreview(null); setMode('camera'); }}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                        <FiRefreshCw size={14} />
                        Retake
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        Analyze with AI
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {!cameraError ? (
                <div className="mb-4">
                    <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full rounded-xl border border-gray-200"
                        videoConstraints={{ facingMode: 'environment' }}
                        onUserMediaError={() => setCameraError(true)}
                    />
                    <button
                        onClick={capture}
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        <FiCamera size={16} />
                        Take Photo
                    </button>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-700">
                    Camera not available. Upload an image instead.
                </div>
            )}

            <label className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                <FiUpload size={16} />
                Upload from device
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
        </div>
    );
};

export default PhotoCapture;
