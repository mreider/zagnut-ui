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
          <b-btn variant="success" size="sm" v-b-modal.modalinvite>➕invite link</b-btn>
            <b-modal id="modalinvite"
                     title="Invite link generate"
                     centered
                     >
                   <b-dropdown :text="currentOrg" class="m-2" split size="sm" left>
                   <b-dropdown-item
                    v-for="org in organizations" v-if="organizations"
                    v-bind:key="org.id"
                    @click="OrgChange(org)"
                    >{{ org.menuName }}</b-dropdown-item>
                   </b-dropdown>
                <b-form-input v-model="inviteuseremail" placeholder="email@email.mail">></b-form-input>
                <b-form-input v-model="inviteuserelink"></b-form-input>
                <div class="button-box">
                  <b-button type="submit" size="sm" variant="primary" @click="handleGenerateLink(false)">generate link</b-button>
                  <b-button type="submit" size="sm" variant="primary" @click="handleGenerateLink(true)">send link</b-button>
                </div>
            </b-modal>
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
          <b-dropdown :text="currentOrg" class="m-2" split size="sm" left>
          <b-dropdown-item
            v-for="org in organizations" v-if="organizations"
            v-bind:key="org.id"
            @click="OrgChange(org)"
          >{{ org.menuName }}</b-dropdown-item>
          </b-dropdown>
          <b-dropdown id="Actions" text="Action" size="sm" class="m-2" right>
            <b-dropdown-item id="resetPassword" @click="handleResetPassword()"> Reset password </b-dropdown-item>
            <b-dropdown-item id="granAdmin" @click="handleGranAdmin()"> Grant admin </b-dropdown-item>
            <b-dropdown-item id="hevokeAdmin" @click="handleRevokeAdmin()"> Revoke admin </b-dropdown-item>
            <b-dropdown-item id="removeFromOrganization" @click="handleRemoveFromOrganization()"> Remove from org </b-dropdown-item>
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
import { switchOrganization } from '@/utils';

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
      usersFields: ['id', 'email', 'role', 'first_name', 'last_name', 'is_active'],
      newOrgName: '',
      saving: false,
      currentOrg: 'Organization',
      inviteuseremail: '',
      inviteuserelink: ''
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
    handleTabChange(index) {
      if (index === 0) {
        if (!this.profile.email) this.loadProfile();
        if (!this.organizations.length) this.loadOrganization();
      } else if (index === 1) {
        if (!this.organizations.length) this.loadOrganization();
      } else if (index === 2) {
        if (!this.organizations.length) this.loadOrganization();
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
    async OrgChange(org) {
      this.$loading(true);
      try {
        await switchOrganization(this, org.id, false);
      } catch (error) {
        this.$loading(false);
        return this.$errorMessage.show(error);
      };
      this.loadUsers(org);
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
        organizations.forEach(o => {
          o.menuName = o.name;
          if (o.role === 'Pending') {
            o.menuName = o.name + ' (authorization pending)';
          }
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
          const response = await this.axios.get('/api/org/users/' + String(org.id));
          const success = _get(response, 'data.success');
          if (!success) throw new Error(`Unable to load user's organizations.`);
          const users = _get(response, 'data.users');
          users.forEach(u => {
            u._rowVariant = '';
          });
          this.users = users;
        } catch (error) {
          this.$loading(false);
          return this.$errorMessage.show(error);
        } finally {
          this.currentOrg = org.name;
          this.$loading(false);
        }
      }
    },

    async handleProfileSubmit(event) {
      event.preventDefault();

      const data = {};
      let canSave = false;
      const keys = ['firstName', 'lastName', 'email', 'password', 'confirmation', 'id'];

      keys.forEach(key => {
        if (this.profile[key] !== this.profileOrig[key]) {
          data[key] = this.profile[key];
          canSave = true;
        }
      });

      if (!canSave) return;
      if (!data.confirmation && !data.password) {
        delete data.password;
        delete data.confirmation;
      }
      console.log(data.confirmation, data.password);
      if (data.hasOwnProperty('email') && !data.email) {
        return this.$notify({group: 'error', type: 'warn', text: 'Email cannot be empty'});
      }

      this.$loading(false);
      this.saving = true;

      try {
        data.email = this.profile.email;
        const response = await this.axios.put('/api/user', data);
        const success = _get(response, 'data.success');
        console.log(response.data);
        if (!success) throw new Error(_get(response, 'data.message'));

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
      this.organizations.forEach(o => { o._rowVariant = ''; });
      org._rowVariant = 'active success';
    },
    handleUserSelect(user) {
      // this.users.forEach(u => { u._rowVariant = ''; });
      if (String(this.$store.state.user.id) === String(user.id)) {
        user._rowVariant = '';
        return;
      };
      if (user._rowVariant === 'active success') {
        user._rowVariant = '';
      } else {
        user._rowVariant = 'active success';
      };
    },

    async handleResetPassword() {
      let usersToResetPassword = [];
      this.users.forEach(u => {
        if (u._rowVariant === 'active success') {
          usersToResetPassword.push(String(u.id));
        };
      });
      if (usersToResetPassword.length > 0) {
        let data = {};
        data.usersid = usersToResetPassword;
        try {
        // debugger;
          const response = await this.axios.post('/api/org/resetpassword/users', data);
          this.$notify({group: 'app', type: 'success', text: 'Passwords reset, letters sent'});
          const success = _get(response, 'data.success');
          if (!success) throw new Error(`Unable to reset passwords`);
        } catch (error) {
          // this.loadUsers();
          return this.$errorMessage.show(error);
        } finally {
          // this.loadUsers();
        }
      }
    },

    async handleOrganizationEdit(org) {
      if (!org.name) {
        return this.$notify({group: 'error', type: 'err', text: 'Empty organization name field'});
      }
      try {
        // debugger;
        const response = await this.axios.post('/api/org/update', { name: String(org.name), organizationId: String(org.id) });
        this.$notify({group: 'app', type: 'success', text: 'Organization updated'});
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update organization.`);
      } catch (error) {
        this.loadOrganization();
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrganization();
      }
    },

    async handleOrganizationDelete(org) {
      if (!org || !this.profile.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        const response = await this.axios.post('/api/org/delete', { userid: String(this.profile.id), organizationId: String(org.id) });
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new organization.`);
        console.log(response);
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
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new organization.`);

        // this.apikey = _get(response, 'data.apikey');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrganization();
        this.newOrgName = '';
      }
    },
    async handleGranAdmin(data) {
      let usersToGranAdmin = [];
      this.users.forEach(u => {
        if (u._rowVariant === 'active success') {
          usersToGranAdmin.push(String(u.id));
        };
      });
      if (usersToGranAdmin.length > 0) {
        let data = {};
        data.usersid = usersToGranAdmin;
        try {
        // debugger;
          const response = await this.axios.post('/api/org/changerole/admin/users', data);
          this.$notify({group: 'app', type: 'success', text: 'Administrator rights granted'});
          const success = _get(response, 'data.success');
          if (!success) throw new Error(`Unable to grant admin`);
        } catch (error) {
          this.loadUsers(this.$store.state.organization);
          return this.$errorMessage.show(error);
        } finally {
          this.loadUsers(this.$store.state.organization);
        }
      }
    },

    async handleRevokeAdmin(data) {
      this.$loading(true);
      let usersToRevokeAdmin = [];
      this.users.forEach(u => {
        if (u._rowVariant === 'active success') {
          usersToRevokeAdmin.push(String(u.id));
        };
      });
      if (usersToRevokeAdmin.length > 0) {
        let data = {};
        data.usersid = usersToRevokeAdmin;
        try {
        // debugger;
          const response = await this.axios.post('/api/org/changerole/member/users', data);
          this.$notify({group: 'app', type: 'success', text: 'Administrator rights removed'});
          const success = _get(response, 'data.success');
          if (!success) throw new Error(`Unable to remove admin rights`);
        } catch (error) {
          this.loadUsers(this.$store.state.organization);
          return this.$errorMessage.show(error);
        } finally {
          this.loadUsers(this.$store.state.organization);
        }
      }
    },

    async handleRemoveFromOrganization(data) {
      let usersToRemoveFromOrg = [];
      this.users.forEach(u => {
        if (u._rowVariant === 'active success') {
          usersToRemoveFromOrg.push(String(u.id));
        };
      });
      if (usersToRemoveFromOrg.length > 0) {
        let data = {};
        data.usersid = usersToRemoveFromOrg;
        try {
        // debugger;
          const response = await this.axios.post('/api/org/delete/users', data);
          const success = _get(response, 'data.success');
          if (success === false) this.$notify({group: 'error', type: 'err', text: 'Unable to delete users'});
          if (success === true) this.$notify({group: 'app', type: 'success', text: 'Deleted'});
        } catch (error) {
          this.loadUsers(this.$store.state.organization);
          // return this.$errorMessage.show(error);
        } finally {
          this.loadUsers(this.$store.state.organization);
        }
      }
    },

    async handleGenerateLink(send) {
      let data = {};
      data.email = this.inviteuseremail;
      data.name = this.$store.state.organization.name;
      data.send = send;
      try {
        const response = await this.axios.post('/api/org/invitelink', data);
        const success = _get(response, 'data.success');
        this.inviteuserelink = _get(response, 'data.confirm_url');
        if (success === false) this.$notify({group: 'error', type: 'err', text: 'Unable to invite user'});
        if (success === true && send === true) this.$notify({group: 'app', type: 'success', text: 'Email sent'});
        if (success === true && send === false) this.$notify({group: 'app', type: 'success', text: 'Link generated'});
      } catch (error) {
      } finally {
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
