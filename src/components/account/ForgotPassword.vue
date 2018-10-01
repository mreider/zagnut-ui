<template>
  <b-form @submit="submit" class="forgot">
    <h2 class="center">Restore password<br/>for</h2>
    <h1 class="center">PM415</h1>

    <b-form-group>
      <b-form-input type="email" v-model="form.email" required placeholder="Email address">
      </b-form-input>
      <template slot="description">
        <a href="#" class="small float-right" @click="onChangeForm && onChangeForm('login')">Rembemer password?</a>
      </template>
    </b-form-group>

    <div class="button-box center">
      <b-button type="submit" variant="primary">Restore</b-button>
    </div>
  </b-form>
</template>

<script>
import _get from 'lodash/get';

export default {
  name: 'ForgotPassword',
  data() {
    return {
      form: {
        email: null
      }
    };
  },

  computed: {
  },

  methods: {
    async submit(event) {
      event.preventDefault();
      try {
        let response = await this.axios.post('http://localhost:3000/api/account/forgotpassword', this.form);
        const success = _get(response, 'data.success');
        const message = _get(response, 'data.message');
        this.$notify({group: 'app', type: success, text: message});
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
  .forgot {
    margin: auto;
    width: 300px;

    h1 {
      margin-bottom: 30px;
    }
  }
</style>
