<template>
  <b-form @submit="submit" class="reset-password">
    <h2 class="center">Set new password<br/>for</h2>
    <h1 class="center">PM415</h1>
    <b-form-group>
      <b-form-input type="password" v-model="form.password" required placeholder="Password">
      </b-form-input>
    </b-form-group>

    <b-form-group>
      <b-form-input type="password" v-model="form.confirmation" required placeholder="Confirmation">
      </b-form-input>
    </b-form-group>

    <div class="button-box center">
      <b-button type="submit" variant="primary">Set password</b-button>
    </div>
  </b-form>
</template>

<script>
import _get from 'lodash/get';

export default {
  name: 'ResetPassword',

  mounted() {
    const token = this.$route.query.token;

    if (!token) {
      this.$notify({group: 'error', type: 'warn', text: 'Token invalid or missing'});
      this.$router.push({ name: 'account', params: { action: 'forgot' } });
    }
    this.form.token = token;
  },

  data() {
    return {
      form: {
        password: null,
        confirmation: null,
        token: null
      }
    };
  },

  methods: {
    async submit(event) {
      event.preventDefault();
      try {
        let response = await this.axios.post('/api/account/changepassword', this.form);
        const success = _get(response, 'data.success');
        const message = _get(response, 'data.message', 'Unable to set new password');
        if (!success) {
          this.$notify({group: 'app', type: success, text: message});
        } else {
          this.$notify({group: 'app', type: success, text: `Your password was changed.`});
          this.$router.push({ name: 'account', params: { action: 'login' } });
        }
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    }
  },

  props: {
    onChangeForm: Function
  }
};
</script>

<style lang="scss">
  .reset-password {
    margin: auto;
    width: 300px;
    h1 {
      margin-bottom: 30px;
    }
  }
</style>
