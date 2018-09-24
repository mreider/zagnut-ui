<template>
  <div class="account" v-if="!$store.state.token">
    <login v-if="form === 'login'" :on-change-form="changeForm" />

    <forgot-password v-if="form === 'forgot'" :on-change-form="changeForm"/>

    <register v-if="form === 'register'" :on-change-form="changeForm"/>

    <reset-password v-if="form === 'reset'" :on-change-form="changeForm" :token="token"/>
  </div>
</template>

<script>
import _get from 'lodash/get';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import Register from './Register';
import ResetPassword from './ResetPassword';

export default {
  name: '',
  data() {
    return {
      form: 'login',
      token: null
    };
  },

  mounted() {
    this.form = _get(this.$router, 'params.action', 'login');
    this.token = this.$route.query.token;
  },

  methods: {
    changeForm(form) {
      this.form = form;
    }
  },

  components: {
    'login': Login,
    'forgot-password': ForgotPassword,
    'register': Register,
    'reset-password': ResetPassword
  },

  watch: {
    '$route' (to, from) {
      this.form = _get(to, 'params.action', 'login');
    }
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
