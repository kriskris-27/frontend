import axios from 'axios';

const api =axios.create({
    baseURL:'https://thesis-server-wwmb.onrender.com/api',
  withCredentials: true, 
});

export default api