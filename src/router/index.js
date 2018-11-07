import Vue from 'vue';
import Router from 'vue-router';

import Account from '@/components/account/Account';
import Home from '@/components/Home';
import Initiatives from '@/components/Initiatives';
import Ideas from '@/components/Ideas';
import Backlogs from '@/components/Backlogs';
import Items from '@/components/componentsBacklogs/items';
import Item from '@/components/componentsBacklogs/item';
import Bugs from '@/components/Bugs';
import Settings from '@/components/Settings';

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
      path: '/items',
      name: 'items',
      component: Items
    },
    {
      path: '/items/item',
      name: 'item',
      component: Item
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
    }
  ]
});
