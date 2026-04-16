import axios from 'axios';
import { API } from '../constants/apiConstants';

export const login = (email, password) =>
    axios.post(API.AUTH.LOGIN, { email, password }).then(r => r.data);

export const register = (email, password, name) =>
    axios.post(API.AUTH.REGISTER, { email, password, name }).then(r => r.data);

export const getMe = () =>
    axios.get(API.AUTH.ME).then(r => r.data);
