import gql from 'graphql-tag';

export const getGroups = gql`
  query getGroups($active: Boolean) {
    getGroups(active: $active) {
      id
      name
      description
      active
    }
  }
`;
