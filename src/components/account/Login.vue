<template>
  <b-form @submit="submit" class="login col-lg-4 col-md-8 col-sm-12 col-xs-12">
    <h2 class="center">Welcome to</h2>
    <h1 class="center">PM415</h1>

    <b-form-group>
      <b-form-input type="email" v-model="form.email" required placeholder="Email address"></b-form-input>
    </b-form-group>

    <b-form-group>
      <b-form-input type="password" v-model="form.password" required placeholder="Password"></b-form-input>
      <template slot="description">
        <a
          href="#"
          class="small float-right"
          @click="onChangeForm && onChangeForm('forgot')"
        >Forgot password?</a>
      </template>
    </b-form-group>

    <div class="button-box center">
      <b-button type="submit" variant="primary">Login</b-button>
      <a href="#" class="small" @click="onChangeForm && onChangeForm('register')">Not registered?</a>
    </div>
  </b-form>
</template>

<script>
import _get from "lodash/get";
import { doLogin } from "@/utils";

export default {
  name: "Login",
  data() {
    return {
      form: {
        email: null,
        password: null
      }
    };
  },

  methods: {
    async submit(event) {
      event.preventDefault();

      try {
        let response = await this.axios.post("/api/account/login", this.form);
        const token = _get(response, "data.token");
        const user = _get(response, "data.user");

        doLogin(this, token, user);
      } catch (error) {
        this.$errorMessage.show(error);
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
.login {
  margin: auto;
  // width: 300px;
  h1 {
    margin-bottom: 30px;
  }
}
</style>
