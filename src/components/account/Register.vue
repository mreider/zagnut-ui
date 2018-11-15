<template>
  <b-form @submit="handleSubmit" class="register">
    <h2 class="center">Welcome to</h2>
    <h1 class="center">PM415</h1>

    <div class="not-registered" v-if="!registered">
      <b-row>
        <b-col md="6" sm="12">
          <b-form-group>
            <b-form-input type="text" v-model="form.firstName" placeholder="First Name"></b-form-input>
          </b-form-group>
        </b-col>

        <b-col md="6" sm="12">
          <b-form-group>
            <b-form-input type="text" v-model="form.lastName" placeholder="Last Name"></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="6" sm="12">
          <b-form-group>
            <b-form-input type="email" required v-model="form.email" placeholder="Email" :readonly="invited"></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="6" sm="12">
          <b-form-group>
            <b-form-input type="password" v-model="form.password" placeholder="Password"></b-form-input>
          </b-form-group>
        </b-col>

        <b-col md="6" sm="12">
          <b-form-group>
            <b-form-input type="password" v-model="form.confirmation" placeholder="Confrmation"></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="6" sm="12">
          <b-form-group>
            <b-form-input type="text" required v-model="form.organization" placeholder="Organization" :readonly="invited"></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>

      <b-row class="tos">
          <b-form-checkbox value="Y">I accept <a href="#" class="small" @click="openTerms">Terms of Service</a> </b-form-checkbox>
      </b-row>

      <div class="button-box center">
        <b-button type="submit" variant="primary" :disabled="saving">Save</b-button>
        <a href="#" class="small" @click="onChangeForm && onChangeForm('login')">Already registered?</a>
      </div>
    </div>

    <div class="registered" v-if="registered">
      <h3>Thank you for regstration</h3>
      <h4>Please check your inbox for verification email and <router-link tag="a" to="/account/login"><a>process to login</a></router-link>.</h4>
    </div>

  </b-form>
</template>

<script>
import _get from 'lodash/get';

export default {
  name: 'Register',

  beforeCreate() {
  },

  mounted() {
    this.checkToken();
  },

  data() {
    return {
      form: {
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        password: undefined,
        confirmation: undefined,
        organization: undefined,
        tosAccepted: false
      },

      saving: false,

      registered: false,

      invited: false
    };
  },

  methods: {
    async checkToken() {
      const token = this.$route.query.token;

      if (!token) return;

      if (token) {
        this.invited = true;

        this.$loading(true);

        try {
          const response = await this.axios.get('/api/org/invite', { params: { token } });

          const success = _get(response, 'data.success');
          if (!success) throw new Error('Token iinvalid or expired');

          this.form.organization = _get(response, 'data.organization');
          this.form.email = _get(response, 'data.email');
          this.form.token = token;
        } catch (error) {
          return this.$errorMessage.show(error);
        } finally {
          this.$loading(false);
        }
      }
    },
    openTerms() {
      window.open('../static/PM415TERMSANDCONDITIONS.html', '_blank');
    },
    async handleSubmit(event) {
      event.preventDefault();

      try {
        let response = await this.axios.post('/api/account/register', this.form);

        const success = _get(response, 'data.userId');
        if (!success) throw new Error(_get(response, 'data.message', 'Unable to create account'));

        this.$notify({group: 'app', type: 'success', text: 'Your account created, please check your inbox for confirmation email.'});

        this.registered = true;
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
  .register {
    margin: auto;
    width: 500px;

    h1 {
      margin-bottom: 30px;
    }

    .tos {
      margin-left: 0;
    }

    .registered {
      text-align: center;
    }
  }
</style>
