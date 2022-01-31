import gql from 'graphql-tag';

export const getDays = gql`
  query getDays($active: Boolean) {
    getDays(active: $active) {
      id
      name
      description
      active
    }
  }
`;
