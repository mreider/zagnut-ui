import Vue from 'vue';
import Vuex from 'vuex';
import _get from 'lodash/get';

Vue.use(Vuex);

export default new Vuex.Store({
  struct: true,

  state: {
    token: null,
    user: null,
    organization: {},
    loading: true
  },

  mutations: {
    token(state, payload) {
      state.token = payload.token;
    },

    user(state, payload) {
      state.user = payload.user;

      const organization = _get(payload, 'user.organization') || _get(payload, 'user.organizations[0]');

      if (organization) {
        state.organization.id = organization.id;
        state.organization.name = organization.name;
      }
    },

    organization(state, payload) {
      state.organization.name = payload.name;
      state.organization.id = payload.id;
    },

    loading (state, payload) {
      state.loading = payload.loading;
    }
  },

  actions: {
  }
});
