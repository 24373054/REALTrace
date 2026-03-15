import client from './client';
import type { AddressInfo, Transaction, PageResult } from '../../types';

export const addressApi = {
  query: (chain: string, address: string) =>
    client.get<any, AddressInfo>(`/address/${chain}/${address}`),

  getTransactions: (chain: string, address: string, params?: { page?: number; pageSize?: number }) =>
    client.get<any, PageResult<Transaction>>(`/address/${chain}/${address}/transactions`, { params }),

  getFlow: (chain: string, address: string, depth = 3) =>
    client.post(`/address/${chain}/${address}/flow`, { depth }),

  addFavorite: (chain: string, address: string, label?: string) =>
    client.post('/favorites', { chain, address, label }),

  removeFavorite: (id: string) =>
    client.delete(`/favorites/${id}`),

  getFavorites: () =>
    client.get('/favorites'),
};
