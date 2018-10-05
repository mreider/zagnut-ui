<template>
  <div class="account" v-if="!$store.state.token">
    <login v-if="form === 'login'" :on-change-form="changeForm" />

    <forgot-password v-if="form === 'forgot'" :on-change-form="changeForm"/>

    <register v-if="form === 'register'" :on-change-form="changeForm"/>

    <reset-password v-if="form === 'reset'" :on-change-form="changeForm"/>
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
      form: 'login'
    };
  },

  mounted() {
    this.form = _get(this.$route, 'params.action', 'login');
    console.log('Account mounted:', this.form, this.$route);
  },
  methods: {
    changeForm(form) {
      this.$router.push({ name: 'account', params: {action: form}, query: this.$route.query });
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
      console.log('watched to:', to);
      this.form = _get(to, 'params.action', 'login', 'login');
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
