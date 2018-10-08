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
          <b-form-input readonly v-model="profile.apiKey"></b-form-input>
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
                <b-form-input v-model="newOrgName" placeholder="Enter organization name">></b-form-input>
            </b-modal>
          </div>
        </div>

        <b-table hover
          :items="organizations"
          :fields="organizationsFields"
          @row-clicked="handleOrganizationSelect"
        >
          <template slot="actions" slot-scope="data">
            <b-button variant="primary" size="sm" v-b-modal="modalId(data.item.orgId, 'edit')" v-if="data.item.role === 'Admin'">🖉</b-button>
            <b-button variant="danger" size="sm" v-b-modal="modalId(data.item.orgId, 'del')" v-if="data.item.role === 'Admin'">✖</b-button>
            <b-modal :id="modalId(data.item.orgId, 'del')"
                     :title="'Delete ' + data.item.name + '?'"
                     size="sm"
                     centered
                     ok-variant="danger"
                     @ok="handleOrganizationDelete(data.item)"
                     ok-title="delete"
                     >
            </b-modal>

            <b-modal :id="modalId(data.item.orgId, 'edit')"
                     title="Edit"
                     size="sm"
                     centered
                     ok-variant="submit"
                     @ok="handleOrganizationEdit(data.item)"
                     ok-title="submit"
                     >
                <b-form-input v-model=data.item.name placeholder="data.item.name"></b-form-input>
            </b-modal>
          </template>
        </b-table>
      </b-tab>

      <b-tab title="Users">
          <b-dropdown :text="currentOrg" class="m-2" split size="sm" left>
          <b-dropdown-item
            v-for="org in organizations" v-if="organizations"
            v-bind:key="org.orgId"
            @click="OrgChange(org)"
          >{{ org.name }}</b-dropdown-item>
          </b-dropdown>

          <b-table hover
          :items="users"
          :fields="usersFields"
          @row-clicked="handleUserSelect">
            <template slot="item" slot-scope="data" v-html="item.value">
            </template>
          </b-table>
      </b-tab>

    </b-tabs>
  </div>
</template>

<script>
import _get from 'lodash/get';
import { switchOrganization, doLogout } from '@/utils';

export default {

  name: 'Settings',

  data() {
    return {
      organizationsFields: ['orgId', 'name', 'role', 'actions'],
      organizations: [],

      profile: {},

      users: [],
      usersFields: ['id', 'email', 'role', 'first_name', 'last_name', 'is_active'],
      newOrgName: '',
      saving: false,
      currentOrg: 'Organization'
    };
  },

  mounted () {
  },

  methods: {
    modalId(i, postfix) {
      return `modal-${i}-${postfix}`;
    },

    handleTabChange(index) {
      if (index === 0) {
        if (!this.profile.email) this.loadProfile();
      } else if (index === 1) {
        if (!this.organizations.length) this.loadOrganizations();
      } else if (index === 2) {
        this.loadOrganizations();
      }
    },

    async loadProfile() {
      this.$loading(true);

      try {
        const response = await this.axios.get('/api/user');

        let success = _get(response, 'data.success');
        if (!success) this.$errorMessage.show('Unable to load current user profile');

        this.profile = _get(response, 'data.user');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }

      this.$loading(false);
    },

    async loadOrganizations() {
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
      if (org) {
        try {
          this.$loading(true);
          const response = await this.axios.get(`/api/org/${org.orgId}/users`);

          const success = _get(response, 'data.success');
          if (!success) throw new Error(`Unable to load user's organizations.`);

          const users = _get(response, 'data.users');
          users.forEach(u => { u._rowVariant = ''; });

          this.users = users;
        } catch (error) {
          return this.$errorMessage.show(error);
        } finally {
          this.currentOrg = org.name;
          this.$loading(false);
        }
      }
    },

    async OrgChange(org) {
      this.$loading(true);
      try {
        await switchOrganization(this, org.orgId, true);
      } catch (error) {
        this.$loading(false);
        return this.$errorMessage.show(error);
      };
      this.loadUsers(org);
      this.$loading(false);
    },

    async handleProfileSubmit(event) {
      event.preventDefault();

      if (this.profile.password !== this.profile.confirmation) {
        return this.$notify({group: 'error', type: 'warn', text: 'Password and confirmation does\'n match'});
      }

      if (this.profile.hasOwnProperty('email') && !this.profile.email) {
        return this.$notify({group: 'error', type: 'warn', text: 'Email cannot be empty'});
      }

      this.$loading(false);
      this.saving = true;

      try {
        const response = await this.axios.put('/api/user', {
          firstName: this.profile.firstName,
          lastName: this.profile.lastName,
          email: this.profile.email,
          password: this.profile.password,
          confirmation: this.profile.confirmation
        });

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to save user profile.`);

        this.$notify({group: 'app', type: 'success', text: 'Profile updated'});

        const shouldLogout = _get(response, 'data.doLogout');
        if (shouldLogout) {
          doLogout(this);
        }
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
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to generate new api key.`);

        this.profile.apiKey = _get(response, 'data.apiKey');

        return this.$notify({group: 'error', type: 'success', text: 'New API key was created. Do not remember to update it everywhere.'});
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

    handleUserSelect(user) {
      // this.users.forEach(u => { u._rowVariant = ''; });
      if (this.$store.state.user.id === user.id) {
        user._rowVariant = '';
        return;
      };
      if (user._rowVariant === 'active success') {
        user._rowVariant = '';
      } else {
        user._rowVariant = 'active success';
      };
    },

    async handleOrganizationEdit(org) {
      if (!org.name) {
        return this.$notify({group: 'error', type: 'err', text: 'Empty organization name field'});
      }

      try {
        this.$loading(true);

        const response = await this.axios.put(`/api/org/${org.orgId}`, { name: org.name });

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update organization.`);

        this.$notify({group: 'app', type: 'success', text: 'Organization updated'});
        this.loadOrganizations();
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async handleOrganizationDelete(org) {
      if (!org || !this.profile.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        const response = await this.axios.post('/api/org/delete', { userid: this.profile.id, organizationId: org.orgId });
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new organization.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrganizations();
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
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new organization.`);

        // this.apiKey = _get(response, 'data.apiKey');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrganizations();
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
