import gql from 'graphql-tag';

export const mutationChooseHub = gql`
  mutation joinHub($hubId: Int!, $appMode: String!) {
    joinHub(hub_id: $hubId, appMode: $appMode)
  }
`;
//
