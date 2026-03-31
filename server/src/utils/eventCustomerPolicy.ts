import { Op } from 'sequelize';
import { Customer } from '../models';
import { normalizeCustomerNumber } from './customerNumber';

export const MAX_ACCOUNTS_PER_CUSTOMER_PER_EVENT = 5;

export const isInternalEvent = (eventCode?: string): boolean => (eventCode || '').toLowerCase() === 'internal';

export const isKrampEmail = (email: string): boolean => email.toLowerCase().endsWith('@kramp.com');

const getNextCustomerNumber = async (customerPrefix: string): Promise<string> => {
  const latest = await Customer.findOne({
    where: {
      customerNumber: {
        [Op.like]: `${customerPrefix}_%`,
      },
    },
    order: [['customerNumber', 'DESC']],
  });

  const latestSuffix = latest?.customerNumber?.split('_')[1] || '0000000';
  const next = String(Math.min(9999999, parseInt(latestSuffix, 10) + 1)).padStart(7, '0');
  return `${customerPrefix}_${next}`;
};

export const resolveCustomerNumberForEvent = async (params: {
  eventCode: string;
  customerPrefix: string;
  email: string;
  customerNumberInput?: string;
}): Promise<string> => {
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

  const generatedCustomerNumber = await getNextCustomerNumber(customerPrefix);
  await Customer.findOrCreate({
    where: { customerNumber: generatedCustomerNumber },
    defaults: {
      customerNumber: generatedCustomerNumber,
      companyName: 'Kramp Internal',
      isActive: true,
    },
  });

  return generatedCustomerNumber;
};
