import apiClient from './api';

export interface EventContext {
  id: string;
  code: string;
  name: string;
  subdomain: string;
  defaultLocale: string;
  allowedLocales: string[];
}

export interface CurrentEventResponse {
  mode: 'event' | 'selector' | 'error';
  event?: EventContext;
  availableEvents?: EventContext[];
  message?: string;
}

export const eventService = {
  async getCurrent(): Promise<CurrentEventResponse> {
    const response = await apiClient.get<CurrentEventResponse>('/event/current');
    return response.data;
  },
};
