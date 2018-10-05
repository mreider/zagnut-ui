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

      <b-tab title="Organization">
        <div class="button-box right">
          <div>
            <b-btn variant="success" size="" v-b-modal.modalnew>➕ Add organization</b-btn>
            <b-modal id="modalnew"
                     title="New orgranization name"
                     @ok="handleOrganizationNew(newOrgName)"
                     size="sm"
                     centered
                     >
                <b-form-input v-model="newOrgName" placeholder="Enter orgranization name">></b-form-input>
            </b-modal>
          </div>
        </div>

        <b-table hover
          :items="organizations"
          :fields="organizationsFields"
          @row-clicked="handleOrganizationSelect"
        >
          <template slot="actions" slot-scope="data">
            <b-button variant="primary" size="sm" v-b-modal="modalId(data.item.id)+'edit'">🖉</b-button>
            <b-button variant="danger" size="sm" v-b-modal="modalId(data.item.id)+'del'" v-show="data.item.role === 'Admin'">✖</b-button>
            <b-modal :id="'modal' + data.item.id + 'del'"
                     :title="'Delete ' + data.item.name + '?'"
                     size="sm"
                     centered
                     ok-variant="danger"
                     @ok="handleOrganizationDelete(data.item)"
                     ok-title="delete"
                     >
            </b-modal>

            <b-modal :id="'modal' + data.item.id + 'edit'"
                     title="Edit"
                     size="sm"
                     centered
                     ok-variant="submit"
                     @ok="handleOrganizationEdit(data.item)"
                     ok-title="submit"
                     >
                <b-form-input v-model=data.item.name placeholder=data.item.name></b-form-input>
            </b-modal>

          </template>
        </b-table>
      </b-tab>

      <b-tab title="Users">
         <b-nav-item-dropdown :text="$store.state.organization.name" left>
          <b-dropdown-item href="#"
            v-for="org in $store.state.user.organizations"
            v-bind:key="org.id"
            @click="handleOrgChange(org)"
          >{{ org.name }}</b-dropdown-item>
        </b-nav-item-dropdown>
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
      newOrgName: '',
      saving: false,
      currentOrg: {}
    };
  },

  mounted () {
    this.handleTabChange(0);
  },

  computed: {
  },

  methods: {
    modalId(i) {
      return 'modal' + i;
    },
    loadCurrentOrg() {
      if (!this.currentOrg) {
        this.loadOrganization();
        this.currentOrg = this.organizations[0];
        return this.currentOrg;
      }
    },
    handleTabChange(index) {
      if (index === 0) {
        if (!this.profile.email) this.loadProfile();
      } else if (index === 1) {
        if (!this.organizations.length) this.loadOrganization();
      } else if (index === 2) {
        this.loadOrganization();
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
        this.apikey = _get(apiKeyResponse, 'data.apikey');

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

    async loadUsers(org) {
      this.$loading(true);

      this.$loading(false);
    },

    async handleProfileSubmit(event) {
      event.preventDefault();

      const data = {};
      let canSave = false;
      const keys = ['firstName', 'lastName', 'email', 'password', 'confirmation, id'];

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
        data.email = this.profile.email;
        console.log(data);
        const response = await this.axios.put('/api/user', data);
        console.log(response);
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
        const response = await this.axios.post('/api/user/apikey');
        console.log(response);
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to generate new api key.`);

        this.apikey = _get(response, 'data.apikey');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    handleOrganizationSelect(org) {
      this.organizations.forEach(o => { o._rowVariant = ''; });// todo change in api
      org._rowVariant = 'active success';
    },

    async handleOrganizationEdit(org) {
      console.log('Edit:', JSON.stringify(org));
      if (!org.name) {
        return this.$notify({group: 'error', type: 'err', text: 'Empty organization name field'});
      }
      try {
        // debugger;
        const response = await this.axios.post('/api/org/update', { name: String(org.name), orgid: String(org.id) });
        console.log(response);
        this.$notify({group: 'app', type: 'success', text: 'Organization updated'});
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update organization.`);
      } catch (error) {
        this.loadOrganization();
        return this.$errorMessage.show(error);
      } finally {
        // this.loadOrganization();
      }
    },

    async handleOrganizationDelete(org) {
      if (!org || !this.profile.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        const response = await this.axios.post('/api/org/delete', { userid: String(this.profile.id), orgid: String(org.id) });
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new organization.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrganization();
        this.$notify({group: 'app', type: 'success', text: 'Deleted'});
      }
    },

    async handleOrganizationNew(data) {
      // this.$loading(true);
      if (!data) {
        return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        const response = await this.axios.post('/api/org/new', {name: data});
        console.log(response);
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new organization.`);

        // this.apikey = _get(response, 'data.apikey');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrganization();
        this.newOrgName = '';
      }
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
