import Vue from 'vue';
import { Notify } from 'quasar';
import { state } from './auth';
import config from 'src/config';

export const service = new services(config).connect();
export const Socket = {
  get: (name, where = null, column = null, order = null, limit = null, offset = null) =>
    service.sendSocket({
      method: 'get',
      name: name,
      columns: column,
      where: where,
      order: order,
      limit: limit,
      offset: offset
    }),
  add: (name, value) => service.sendSocket({ method: 'add', name: name, value: value }),
  run: (name, value) => service.sendSocket({ method: 'run', name: name, value: value }),
  upload: (name, value) => service.sendSocket({ method: 'upload', name: name, value: value }),
  update: (name, value, id) => service.sendSocket({ method: 'update', name: name, value: value, id: id }),
  exec: (name, parameter, db) =>
    service.sendSocket({ method: 'exec', name: name, parameter: parameter, db: db }),
  delete: (name) => service.sendSocket({ method: 'delete', name: name }),
  set: (data, newdata) => service.setDatas(data, newdata),
  connect: service.connect,
  token: service.token
};
export const Api = {
  raw: (obj) => service.sendApi(obj),
  get: (name, where = null, column = null, order = null, limit = null, offset = null) =>
    service.sendApi({
      method: 'get',
      name: name,
      columns: column,
      where: where,
      order: order,
      limit: limit,
      offset: offset
    }),
  add: (name, value) => service.sendApi({ method: 'add', name: name, value: value }),
  run: (name, value) => service.sendApi({ method: 'run', name: name, value: value }),
  upload: (name, value) => service.sendApi({ method: 'upload', name: name, value: value }),
  update: (name, value, id) => service.sendApi({ method: 'update', name: name, value: value, id: id }),
  exec: (name, parameter, db) =>
    service.sendApi({ method: 'exec', name: name, parameter: parameter, db: db }),
  delete: (name) => service.sendApi({ method: 'delete', name: name }),
  set: (data, newdata) => service.setDatas(data, newdata),
  post: (name, value) => service.sendApi({ method: 'post', name: name, value: value }), // It's basically the same as "add", well, sometimes, there are backend functions that is not proper if we use "add" as the method. Like sending emails for example, we're not adding anything.
  xero: (funcName, params = [], xeroTenantId = null) =>
    service.sendXeroApi({ funcName, params, xeroTenantId }) // only for xero oauth2
};

export const Notice = {
  ok: (message, timeout = 2000, actions = [], icon = 'eva-checkmark-outline') =>
    Notify.create({
      color: 'green',
      caption: 'Success!',
      position: 'top',
      message: message,
      timeout: timeout,
      icon: icon,
      actions: actions
    }),
  fail: (message, timeout = 2000, actions = [], icon = 'eva-close-outline') =>
    Notify.create({
      color: 'red',
      caption: 'Failure!',
      position: 'top',
      message: message,
      timeout: timeout,
      icon: icon,
      actions: actions
    }),
  warn: (message, timeout = 2000, actions = [], icon = 'eva-alert-triangle-outline') =>
    Notify.create({
      color: 'orange',
      caption: 'Warning!',
      position: 'top',
      message: message,
      timeout: timeout,
      icon: icon,
      actions: actions
    }),
  info: (message, timeout = 2000, actions = [], icon = 'eva-info-outline') =>
    Notify.create({
      color: 'blue',
      caption: 'Information!',
      position: 'top',
      message: message,
      timeout: timeout,
      icon: icon,
      actions: actions
    })
};

/* internal function */
function services(setting, second = 100) {
  let config, hostws, hostapi, pathws, secret, socket;
  let events = {};
  let timeout = second;
  this.setEvents = (name, data) => {
    events[name] = data;
  };
  this.removeEvents = (name) => {
    delete events[name];
  };
  this.token = () => {
    return token();
  };
  function token() {
    if (secret) return false;
    secret = state().token ? state().token : null;
    return secret && secret.length == 36;
  }

  function createSocket() {
    if (socket && socket.readyState === 1) return;
    token();
    if (!secret || secret.length != 36) throw new Error('Invalid token');
    pathws = `${hostws}?secret=${secret}`;
    socket = new WebSocket(pathws);
    socket.onopen = onopen;
    socket.onmessage = onmessage;
    socket.onerror = onerror;
    socket.onclose = (e) => {
      let callback = events['serverstatus'];
      /* sent server status as disconnected */
      if (callback && typeof callback === 'function') callback(false);
      if (!e.wasClean) createSocket();
    };
  }
  function onopen() {
    if (!config.production) Notice.info('Server connected!');
    let callback = events['serverstatus'];
    /* sent server status as connected */
    if (callback && typeof callback === 'function') callback(true);
  }
  function onmessage(e) {
    let data = JSON.parse(e.data);
    if (data.status) {
      let callback = events[data.name];
      if (callback && typeof callback === 'function') callback(data.data);
      Notice.info(`${data.message}`);
    }
  }
  function onerror(e) {
    if (!config.production) Notice.warn('No Connection!');
  }
  this.sendSocket = (data) => {
    if (socket && socket.readyState === 1) {
      socket.send(data);
    } else if (socket && socket.readyState === 0) {
      setTimeout(() => {
        setTimeout(() => socket.send(data), timeout * 2);
      }, timeout);
    } else {
      setTimeout(() => {
        createSocket();
        setTimeout(() => socket.send(data), timeout * 2);
      }, timeout);
    }
  };
  this.sendApi = async (body) => {
    try {
      token();
      let caller = await fetch(hostapi, {
        method: 'post',
        body: body != undefined ? JSON.stringify(body) : null,
        headers: secret
          ? {
              'Content-Type': 'application/json',
              secret: secret
            }
          : {
              'Content-Type': 'application/json'
            }
      });
      let result = await caller.json();
      result.data = loadImage(result.data);

      /** show message on status false from backend
       *   in development only
       */
      if (!result.status && !config.production) Notice.fail(result.message, 3000);

      return result;
    } catch (error) {
      /** show error message from backend
       *   in development only
       */
      if (!config.production) Notice.fail(error.message);

      if (error.message) return { status: false, message: `No Connection [${error.message}]`, data: [] };
    }
  };
  this.sendXeroApi = async ({ funcName, params, xeroTenantId = null }) => {
    try {
      token();

      const xero_tenant_id = xeroTenantId || state().xero_tenant_id;

      const body = {
        method: 'doesnt_matter', // Method is mandatory, but on xero oauth2, we don't really need it. Because we're just executing a function from the SDK
        name: 'x2_' + funcName,
        params,
        xero_tenant_id
      };

      let caller = await fetch(hostapi, {
        method: 'post',
        body: body != undefined ? JSON.stringify(body) : null,
        headers: secret
          ? {
              'Content-Type': 'application/json',
              secret: secret
            }
          : {
              'Content-Type': 'application/json'
            }
      });
      let result = await caller.json();

      /** show message on status false from backend
       *   in development only
       */
      if (!result.status && !config.production) Notice.fail(result.message, 3000);

      return result;
    } catch (error) {
      /** show error message from backend
       *   in development only
       */
      if (!config.production) Notice.fail(error.message);

      if (error.message)
        return {
          status: false,
          message: `No Connection [${error.message}]`,
          data: []
        };
    }
  };
  this.setDatas = (data, value, activeOnly = false) => {
    if (Array.isArray(data)) {
      if (data.length <= 0) {
        /* push all if empty */
        data.push(...value);
      } else {
        for (var i = 0; i < value.length; i++) {
          var j = data.findIndex((x) => x.id == value[i].id);
          /* update if exist */
          if (j >= 0) {
            /* remove inactive if data need active only*/
            if (activeOnly) {
              data.splice(j, 1);
            } else {
              Vue.set(data, j, value[i]);
            }
          } else {
            /* add new data */
            data.push(value[i]);
          }
        }
      }
    } else {
      data = value;
    }
  };
  this.connect = (isLogin = false) => {
    config = setting;
    if (!config) throw new Error('Invalid config');
    if (typeof config.production !== 'boolean') throw new Error('Invalid production config');
    if (!config.ws) throw new Error('Invalid websocket config');
    if (!config.api) throw new Error('Invalid api config');
    hostws = config.ws;
    hostapi = config.api;
    if (hostws.length < 17) throw new Error('Invalid websocket host');
    if (hostapi.length < 20) throw new Error('Invalid api host');
    if (isLogin) createSocket();
    return this;
  };
  this.delay = async (delayInms) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  };
}

export function loadImage(data) {
  let statics = config.production ? config.images : config.images_uat;
  if (data.length > 0) {
    for (var i = 0; i < data.length; i++) {
      for (var o in data[i]) {
        if (o.indexOf('image') === 0) {
          let filename = data[i][o];
          if (filename !== null) {
            data[i][o] = {
              large: `${statics}/large/${filename}.png`,
              medium: `${statics}/medium/${filename}.png`,
              small: `${statics}/small/${filename}.png`
            };
          }
        }
      }
    }
  }
  return data;
}

export function getImage(image) {
  let statics = config.production ? config.images : config.images_uat;
  if (image !== null) {
    return {
      large: `${statics}/large/${image}.png`,
      medium: `${statics}/medium/${image}.png`,
      small: `${statics}/small/${image}.png`
    };
  }
  return null;
}
