import api from './axios';

export const getGrievances = async (params) => {
    // Add timestamp to prevent caching (304 Not Modified issues)
    const noCacheParams = { ...params, _t: Date.now() };
    const response = await api.get('/grievances', { params: noCacheParams });
    return response.data;
};

export const getGrievance = async (id) => {
    const response = await api.get(`/grievances/${id}`);
    return response.data;
};

export const createGrievance = async (formData) => {
    // Use 'Content-Type': 'multipart/form-data' for file upload
    const response = await api.post('/grievances', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateGrievanceStatus = async (id, statusData) => {
    const response = await api.put(`/grievances/${id}`, statusData);
    return response.data;
};

export const deleteGrievance = async (id) => {
    const response = await api.delete(`/grievances/${id}`);
    return response.data;
};

export const analyzeGrievance = async (formData) => {
    const response = await api.post('/grievances/analyze', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
