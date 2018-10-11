<template>
  <div class="account" v-if="!$store.state.token">
    <login v-if="form === 'login'" :on-change-form="changeForm" />

    <forgot-password v-if="form === 'forgot'" :on-change-form="changeForm"/>

    <register v-if="form === 'register' || form === 'invite'" :on-change-form="changeForm" :token="token"/>

    <reset-password v-if="form === 'reset-password'" :on-change-form="changeForm" :token="token"/>

  </div>
</template>

<script>
import _get from 'lodash/get';

import Login from './Login';
import ForgotPassword from './ForgotPassword';
import Register from './Register';
import ResetPassword from './ResetPassword';

export default {
  name: 'Account',

  data() {
    return {
      form: 'login',
      token: null
    };
  },

  mounted() {
    this.form = _get(this.$route, 'params.action', 'login');
  },

  methods: {
    changeForm(form) {
      this.$router.push({ name: 'account', params: { action: form } });
    }
  },

  watch: {
    '$route' (to, from) {
      this.form = _get(to, 'params.action', 'login', 'login');
    }
  },

  components: {
    'login': Login,
    'forgot-password': ForgotPassword,
    'register': Register,
    'invite': Register,
    'reset-password': ResetPassword
  }
};
</script>

<style lang="scss">
  .account {
    margin-top: 200px;
    .button-box {
      &> a {
        margin-left: 16px;
      }
    }
  }
</style>
