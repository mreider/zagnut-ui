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
