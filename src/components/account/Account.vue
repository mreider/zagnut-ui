<template>
  <div class="account" v-if="!$store.state.token">
    <login v-if="form === 'login'" :on-change-form="changeForm" />

    <forgot-password v-if="form === 'forgot'" :on-change-form="changeForm"/>

    <register v-if="form === 'register'" :on-change-form="changeForm"/>
  </div>
</template>

<script>
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import Register from './Register';

export default {
  name: '',
  data() {
    return {
      form: 'login'
    };
  },

  mounted() {
    let action = this.$route.params.action;
    if (!action) action = 'login';

    this.form = action;
  },

  methods: {
    changeForm(form) {
      this.form = form;
    }
  },

  components: {
    'login': Login,
    'forgot-password': ForgotPassword,
    'register': Register
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
