import Vue from 'vue';
import VueRouter from 'vue-router';
import { Socket, isLogged, Helper } from 'services';

import routes from './routes';

// import web_routes from 'web/routes';
// import web_b2b_routes from '../modules/web/b2b/routes';
// import web_b2c_routes from '../modules/web/b2c/routes';

Vue.use(VueRouter);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  });

  /** install module as routes */
  // Router.options.routes.push(...web_routes);
  // /** install module as children routes */
  // Router.options.routes[2].children = [];

  // Router.options.routes[2].children.push(...web_b2b_routes);
  // Router.options.routes[2].children.push(...web_b2c_routes);

  /** install module as routes */

  /** check if duplicate route exist */
  const paths = Router.options.routes.map((x) => x.path);
  const isDuplicate = new Helper().containDuplicate(paths);
  if (isDuplicate) {
    throw new Error('Duplicate route exist!');
  }

  /** check if duplicate children route exist */
  let childrens = [];
  for (let r of Router.options.routes) {
    if (r.children) childrens.push(...r.children);
  }
  const children_paths = childrens.map((x) => x.path);
  const isChildrenDuplicate = new Helper().containDuplicate(children_paths);
  if (isChildrenDuplicate) {
    throw new Error('Duplicate children route exist!');
  }

  /** reassign the routes */
  Router.addRoutes(Router.options.routes);

  Router.beforeEach((to, from, next) => {
    // if (!process.env.VUE_APP_NOT_CONNECT_SOCKET) {
    if (Socket.token()) Socket.connect(true);
    // }
    const authRequired = to.matched.some((route) => route.meta.auth);
    const authed = isLogged();
    if (authRequired && !authed) next('/login');
    else next();
  });
  return Router;
}
