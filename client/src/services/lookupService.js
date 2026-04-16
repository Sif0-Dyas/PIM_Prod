import axios from 'axios';
import { API } from '../constants/apiConstants';

export const analyzePhoto = (imageBase64, mimeType) =>
    axios.post(API.LOOKUP.PHOTO, { imageBase64, mimeType }).then(r => r.data);

export const lookupBarcode = (barcode) =>
    axios.get(API.LOOKUP.BARCODE(barcode)).then(r => r.data);
