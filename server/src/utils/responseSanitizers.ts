import { getVisibleCustomerNumber } from './customerNumber';

const stripVerificationFields = (user: any) => {
  if (!user) return user;
  const clone = { ...user };
  delete clone.emailVerificationToken;
  delete clone.emailVerificationExpires;
  return clone;
};

const sanitizeNestedCustomer = (customer: any) => {
  if (!customer) return customer;
  return {
    ...customer,
    customerNumber: '********',
    visibleCustomerNumber: customer.customerNumber
      ? getVisibleCustomerNumber(customer.customerNumber)
      : undefined,
  };
};

export const sanitizeUser = (input: any) => {
  if (!input) return input;
  const raw = input?.toJSON ? input.toJSON() : input;
  const cleaned = stripVerificationFields(raw);
  const fullCustomerNumber = cleaned.customerNumber as string | undefined;

  return {
    ...cleaned,
    customerNumber: '********',
    visibleCustomerNumber: fullCustomerNumber
      ? getVisibleCustomerNumber(fullCustomerNumber)
      : cleaned.visibleCustomerNumber,
    customer: sanitizeNestedCustomer(cleaned.customer),
  };
};

export const sanitizeCustomer = (input: any) => {
  if (!input) return input;
  const raw = input?.toJSON ? input.toJSON() : input;
  const fullCustomerNumber = raw.customerNumber as string | undefined;

  return {
    ...raw,
    customerNumber: '********',
    visibleCustomerNumber: fullCustomerNumber
      ? getVisibleCustomerNumber(fullCustomerNumber)
      : raw.visibleCustomerNumber,
    user: raw.user ? sanitizeUser(raw.user) : raw.user,
  };
};
