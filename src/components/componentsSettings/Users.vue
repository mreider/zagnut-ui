<template>
  <div class="users">
    <b-dropdown :text="selectedOrg.name" size="sm">
      <b-dropdown-item
        v-for="org in organizations" v-if="organizations"
        v-bind:key="org.orgId"
        @click="handleOrgChange(org)"
      >{{ org.name }}</b-dropdown-item>
    </b-dropdown>

    <b-dropdown id="Actions" text="Action" size="sm" class="m-2">
      <b-dropdown-item id="granAdmin" @click="handleGrantAdmin()"> Grant admin </b-dropdown-item>
      <b-dropdown-item id="hevokeAdmin" @click="handleRevokeAdmin()"> Revoke admin </b-dropdown-item>
      <b-dropdown-item id="removeFromOrganization" @click="handleRemoveFromOrganization()"> Remove from org </b-dropdown-item>
    </b-dropdown>
      <template>
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>
                <label class="form-checkbox">
                  <input type="checkbox" v-model="selectAllUsers" @click="handleSelect()">
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
                  <input type="checkbox" @click="handleSelect(u)" :checked="u.selected">
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

  </div>
</template>

<script>
import _get from 'lodash/get';
import { eventBus } from '@/main';
export default {
  name: 'Users',
  props: ['organizations'],
  data() {
    return {
      users: [],
      usersFields: ['userId', 'email', 'role', 'firstName', 'lastName', 'isActive'],
      selectedOrg: { name: 'Organization' },
      selectAllUsers: false
    };
  },
  computed: {
  },

  methods: {
    handleSelect(user) {
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

    handleOrgChange(org) {
      this.selectedOrg = org;
      this.loadOrgUsers(org);
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

    async handleGrantAdmin(data) {
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
      const usersToRemove = this.users.filter(row => row.selected === true).map(row => row.userId);

      if (usersToRemove < 1) return;

      try {
        this.$loading(true);

        const response = await this.axios.delete(`/api/org/${this.selectedOrg.orgId}/users/remove`, { usersId: usersToRemove });
        const success = _get(response, 'data.success');
        if (!success) throw new Error('Unable to delete users');

        this.$notify({group: 'app', type: 'success', text: 'Selected user were removed from organization'});

        this.users = this.users.filter(row => usersToRemove.indexOf(row.userId) === -1);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        eventBus.$emit('reload', { loadOrganization: true });
        this.$loading(false);
      }
    }
  },

  components: {
  },
  watch: {

  }
};
</script>

<style lang="scss">
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
</style>
