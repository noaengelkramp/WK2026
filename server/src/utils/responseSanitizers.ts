const INTERNAL_EVENT_ID = '00000000-0000-4000-8000-000000000001';

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
    visibleCustomerNumber: '********',
  };
};

export const sanitizeUser = (input: any) => {
  if (!input) return input;
  const raw = input?.toJSON ? input.toJSON() : input;
  const cleaned = stripVerificationFields(raw);
  const isInternalUser = cleaned.eventId === INTERNAL_EVENT_ID;
  const hasCustomer = !!cleaned.customer;

  return {
    ...cleaned,
    customerNumber: '********',
    visibleCustomerNumber: '********',
    customer: hasCustomer
      ? sanitizeNestedCustomer(cleaned.customer)
      : (isInternalUser
        ? {
            customerNumber: '********',
            visibleCustomerNumber: '********',
            companyName: 'Kramp',
            isActive: true,
          }
        : cleaned.customer),
  };
};

export const sanitizeCustomer = (input: any) => {
  if (!input) return input;
  const raw = input?.toJSON ? input.toJSON() : input;

  return {
    ...raw,
    customerNumber: '********',
    visibleCustomerNumber: '********',
    user: raw.user ? sanitizeUser(raw.user) : raw.user,
  };
};
