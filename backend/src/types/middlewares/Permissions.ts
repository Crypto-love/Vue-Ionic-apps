import { AuthenticationError } from 'apollo-server-express';
import { rule, shield, allow, and } from 'graphql-shield';
// import { populateStripeAccount, checkUserCountryForStripe } from './stripe';

const isAuthenticated = rule()((parent, args, { credential }) => {
  return credential !== null;
});

const isAdmin = rule()((parent, args, { credential }) => {
  return isAuthenticated && credential.userTypeId == 2;
});

const isSales = rule()((parent, args, { credential }) => {
  return isAuthenticated && credential.userTypeId == 7;
});

const isBuyer = rule()((parent, args, { credential }) => {
  return isAuthenticated && credential.userTypeId == 6;
});

const isBuyerB2C = rule()((parent, args, { credential }) => {
  return isAuthenticated && credential.userTypeId == 6 && credential.buyerType == 2;
});

// TODO: Remove stripe middleware
// const StripeMiddleware = and(isAuthenticated, checkUserCountryForStripe, populateStripeAccount);

export const permissions = shield(
  {
    Mutation: {
      addUser: allow,
      requestJWT: allow,
      signIn: allow,
      signInWithOTP: allow,
      // addStripeCard: StripeMiddleware,
      // removeStripeCard: StripeMiddleware,
      // setDefaultStripeCard: StripeMiddleware,
      updatePassword: allow
    },
    Query: {
      allCountries: allow,
      // listCustomerCard: StripeMiddleware,
      // getDefaultCard: StripeMiddleware,
      checkUser: allow,
      getUserByMobile: allow
    },
    Address: allow,
    AddressType: allow,
    Country: allow,
    Customer: allow,
    User: allow,
    Tenant: allow,
    TenantsIntegrationXero: allow,
    UserType: allow
  },
  {
    fallbackRule: isAuthenticated, // Default rule
    allowExternalErrors: true,
    fallbackError: new AuthenticationError('Not Authorized!')
  }
);
