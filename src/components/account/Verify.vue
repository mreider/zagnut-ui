<template>
  <b-form @submit="handlelogin" class="verify col-lg-4 col-md-8 col-sm-12 col-xs-12">
    <h1 class="center">{{ message }}</h1>

    <div class="button-box center" v-if="showLoginButton === true">
      <b-button type="submit" variant="primary">Login</b-button>
    </div>
  </b-form>
</template>

<script>
import _get from 'lodash/get';
import { isCookieEnabled, getCookie } from 'tiny-cookie';

export default {
  name: 'Verify',

  async mounted() {
    let userToken = this.$store.state.token;
    if (!userToken && isCookieEnabled()) userToken = getCookie('token');
    if (userToken) {
      this.$router.replace('/');
    };

    await this.checkToken();
  },

  data() {
    return {
      message: '',
      showLoginButton: false
    };
  },

  methods: {
    handlelogin () {
      this.$router.push({ name: 'account', params: { action: 'login' } });
    },
    async checkToken() {
      const token = this.$route.query.token;
      if (!token) return;

      if (token) {
        this.invited = true;
        // this.$loading(true);

        try {
          const response = await this.axios.get('/api/account/verify', { params: { token } });
          const success = _get(response, 'data.success');
          this.message = _get(response, 'data.message');
          if (!success) {
            this.showLoginButton = false;
            throw new Error(this.message);
          } else {
            this.showLoginButton = true;
          }
        } catch (error) {
          return this.$errorMessage.show(error);
        } finally {
          // this.$loading(false);
        }
      }
    }
  },

  props: {
    onChangeForm: Function
  }
};
</script>

<style lang="scss">
  .verify {
    margin: auto;
    // width: 300px;
    h1 {
      margin-bottom: 30px;
    }
  }
</style>
