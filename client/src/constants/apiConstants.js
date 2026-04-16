export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8003/api';
export const SERVER_URL = API_URL.replace(/\/api$/, '');

export const API = {
    AUTH: {
        REGISTER: `${API_URL}/auth/register`,
        LOGIN: `${API_URL}/auth/login`,
        ME: `${API_URL}/auth/me`
    },
    ITEMS: `${API_URL}/items`,
    LOCATIONS: `${API_URL}/locations`,
    IMAGES: `${API_URL}/images`,
    LOOKUP: {
        PHOTO: `${API_URL}/lookup/photo`,
        BARCODE: (code) => `${API_URL}/lookup/barcode/${code}`
    }
};

export const CATEGORIES = [
    'Electronics', 'Furniture', 'Appliances', 'Clothing', 'Books',
    'Tools', 'Sports', 'Kitchen', 'Decor', 'Collectibles', 'Jewelry', 'Other'
];

export const CONDITIONS = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
];

export const LOCATION_TYPES = [
    { value: 'room', label: 'Room' },
    { value: 'shelf', label: 'Shelf' },
    { value: 'drawer', label: 'Drawer' },
    { value: 'box', label: 'Box' },
    { value: 'cabinet', label: 'Cabinet' },
    { value: 'other', label: 'Other' }
];
