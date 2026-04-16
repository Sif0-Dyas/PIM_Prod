import axios from 'axios';
import { API } from '../constants/apiConstants';

export const getItems = (filters = {}) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    return axios.get(API.ITEMS, { params }).then(r => r.data);
};

export const getItem = (id) =>
    axios.get(`${API.ITEMS}/${id}`).then(r => r.data);

export const createItem = (payload) =>
    axios.post(API.ITEMS, payload).then(r => r.data);

export const updateItem = (id, payload) =>
    axios.put(`${API.ITEMS}/${id}`, payload).then(r => r.data);

export const deleteItem = (id) =>
    axios.delete(`${API.ITEMS}/${id}`).then(r => r.data);
