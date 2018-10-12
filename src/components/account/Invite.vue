<template>
  <div class="invite">
    <h2 class="center">You are invited to join {{ organization }}</h2>

    <b-form @submit="handleRegister" class="register" v-if="form === 'register'">
      <div class="not-registered" v-if="!postRegister">
        <h5>Please create an account to accept invitation</h5>

        <b-row>
          <b-col md="6" sm="12">
            <b-form-group>
              <b-form-input type="text" v-model="register.firstName" placeholder="First Name"></b-form-input>
            </b-form-group>
          </b-col>

          <b-col md="6" sm="12">
            <b-form-group>
              <b-form-input type="text" v-model="register.lastName" placeholder="Last Name"></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6" sm="12">
            <b-form-group>
              <b-form-input type="email" required v-model="register.email" placeholder="Email" readonly ></b-form-input>
            </b-form-group>
          </b-col>

          <b-col md="6" sm="12">
            <b-form-group>
              <b-form-input type="text" required v-model="organization" placeholder="Organization" readonly ></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6" sm="12">
            <b-form-group>
              <b-form-input type="password" v-model="register.password" placeholder="Password"></b-form-input>
            </b-form-group>
          </b-col>

          <b-col md="6" sm="12">
            <b-form-group>
              <b-form-input type="password" v-model="register.confirmation" placeholder="Confrmation"></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row class="tos">
            <b-form-checkbox value="Y" v-model="register.tosAccepted">I accept <a href="#">Terms of Service</a> </b-form-checkbox>
        </b-row>

        <div class="button-box center">
          <b-button type="submit" variant="primary" :disabled="saving">Save</b-button>
          <a href="#" class="small" @click="toggleForm('login')">Already registered?</a>
        </div>
      </div>

      <div v-else>
        <p>Your invitation accepted and account created.
          Please check your inbox for verification email and <router-link tag="a" :to="{ name: 'account', params: { action: 'login' } }"><a>process to login</a></router-link></p>
      </div>
    </b-form>

    <b-form @submit="handleLogin" class="login" v-if="form === 'login'">
      <div class="not-logged-on" v-if="!postLogin">
        <h5>Please login to accept invitation</h5>

        <b-form-group>
          <b-form-input type="email" v-model="login.email" readonly required placeholder="Email address">
          </b-form-input>
        </b-form-group>

        <b-form-group>
          <b-form-input type="password" v-model="login.password" required placeholder="Password">
          </b-form-input>
        </b-form-group>

        <div class="button-box center">
          <b-button type="submit" variant="primary" :disabled="saving">Login</b-button>
          <a href="#" class="small" @click="toggleForm('register')">Not registered?</a>
        </div>
      </div>

      <div v-else>
        <p>Your invitation accepted.Process to <router-link tag="a" :to="{ name: 'home' }"><a>dashboard</a></router-link></p>
      </div>
    </b-form>
  </div>
</template>

<script>
import _get from 'lodash/get';
import { doLogin } from '@/utils';

export default {
  name: 'Invite',

  beforeCreate() {
  },

  mounted() {
    this.checkToken();
  },

  data() {
    return {
      register: {
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        password: undefined,
        confirmation: undefined,
        tosAccepted: false,
        token: null
      },

      login: {
        email: undefined,
        password: undefined,
        token: null
      },

      organization: null,

      postLogin: false,
      postRegister: false,

      saving: false,

      form: 'login'
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
          if (!success) throw new Error('Token invalid or expired');

          this.organization = _get(response, 'data.organization');

          this.login.email = _get(response, 'data.email');
          this.register.email = _get(response, 'data.email');

          this.login.token = token;
          this.register.token = token;
        } catch (error) {
          return this.$errorMessage.show(error);
        } finally {
          this.$loading(false);
        }
      }
    },

    async handleRegister(event) {
      event.preventDefault();

      try {
        let response = await this.axios.post('/api/account/register', this.register);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(_get(response, 'data.message', 'Unable to create account'));

        this.$notify({
          group: 'app',
          type: 'success',
          text: 'Your account created and invitation accepted, please check your inbox for confirmation email.'
        });

        this.postRegister = true;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async handleLogin(event) {
      event.preventDefault();

      try {
        let response = await this.axios.post('/api/account/login', this.login);
        const token = _get(response, 'data.token');
        const user = _get(response, 'data.user');

        this.$notify({
          group: 'app',
          type: 'success',
          text: 'Your invitation accepted.'
        });

        doLogin(this, token, user);

        this.postLogin = true;
      } catch (error) {
        this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    toggleForm() {
      this.form = (this.form === 'login') ? 'register' : 'login';
    }
  }
};
</script>

<style lang="scss">
  .invite {
    margin: auto;
    width: 500px;

    h1 {
      margin-bottom: 30px;
    }

    h5 {
      text-align: center;
      margin-top: 16px;
      margin-bottom: 16px;
    }

    .tos {
      margin-left: 0;
    }

    .registered {
      text-align: center;
    }
  }
</style>
