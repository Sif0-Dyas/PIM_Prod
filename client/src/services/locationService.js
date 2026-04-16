import axios from 'axios';
import { API } from '../constants/apiConstants';

export const getLocations = () =>
    axios.get(API.LOCATIONS).then(r => r.data);

export const createLocation = (payload) =>
    axios.post(API.LOCATIONS, payload).then(r => r.data);

export const deleteLocation = (id) =>
    axios.delete(`${API.LOCATIONS}/${id}`).then(r => r.data);
