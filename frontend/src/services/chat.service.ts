import api from '@/lib/axios';

export const chatService = {
  async uploadPolicy(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  async sendQuery(query: string) {
    const response = await api.post('/chat/query', { query });
    return response.data;
  }
}; 