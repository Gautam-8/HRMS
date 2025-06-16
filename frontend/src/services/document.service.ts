import api from '@/lib/axios';

export const documentService = {
  async getUserDocuments(userId: string) {
    const res = await api.get(`/user-documents/${userId}`);
    return res.data;
  },

  async uploadDocument(formData: FormData) {
    const res = await api.post('/user-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteDocument(id: string) {
    const res = await api.delete(`/user-documents/${id}`);
    return res.data;
  },
}; 