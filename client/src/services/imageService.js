import axios from 'axios';
import { API } from '../constants/apiConstants';

export const uploadImages = (itemId, files, filename = null) => {
    const fd = new FormData();
    files.forEach((f, i) => fd.append('images', f, filename || f.name || `image-${i}.jpg`));
    return axios.post(`${API.IMAGES}/${itemId}`, fd).then(r => r.data);
};

export const setPrimaryImage = (itemId, imageId) =>
    axios.put(`${API.IMAGES}/${itemId}/primary/${imageId}`).then(r => r.data);

export const deleteImage = (itemId, imageId) =>
    axios.delete(`${API.IMAGES}/${itemId}/${imageId}`).then(r => r.data);
