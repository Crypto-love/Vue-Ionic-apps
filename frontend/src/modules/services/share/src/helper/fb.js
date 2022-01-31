import { facebook_app_id } from 'src/config';
export class FB {
  constructor() {
    this.userID = null;
    this.accessToken = null;
    this.email = null;
    this.firstName = null;
    this.lastName = null;

    this.loadFacebookSDK(document, 'script', 'facebook-jssdk').then(() => {
      this.initFacebook();
    });
  }

  // Reference: https://medium.com/@mrjohnkilonzi/a-simple-facebook-login-component-in-vue-js-5ee71997bb97
  async loadFacebookSDK(d, s, id) {
    var js;
    var fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  }

  async initFacebook() {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: facebook_app_id, //You will need to change this
        cookie: true, // This is important, it's not enabled by default,
        xfbml: true,
        version: 'v7.0'
      });
      window.FB.AppEvents.logPageView();
    };
  }

  async doLogin() {
    return new Promise((resolve, reject) => {
      window.FB.login(
        (response) => {
          if (response.authResponse) {
            const { userID, accessToken } = response.authResponse;
            this.userID = userID;
            this.accessToken = accessToken;
            return resolve(true);
          }
        },
        {
          scope: 'email,public_profile'
        }
      );
    });
  }

  getCredential() {
    return {
      userID: this.userID,
      accessToken: this.accessToken,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    };
  }

  async getGraphData() {
    return new Promise((resolve) => {
      window.FB.api(
        `/${this.userID}?fields=email,first_name,last_name&access_token=${this.accessToken}`,
        (response) => {
          const { email, first_name, last_name } = response;
          this.email = email;
          this.firstName = first_name;
          this.lastName = last_name;
          return resolve(response);
        }
      );
    });
  }

  async login() {
    return new Promise((resolve, reject) => {
      window.FB.getLoginStatus(async (response) => {
        const { status, authResponse } = response;
        if (status === 'connected') {
          // The user is logged in and has authenticated your app
          this.userID = authResponse.userID;
          this.accessToken = authResponse.accessToken;
          await this.getGraphData();
        } else {
          // The user isn't logged in to Facebook or not authorized this app.
          await this.doLogin();
          await this.getGraphData();
        }
        return resolve(this.getCredential());
      });
    });
  }

  async logout() {
    if (!this.accessToken) return true;
    return new Promise((resolve, reject) => {
      window.FB.logout((response) => {
        // user is now logged out
        this.userID = null;
        this.accessToken = null;
        this.email = null;
        this.firstName = null;
        this.lastName = null;
        return resolve(true);
      });
    });
  }
}
