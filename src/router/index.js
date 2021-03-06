import Vue from 'vue';
import Router from 'vue-router';

import Account from '@/components/account/Account';
import Home from '@/components/Home';
import Initiatives from '@/components/Initiatives';
import Backlogs from '@/components/Backlogs';
import Items from '@/components/componentsBacklogs/items';
import Item from '@/components/componentsBacklogs/item';
import Initiative from '@/components/componentsInitiative/initiative';
import Bugs from '@/components/Bugs';
import Search from '@/components/Search';
import Bug from '@/components/componentsBugs/Bug';
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
      path: '/initiative/',
      name: 'Initiative',
      component: Initiative
    },
    {
      path: '/bugs',
      name: 'bugs',
      component: Bugs
    },
    {
      path: '/bug/',
      name: 'bug',
      component: Bug
    },
    {
      path: '/search/',
      name: 'search',
      component: Search
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
});
