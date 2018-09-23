<template>
  <div class="settings">
    <b-tabs @input="handleTabChange">
      <b-tab title="Profile" active>
        <b-form @submit="handleProfileSubmit">
          <b-row>
            <b-col md="6" sm="12">
              <b-form-group label="First Name">
                <b-form-input type="text" v-model="profile.firstName"></b-form-input>
              </b-form-group>
            </b-col>

            <b-col md="6" sm="12">
              <b-form-group label="Last Name">
                <b-form-input type="text" v-model="profile.lastName"></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col md="6" sm="12">
              <b-form-group label="Email">
                <b-form-input type="email" required v-model="profile.email"></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col md="6" sm="12">
              <b-form-group label="Password">
                <b-form-input type="password" v-model="profile.password"></b-form-input>
              </b-form-group>
            </b-col>

            <b-col md="6" sm="12">
              <b-form-group label="Confrmation">
                <b-form-input type="password" v-model="profile.confirmation"></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>

          <div class="button-box">
            <b-button type="submit" variant="primary" :disabled="saving">Save</b-button>
          </div>
        </b-form>

        <div class="api-key form-inline float-right">
          <label>API key</label>
          <b-form-input readonly v-model="apikey"></b-form-input>
          <b-button variant="warning" size="sm" @click="handleRegenerageApiKey" :disabled="saving">Regenerate</b-button>
        </div>

      </b-tab>

      <b-tab title="Organization" >
        <div class="button-box right">
          <b-button variant="success" size="" @click="handleOrganizationNew">➕ Add organization</b-button>
        </div>

        <b-table hover
          :items="organizations"
          :fields="organizationsFields"
          @row-clicked="handleOrganizationSelect"
        >
          <template slot="actions" slot-scope="data">
            <b-button variant="primary" size="sm" @click="handleOrganizationEdit(data.item)">🖉</b-button>
            <b-button variant="danger" size="sm" v-show="data.item.role === 'Admin'" @click="handleOrganizationDelete(data.item)">✖</b-button>
          </template>
        </b-table>
      </b-tab>

      <b-tab title="Users">
        Users
      </b-tab>

    </b-tabs>
  </div>
</template>

<script>
import _get from 'lodash/get';

export default {
  name: 'Settings',
  data() {
    return {
      organizationsFields: ['id', 'name', 'role', 'actions'],
      organizations: [],
      profile: {},
      profileOrig: {},
      apikey: null,
      users: [],

      saving: false
    };
  },

  mounted () {
    // this.handleTabChange(0);
  },

  computed: {
  },

  methods: {
    handleTabChange(index) {
      if (index === 0) {
        if (!this.profile.email) this.loadProfile();
      } else if (index === 1) {
        if (!this.organizations.length) this.loadOrganization();
      } else if (index === 2) {
        if (!this.users.length) this.loadUsers();
      }
    },

    async loadProfile() {
      this.$loading(true);

      try {
        const [userResponse, apiKeyResponse] = await Promise.all([
          this.axios.get('/api/user').catch(() => { return null; }),
          this.axios.get('/api/user/apikey').catch(() => { return null; })
        ]);

        let success = _get(userResponse, 'data.success');
        if (!success) this.$errorMessage.show('Unable to load current user profile');

        success = _get(apiKeyResponse, 'data.success');
        if (!success) this.$errorMessage.show('Unable to load current user API key');

        this.profile = _get(userResponse, 'data.user');
        this.apikey = _get(apiKeyResponse, 'data.apiKey');

        this.profileOrig = JSON.parse(JSON.stringify(this.profile));
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }

      this.$loading(false);
    },

    async loadOrganization() {
      this.$loading(true);

      try {
        const response = await this.axios.get('/api/user/orgs');

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const organizations = _get(response, 'data.organizations');
        organizations.forEach(o => {
          o._rowVariant = '';
        });

        this.organizations = organizations;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async loadUsers() {
      this.$loading(true);
      this.$loading(false);
    },

    async handleProfileSubmit(event) {
      event.preventDefault();

      const data = {};
      let canSave = false;
      const keys = ['firstName', 'lastName', 'email', 'password', 'confirmation'];

      keys.forEach(key => {
        if (this.profile[key] !== this.profileOrig[key]) {
          data[key] = this.profile[key];
          canSave = true;
        }
      });

      console.log('Data to save:', canSave, data);

      if (!canSave) return;

      if (data.password !== data.confirmation) {
        return this.$notify({group: 'error', type: 'warn', text: 'Password and confirmation does\'n match'});
      }

      if (data.hasOwnProperty('email') && !data.email) {
        return this.$notify({group: 'error', type: 'warn', text: 'Email cannot be empty'});
      }

      this.$loading(false);
      this.saving = true;

      try {
        const response = this.axios.put('/api/user', data);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to save user profile.`);

        this.$notify({group: 'app', type: 'success', text: 'Profile updated'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.saving = false;
        this.$loading(false);
      }
    },

    async handleRegenerageApiKey() {
      this.$loading(true);

      try {
        const response = this.axios.post('/api/user/apikey');

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to generate new api key.`);

        this.apikey = _get(response, 'data.apiKey');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    handleOrganizationSelect(org) {
      this.organizations.forEach(o => { o._rowVariant = ''; });
      org._rowVariant = 'active success';
    },

    handleOrganizationEdit(org) {
      console.log('Edit:', JSON.stringify(org));
    },

    handleOrganizationDelete(org) {
      console.log('Delete:', JSON.stringify(org));
    },

    handleOrganizationNew() {
      console.log('New organization');
    }
  },

  components: {
  }
};
</script>

<style lang="scss">
  .settings {
    .nav.nav-tabs {
      margin-bottom: 20px;

      .nav-item {
        .nav-link {
          font-size: 18px;
          padding: 16px 40px;
        }
      }
    }

    .tab-content {
      padding: 16px;

      .col-form-label {
        margin-bottom: 0;
        padding-bottom: 0;
      }

      input {
        padding-top: 10px;
        padding-bottom: 10px;
      }

      .api-key {
        label {
          margin-right: 10px;
        }

        .form-control {
          margin-right: 10px;
          padding-bottom: 4px;
          padding-top: 4px;
          height: 27px;
          width: 300px;
        }
      }
    }
  }
</style>
