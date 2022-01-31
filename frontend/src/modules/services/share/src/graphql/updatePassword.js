import gql from 'graphql-tag';

export const getUserByMobile = gql`
  query getUserByMobile($mobile: String!, $otp: String) {
    getUserByMobile(mobile: $mobile, otp: $otp) {
      id
      mobile
    }
  }
`;
export const updatePassword = gql`
  mutation updatePassword($userId: Int!, $password: String!) {
    updatePassword(userId: $userId, password: $password) {
      id
      first_name
      last_name
      mobile
    }
  }
`;

export const checkOldPassword = gql`
  query checkOldPassword($password: String!) {
    checkOldPassword(password: $password) {
      id
    }
  }
`;
