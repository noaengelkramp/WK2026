const FULL_CUSTOMER_NUMBER_REGEX = /^C\d{4}_\d{7}$/;
const SHORT_CUSTOMER_NUMBER_REGEX = /^\d{7}$/;

export const isFullCustomerNumber = (value: string): boolean => FULL_CUSTOMER_NUMBER_REGEX.test(value);
export const isShortCustomerNumber = (value: string): boolean => SHORT_CUSTOMER_NUMBER_REGEX.test(value);

export const normalizeCustomerNumber = (input: string, customerPrefix?: string): string => {
  const value = (input || '').trim();

  if (isFullCustomerNumber(value)) {
    return value;
  }

  if (!isShortCustomerNumber(value)) {
    throw new Error('Invalid customer number format. Use 7 digits or C1234_1234567');
  }

  if (!customerPrefix || !/^C\d{4}$/.test(customerPrefix)) {
    throw new Error('Event customerPrefix is not configured correctly');
  }

  return `${customerPrefix}_${value}`;
};

export const getVisibleCustomerNumber = (fullCustomerNumber: string): string => {
  const match = fullCustomerNumber.match(/^C\d{4}_(\d{7})$/);
  return match ? match[1] : fullCustomerNumber;
};
