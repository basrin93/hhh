import Vue, {AsyncComponent, Component as _Component} from 'vue';
import VueRouter, {RouteConfig} from 'vue-router';
import Home from '../pages/Home.vue';
import SignIn from '../pages/SignIn.vue';
import container from '../inversify.config';
import {AuthService} from '../services/core/AuthService';

const authService: AuthService = container.get('AuthService');

Vue.use(VueRouter);

type Component =
    | {}
    | _Component<any, any, any, any>
    | AsyncComponent<any, any, any, any>;

let roleBasedComponent = async (
    component: Component,
    employeeRoles: Array<string>
): Promise<Component> => {
  const loggedUser = await authService.getUser();
  if (loggedUser == null) {
    await authService.login();
    return roleBasedComponent;
  } else if (authService.checkForRoles(loggedUser, employeeRoles)) {
    return component;
  }
  return import('../pages/errors/Forbidden.vue');
};

const routes: Array<RouteConfig> = [
  {
    path: '/home',
    name: 'home',
    meta: {
      title: 'Главная',
    },
    component: Home,
  },

  {
    path: '/',
    redirect: '/stock'
  },

  // {
  //   path: '/protected',
  //   name: 'protected',
  //   meta: {
  //     title: 'Защищённое действие',
  //   },
  //   component: async () =>
  //       await roleBasedComponent(import('../pages/Protected.vue'), [
  //         'A_Dotnet_service_admin',
  //       ]),
  // },
  // {
  //   path: '/private',
  //   name: 'private',
  //   meta: {
  //     title: 'Приватное действие',
  //   },
  //   component: () => import('../pages/Private.vue'),
  // },
  {
    path: '/signin',
    name: 'signin',
    component: SignIn,
    meta: {
      requiresAuth: false,
      title: 'Авторизация',
      lead: '',
    },
  },
  {
    path: '/stock',
    name: 'stock',
    meta: {
      title: 'Сток',
    },
    component: () => import('../Domains/Stock/Page/Stock.vue'),
  },
  {
    path: '/stock/:id',
    name: 'stock-details',
    meta: {
      title: 'Детали стока',
    },
    component: () => import('../Domains/StockDetails/Page/StockDetails.vue'),
  },
  {
    path: '/feed',
    name: 'feed',
    meta: {
      title: 'Лента событий',
    },
    component: () => import('../Domains/Feed/Page/Feed.vue'),
  },
  {
    path: '/:pathMatch(.)',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue')
  }
];

const router = new VueRouter({
  base: '/',
  routes,
  mode: 'history',
});

router.beforeEach(async (to, from, next) => {
  if (to.name === 'signin' || to.query.code || to.query.error) {
    return next();
  }

  const user = await authService.getUser();
  if (!user?.access_token) {
    await authService.login();
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  document.title = to?.meta?.title || 'ORII';
});

export default router;