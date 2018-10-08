import Vue from 'vue';
import Router from 'vue-router';

import Account from '@/components/account/Account';
import ResetPassword from '@/components/account/ResetPassword';
import ForgotPassword from '@/components/account/ForgotPassword';
import Home from '@/components/Home';
import Initiatives from '@/components/Initiatives';
import Ideas from '@/components/Ideas';
import Backlogs from '@/components/Backlogs';
import Bugs from '@/components/Bugs';
import Settings from '@/components/Settings';
import Register from '@/components/account/Register';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/account/:action',
      name: 'account',
      component: Account
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPassword
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: ResetPassword
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/initiatives',
      name: 'initiatives',
      component: Initiatives
    },
    {
      path: '/ideas',
      name: 'ideas',
      component: Ideas
    },
    {
      path: '/backlogs',
      name: 'backlogs',
      component: Backlogs
    },
    {
      path: '/bugs',
      name: 'bugs',
      component: Bugs
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '/invitelink',
      name: 'RegisterInvite',
      component: Register
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    }
  ]
});
