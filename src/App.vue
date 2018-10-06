<template>
  <b-container id="app">
    <div class="loading" v-if="$store.state.loading">
      <div class="vue-loading-msg">Loading ...</div>
    </div>

    <div class="notifications-container">
      <notifications group="error" width="500px" position="bottom right" />
      <notifications group="app" width="500px" position="bottom right" />
    </div>

    <div v-if="$store.state.token">
      <topbar></topbar>

      <b-container class="wrap">
        <!-- <sidebar /> -->
        <router-view/>
      </b-container>
    </div>

    <account v-if="!$store.state.token" />
  </b-container>
</template>

<script>
import { doLogout } from '@/utils';
import Topbar from './components/common/Topbar.vue';
// import Sidebar from './components/common/Sidebar.vue';
import Account from './components/account/Account.vue';
import { isCookieEnabled, getCookie } from 'tiny-cookie';
import _get from 'lodash/get';

export default {
  name: 'App',

  async mounted() {
    let token = this.$store.state.token;
    if (!token && isCookieEnabled()) token = getCookie('token');
    if (token) {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        let response = await this.axios.get('/api/user');
        const user = _get(response, 'data.user');

        if (user) {
          user.organization = _get(response, 'data.organization');
          const role = _get(response, 'data.role');
          user.role = role;
          if (role === 'Pending') user.organization.name = user.organization.name + ' (authorization pending)';
          this.$store.commit({type: 'user', user});
          this.$store.commit({type: 'token', token});
        } else {
          throw (new Error('Token invalid'));
        }
      } catch (error) {
        return doLogout(this);
      }
    } else {
      this.$router.push({ name: 'account', params: { action: 'login' }, query: this.$route.query });
    }

    this.axios.interceptors.response.use(response => {
      if (response.status === 403 || response.status === 401) {
        return doLogout(this);
      }
      return response;
    }, function (error) {
      return Promise.reject(error);
    });

    this.$loading(false);
  },

  data() {
    return {
    };
  },

  methods: {
  },

  sockets: {
  },

  components: {
    'topbar': Topbar,
    'account': Account
  }
};
</script>

<style lang="scss">
  #app {
    width: 100%;
    height: 100%;

    .notifications-container {
      position: fixed;
      top: 10px;
      right: 10px;
    }

    .loading, .vue-loading-msg {
      position: absolute;
      margin: 0;
      cursor: wait;
    }

    .loading {
      background-color: rgba(230, 233, 236, 0.8);
      opacity: 1;

      top: 0;
      left: 0;
      z-index: 9999;
      padding: 0;
      width: 100%;
      height: 100%;
      border: none;
      background-color: rgba(230,233,236,.8);
      transition: opacity .4s;

      .vue-loading-msg {
        box-sizing: content-box!important;
        z-index: 1001;
        padding: 0 35px;
        height: 40px;
        top: 20%;
        left: 50%;
        text-align: center;
        font-size: 14px;
        line-height: 40px;
        background-color: #f4f4f4;
        border-radius: 4px;
        box-shadow: 0 1px 8px rgba(0,0,0,.15);
        border: 1px solid #bbb;
        transform: translateX(-50%);
      }
    }
  }
</style>
