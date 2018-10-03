<template>
  <div class="account" v-if="!$store.state.token">
    <login v-if="form === 'login'" :on-change-form="changeForm" />

    <forgot-password v-if="form === 'forgot'" :on-change-form="changeForm"/>

    <register v-if="form === 'register'" :on-change-form="changeForm"/>

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
  name: '',
  data() {
    return {
      form: 'login',
      token: null
    };
  },
  beforeCreate() {
  },
  mounted() {
    if (this.$route.name === 'ResetPassword') {
      this.form = _get(this.$router, 'params.action', 'reset-password');
      this.token = this.$route.query.token;
    } else {
      this.form = _get(this.$router, 'params.action', 'login');
      this.token = this.$route.query.token;
    }
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
      if (this.$route.name === 'ResetPassword') {
       // this.form = _get(to, 'params.action', 'reset-password');
       // console.log('сюда', to, from);
        this.$router.push({ name: 'reset-password' });
      } else {
       // this.form = _get(to, 'params.action', 'login', 'login');
       // console.log('туда', to, from);
      }
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
