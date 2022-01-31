import gql from 'graphql-tag';

export const getCollectionTypes = gql`
  query getCollectionTypes($active: Boolean) {
    getCollectionTypes(active: $active) {
      id
      name
      description
      active
    }
  }
`;
