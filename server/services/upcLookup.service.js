const axios = require('axios');
const logger = require('../config/logger.config');

const lookup = async (barcode) => {
    try {
        const response = await axios.get('https://api.upcitemdb.com/prod/trial/lookup', {
            params: { upc: barcode },
            headers: { 'User-Agent': 'PIM-App/1.0' },
            timeout: 8000
        });

        const data = response.data;
        if (data.code !== 'OK' || !data.items?.length) return null;

        const item = data.items[0];

        return {
            name: item.title || null,
            brand: item.brand || null,
            description: item.description || null,
            category: item.category || null,
            lowestPrice: item.lowest_recorded_price || null,
            highestPrice: item.highest_recorded_price || null,
            imageUrl: item.images?.[0] || null,
            barcode
        };
    } catch (err) {
        if (err.response?.status === 404) return null;
        logger.error('UPC lookup error', { barcode, message: err.message });
        throw new Error('Barcode lookup failed: ' + err.message);
    }
};

module.exports = { lookup };
