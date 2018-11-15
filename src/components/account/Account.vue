<template>
  <div class="account" v-if="!$store.state.token">
    <login v-if="form === 'login'" :on-change-form="changeForm" />

    <forgot-password v-if="form === 'forgot'" :on-change-form="changeForm"/>

    <register v-if="form === 'register'" :on-change-form="changeForm"/>

    <reset-password v-if="form === 'reset-password'" :on-change-form="changeForm"/>

    <verify v-if="form === 'verify'" :on-change-form="changeForm"/>

    <invite v-if="form === 'invite'"/>

  </div>
</template>

<script>
import _get from 'lodash/get';

import Login from './Login';
import ForgotPassword from './ForgotPassword';
import Register from './Register';
import ResetPassword from './ResetPassword';
import Verify from './Verify';
import Invite from './Invite';

export default {
  name: 'Account',

  data() {
    return {
      form: 'login',
      token: null
    };
  },

  mounted() {
    if (this.$route.path.indexOf('account/invite') !== -1 && this.$store.state.token) {
      this.$store.commit({ type: 'token', token: null });
    }
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
    'reset-password': ResetPassword,
    'verify': Verify,
    'invite': Invite
  }
};
</script>

<style lang="scss">
  .account {
    margin-top: 150px;
    .button-box {
      &> a {
        margin-left: 16px;
      }
    }
  }
</style>
