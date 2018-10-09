<template>
  <div class="settings">
    <b-tabs>
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

        <div class="api-key-invite form-inline float-right">
          <label>API key</label>
          <b-form-input readonly v-model="profile.apiKey"></b-form-input>

          <b-button variant="warning" size="sm" v-b-modal="modalId(1, 'regenerate-api-key')">Regenerate</b-button>
          <b-modal :id="modalId(1, 'regenerate-api-key')"
                    button-size="sm"
                    title="Generate new API key?"
                    size="sm"
                    centered
                    ok-variant="warning"
                    ok-title="Create new"
                    @ok="handleRegenerageApiKey"
          >
            <p>All application that uses this API key wouldn't work until new key promoted to its instances.</p>
            <p>Are absolutely sure you want to create new API key?</p>
          </b-modal>

          <b-btn variant="success" size="sm" v-b-modal.modal-invite>➕ Invite link</b-btn>
            <b-modal
              id="modal-invite"
              class="invite-link-modal"
              title="Invite link generate"
              centered button-size="sm"
              :ok-only="true"
              ok-title="close"
            >
              <b-row>
                <b-col md="4" sm="4">
                  <b-dropdown :text="invite.org.name" class="m-2" split size="sm" left>
                    <b-dropdown-item
                      v-for="org in organizations" v-if="organizations"
                      v-bind:key="org.id"
                      @click="handleInviteOrgChange(org)"
                    >{{ org.name }}</b-dropdown-item>
                  </b-dropdown>
                </b-col>

                <b-col md="8" sm="8">
                  <b-form-input v-model="invite.email" placeholder="E-Mail">></b-form-input>
                </b-col>
              </b-row>

              <b-row class="link-wrap">
                <b-col md="12" sm="12">
                  <b-form-group label="Invitation link">
                    <b-form-input v-model="invite.link" readonly></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>

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
                     button-size="sm"
                     title="New orgranization name"
                     @ok="handleOrganizationNew(newOrgName)"
                     size="sm"
                     centered
                     >
                <b-form-input v-model="newOrgName" placeholder="Enter organization name">></b-form-input>
            </b-modal>
          </div>
        </div>

        <b-table hover :items="organizations" :fields="organizationsFields">
          <template slot="actions" slot-scope="data">
            <b-button variant="primary" size="sm" v-b-modal="modalId(data.item.orgId, 'edit')" v-if="data.item.role === 'Admin'">🖉</b-button>
            <b-button variant="danger" size="sm" v-b-modal="modalId(data.item.orgId, 'del')" v-if="data.item.role === 'Admin'">✖</b-button>
            <b-modal :id="modalId(data.item.orgId, 'del')"
                     :title="'Delete ' + data.item.name + '?'"
                     button-size="sm"
                     size="sm"
                     centered
                     body-class="zero-size"
                     ok-variant="danger"
                     @ok="handleOrganizationDelete(data.item)"
                     ok-title="delete"
                     >
            </b-modal>

            <b-modal :id="modalId(data.item.orgId, 'edit')"
                     title="Edit"
                     button-size="sm"
                     size="sm"
                     centered
                     ok-variant="submit"
                     @ok="handleOrganizationEdit(data.item, newOrgName)"
                     ok-title="submit"
                     >
                <b-form-input v-model=newOrgName :placeholder="data.item.name"></b-form-input>
            </b-modal>
          </template>
        </b-table>
      </b-tab>

      <b-tab title="Users" class="users">
        <b-dropdown :text="selectedOrg.name" size="sm">
          <b-dropdown-item
            v-for="org in organizations" v-if="organizations"
            v-bind:key="org.orgId"
            @click="handleOrgChange(org)"
          >{{ org.name }}</b-dropdown-item>
        </b-dropdown>

        <b-dropdown id="Actions" text="Action" size="sm" class="m-2">
          <b-dropdown-item id="granAdmin" @click="handleGranAdmin()"> Grant admin </b-dropdown-item>
          <b-dropdown-item id="hevokeAdmin" @click="handleRevokeAdmin()"> Revoke admin </b-dropdown-item>
          <b-dropdown-item id="removeFromOrganization" @click="handleRemoveFromOrganization()"> Remove from org </b-dropdown-item>
        </b-dropdown>
          <template>
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>
                    <label class="form-checkbox">
                      <input type="checkbox" v-model="selectAllUsers" @click="select()">
                      <i class="form-icon"></i>
                    </label>
                  </th>
                  <th v-for="uf in usersFields"  v-bind:key="uf" >{{ uf }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users" v-bind:key="u.userId">
                  <td>
                    <label class="form-checkbox">
                      <input type="checkbox" @click="select(u)" :checked="u.selected">
                      <i class="form-icon"></i>
                    </label>
                  </td>
                  <td v-for="uf in usersFields"  v-bind:key="uf">
                    <tr>{{ u[uf] }}</tr>
                  </td>
                </tr>
                <tr></tr>
              </tbody>

             </table>
          </template>
      </b-tab>

    </b-tabs>
  </div>
</template>

<script>
import _get from 'lodash/get';
import { doLogout } from '@/utils';

export default {

  name: 'Settings',

  data() {
    return {
      profile: {},

      invite: {
        org: { name: 'Organization' },
        email: null,
        link: null
      },

      organizationsFields: ['orgId', 'name', 'role', 'actions'],
      organizations: [],
      newOrgName: '',

      users: [],
      usersFields: ['userId', 'email', 'role', 'firstName', 'lastName', 'isActive'],
      selectedOrg: { name: 'Organization' },

      selectAllUsers: false,

      saving: false
    };
  },

  async mounted () {
    await this.loadProfile();
    await this.loadOrganizations();
  },

  methods: {
    modalId(i, postfix) {
      return `modal-${i}-${postfix}`;
    },
    select(user) {
      if (!user) {
        this.selectAllUsers = !this.selectAllUsers;
        this.users.forEach(u => { u.selected = this.selectAllUsers; });
        return;
      };

      if (user) user.selected = !user.selected;

      if (this.users) {
        const indexel = this.users.findIndex(el => el.selected === this.selectAllUsers);
        if (indexel === -1) this.selectAllUsers = !this.selectAllUsers;
      }

      return user.selected;
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

    async loadOrgUsers(org) {
      try {
        this.$loading(true);
        const response = await this.axios.get(`/api/org/${org.orgId}/users`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const users = _get(response, 'data.users');
        users.forEach(u => { u.selected = false; });
        this.selectAllUsers = false;

        this.users = users;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.selectedOrg = org;
        this.$loading(false);
      }
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
        if (!success) throw new Error(_get(response, 'data.message'));

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

        return this.$notify({group: 'error', type: 'success', text: 'New API key was created. Do not forget to update it everywhere.'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    handleOrgChange(org) {
      this.selectedOrg = org;
      this.loadOrgUsers(org);
    },

    handleInviteOrgChange(org) {
      this.invite.org = org;
    },

    handleUserSelect(user) {
      // this.users.forEach(u => { u._rowVariant = ''; });
      if (this.$store.state.user.id === user.id) {
        user.selected = false;
        return;
      };
      if (user.selected === true) {
        user.selected = false;
      } else {
        user.selected = true;
      };
    },

    async handleOrganizationEdit(org, newOrgName) {
      if (!newOrgName) {
        return this.$notify({group: 'error', type: 'err', text: 'Empty organization name field'});
      }

      try {
        this.$loading(true);

        const response = await this.axios.put(`/api/org/${org.orgId}`, { name: newOrgName });

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update organization.`);

        this.$notify({group: 'app', type: 'success', text: 'Organization updated'});
        this.loadOrganizations();
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
        this.newOrgName = '';
      }
    },

    async handleOrganizationDelete(org) {
      if (!org || !this.profile.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        const response = await this.axios.delete(`/api/org/${org.orgId}`);
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new organization.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$notify({group: 'app', type: 'success', text: `Organization ${org.name} was deleted`});
        this.loadOrganizations();
      }
    },

    async handleOrganizationNew(data) {
      // this.$loading(true);
      if (!data) {
        return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        const response = await this.axios.post('/api/org', {name: data});
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new organization.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrganizations();
        this.newOrgName = '';
      }
    },

    async handleGranAdmin(data) {
      const usersToGranAdmin = this.users.filter(row => row.selected === true).map(row => row.userId);
      if (usersToGranAdmin < 1) return;

      try {
        this.$loading(true);

        const response = await this.axios.put(`/api/org/${this.selectedOrg.orgId}/admin/grant`, { usersId: usersToGranAdmin });

        const success = _get(response, 'data.success');
        if (!success) throw new Error('Unable to grant administrative privileges to user(s)');

        this.$notify({group: 'app', type: 'success', text: 'Administrator rights granted'});
        this.loadOrgUsers(this.selectedOrg);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async handleRevokeAdmin(data) {
      const usersToRevokeAdmin = this.users.filter(row => row.selected === true).map(row => row.userId);
      if (usersToRevokeAdmin < 1) return;

      try {
        this.$loading(true);

        const response = await this.axios.put(`/api/org/${this.selectedOrg.orgId}/admin/revoke`, { usersId: usersToRevokeAdmin });

        const success = _get(response, 'data.success');
        if (!success) throw new Error('Unable to revoke administrative privileges from user(s)');

        this.$notify({group: 'app', type: 'success', text: 'Administrator rights removed'});
        this.loadOrgUsers(this.selectedOrg);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async handleRemoveFromOrganization(data) {
        // TODO: I don't like this approach - to use CSS flag and flag of selected state.
      const usersToRemove = this.users.filter(row => row.selected === true).map(row => row.userId);

      if (usersToRemove < 1) return;

      try {
        this.$loading(true);

        const response = await this.axios.post(`/api/org/${this.selectedOrg.orgId}/users/remove`, { usersId: usersToRemove });
        const success = _get(response, 'data.success');
        if (!success) throw new Error('Unable to delete users');

        this.$notify({group: 'app', type: 'success', text: 'Selected user were removed from organization'});

        this.users = this.users.filter(row => usersToRemove.indexOf(row.userId) === -1);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async handleGenerateLink(send) {
      if (!this.invite.org.orgId) return this.$notify({group: 'error', type: 'error', text: 'Organization not selected'});
      if (!this.invite.email) return this.$notify({group: 'error', type: 'error', text: 'Email must be provided'});

      try {
        const response = await this.axios.post(`/api/org/${this.invite.org.orgId}/invitelink`, {
          email: this.invite.email,
          send
        });
        const success = _get(response, 'data.success');
        if (!success) throw new Error('Unable to invite user');

        this.invite.link = _get(response, 'data.confirmUrl');

        this.$notify({group: 'app', type: 'success', text: send ? 'Email sent' : 'Link created'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    }
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

      .api-key-invite {
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

        &>button {
          margin-left: 10px;
        }

        .invite-link-modal {
          input {
            width: 100%;
            height: 35px
          }

          .link-wrap {
            margin-top: 20px;
          }
        }
      }

      .users {
        .btn {
          &.dropdown-toggle{
            &::before {
              display: none;
            }

            &::after {
              box-sizing: border-box;
              display: inline-block;
              width: 0;
              height: 0;
              margin-left: 0.3em;
              vertical-align: middle;
              content: "";
              border-top: 0.3em solid;
              border-right: 0.3em solid transparent;
              border-left: 0.3em solid transparent;

              opacity: 1;
              position: relative;
            }
          }
        }
      }
    }
  }
</style>
