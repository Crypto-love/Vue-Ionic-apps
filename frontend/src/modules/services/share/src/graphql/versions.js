import gql from 'graphql-tag';

export const getVersions = gql`
  query getVersions {
    getVersions {
      id
      version
      android
      ios
      web
    }
  }
`;
