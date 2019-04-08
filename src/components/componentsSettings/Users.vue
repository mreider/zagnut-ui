<template>
  <div class="users">
    <v-toolbar flat color="transparent" class="no-padding-right no-padding-left">
      <v-select
        :items="organizations"
        label="Organization"
        item-text="name"
        item-value="name"
        @input="handleOrgChange"
        return-object
        class="pt-0"
      ></v-select>
      <v-select
        :items="actionSelectOptions"
        label="Action"
        item-text="name"
        item-value="name"
        return-object
        @change="handleActionSelect"
        class="pt-0 pl-3"
      ></v-select>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-data-table :headers="usersTableHeaders" :items="users" class="elevation-1">
      <template v-slot:headers="props">
        <tr>
          <th>
            <v-checkbox
              @click.stop="handleSelect()"
              :input-value="props.all"
              primary
              hide-details
              v-model="selectAllUsers"
            ></v-checkbox>
          </th>
          <th
            v-for="header in props.headers"
            :key="header.text"
            @click="changeSort(header.value)"
          >{{ header.text }}</th>
        </tr>
      </template>
      <template v-slot:items="props">
        <td>
          <v-checkbox
            primary
            hide-details
            @click="selectSingle = !selectSingle"
            @click.stop="handleSelect(props.item)"
            v-model="props.item.selected"
          ></v-checkbox>
        </td>
        <td>{{ props.item.userId }}</td>
        <td>{{ props.item.email }}</td>
        <td>{{ props.item.role }}</td>
        <td>{{ props.item.firstName }}</td>
        <td>{{ props.item.lastName }}</td>
        <td>{{ props.item.isActive }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import _get from "lodash/get";
import { eventBus } from "@/main";
export default {
  name: "Users",
  props: ["organizations"],
  data() {
    return {
      users: [],
      usersFields: [
        "userId",
        "email",
        "role",
        "firstName",
        "lastName",
        "isActive"
      ],
      usersTableHeaders: [
        { text: "User Id", value: "userId", sortable: false },
        { text: "email", value: "email", sortable: false },
        { text: "role", value: "role", sortable: false },
        { text: "first name", value: "firstName", sortable: false },
        { text: "last name", value: "lastName", sortable: false },
        { text: "Is active", value: "isActive", sortable: false }
      ],
      selectedOrg: { name: "Organization" },
      selectAllUsers: false,
      selectSingle: false,
      actionSelectOptions: [
        {
          name: "Grant admin",
          event: this.handleGrantAdmin
        },
        {
          name: "Revoke admin",
          event: this.handleRevokeAdmin
        },
        {
          name: "Authorize user",
          event: this.handleRevokeAdmin
        },
        {
          name: "Reset password",
          event: this.handleResetPassword
        }
      ]
    };
  },
  computed: {},

  methods: {
    handleSelect(user) {
      if (!user) {
        this.selectAllUsers = !this.selectAllUsers;
        this.users.forEach(u => {
          u.selected = this.selectAllUsers;
        });
        return;
      }

      if (user) user.selected = !user.selected;

      if (this.users) {
        const indexel = this.users.findIndex(
          el => el.selected === this.selectAllUsers
        );
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

        const success = _get(response, "data.success");
        if (!success) {
          throw new Error(`Unable to load user's organizations.`);
        }

        const users = _get(response, "data.users");
        users.forEach(u => {
          u.selected = false;
        });
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
      const usersToGranAdmin = this.users
        .filter(row => row.selected === true)
        .map(row => row.userId);
      if (usersToGranAdmin < 1) return;

      try {
        this.$loading(true);

        const response = await this.axios.put(
          `/api/org/${this.selectedOrg.orgId}/admin/grant`,
          { usersId: usersToGranAdmin }
        );

        const success = _get(response, "data.success");
        if (!success) {
          throw new Error(
            "Unable to grant administrative privileges to user(s)"
          );
        }

        this.$notify({
          group: "app",
          type: "success",
          text: "Administrator rights granted"
        });
        this.loadOrgUsers(this.selectedOrg);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async handleRevokeAdmin(data) {
      const usersToRevokeAdmin = this.users
        .filter(row => row.selected === true)
        .map(row => row.userId);
      if (usersToRevokeAdmin < 1) return;

      try {
        this.$loading(true);

        const response = await this.axios.put(
          `/api/org/${this.selectedOrg.orgId}/admin/revoke`,
          { usersId: usersToRevokeAdmin }
        );

        const success = _get(response, "data.success");
        const message = _get(response, "data.message");
        if (!success) {
          throw new Error(
            "Unable to revoke administrative privileges from user(s)"
          );
        }

        this.$notify({ group: "app", type: "success", text: message });
        this.loadOrgUsers(this.selectedOrg);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async handleResetPassword() {
      const usersToResetPassword = this.users
        .filter(row => row.selected === true)
        .map(row => row.userId);
      if (usersToResetPassword < 1) return;

      try {
        this.$loading(true);

        const response = await this.axios.put(
          `/api/org/${this.selectedOrg.orgId}/admin/resetpassword`,
          { usersId: usersToResetPassword }
        );
        const success = _get(response, "data.success");
        if (!success) throw new Error("Unable to reset passwords");

        this.$notify({
          group: "app",
          type: "success",
          text: "Passwords reset, letters sent"
        });
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async handleRemoveFromOrganization(data) {
      const usersToRemove = this.users
        .filter(row => row.selected === true)
        .map(row => row.userId);

      if (usersToRemove < 1) return;

      try {
        this.$loading(true);

        const response = await this.axios.post(
          `/api/org/${this.selectedOrg.orgId}/users/remove`,
          { usersId: usersToRemove }
        );
        const success = _get(response, "data.success");
        if (!success) throw new Error("Unable to delete users");

        this.$notify({
          group: "app",
          type: "success",
          text: "Selected user were removed from organization"
        });

        this.users = this.users.filter(
          row => usersToRemove.indexOf(row.userId) === -1
        );
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgUsers(this.selectedOrg);
        eventBus.$emit("reload", { loadOrganization: true });
        this.$loading(false);
      }
    },
    handleActionSelect(selectedItem) {
      selectedItem.event();
    }
  },

  components: {},
  watch: {}
};
</script>

<style lang="scss">
.users {
  .btn {
    &.dropdown-toggle {
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
.no-padding-left .v-toolbar__content {
  padding-left: 0 !important;
}
</style>
