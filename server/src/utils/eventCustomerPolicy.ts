import { normalizeCustomerNumber } from './customerNumber';

export const MAX_ACCOUNTS_PER_CUSTOMER_PER_EVENT = 5;

export const isInternalEvent = (eventCode?: string): boolean => (eventCode || '').toLowerCase() === 'internal';

export const isKrampEmail = (email: string): boolean => email.toLowerCase().endsWith('@kramp.com');

export const resolveCustomerNumberForEvent = async (params: {
  eventCode: string;
  customerPrefix?: string;
  email: string;
  customerNumberInput?: string;
}): Promise<string | null> => {
  const { eventCode, customerPrefix, email, customerNumberInput } = params;

  if (customerNumberInput && customerNumberInput.trim()) {
    return normalizeCustomerNumber(customerNumberInput, customerPrefix);
  }

  if (!isInternalEvent(eventCode)) {
    throw new Error('Customer number is required');
  }

  if (!isKrampEmail(email)) {
    throw new Error('Internal event requires a @kramp.com email address');
  }

  // Internal users are decoupled from customer-number identity.
  return null;
};
