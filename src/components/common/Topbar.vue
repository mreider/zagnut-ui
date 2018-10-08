<template>
  <b-navbar toggleable="md" type="dark" variant="info">

    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

    <b-navbar-brand href="#">PM415</b-navbar-brand>

    <b-collapse is-nav id="nav_collapse">

      <b-navbar-nav>
        <b-nav-item to="initiatives">Strategic Initiatives</b-nav-item>
        <b-nav-item to="ideas">Ideas</b-nav-item>
        <b-nav-item to="backlogs">Backlogs</b-nav-item>
        <b-nav-item to="bugs">Bugs</b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">

        <b-nav-item-dropdown :text="$store.state.organization.name" right>
          <b-dropdown-item href="#"
            v-for="org in $store.state.user.organizations"
            v-bind:key="org.id"
            @click="handleOrgChange(org)"
          >{{ org.name }}</b-dropdown-item>
        </b-nav-item-dropdown>

        <b-nav-item-dropdown :text="username" right>
          <b-dropdown-item to="settings">Settings</b-dropdown-item>
          <b-dropdown-item @click="handleLogout">Logout</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

    </b-collapse>
  </b-navbar>
</template>

<script>
import { doLogout, switchOrganization } from '@/utils';

export default {
  name: 'Topbar',

  data() {
    return {
    };
  },

  computed: {
    username() {
      const {firstName, lastName, email} = this.$store.state.user;
      if (firstName && lastName) return `${firstName} ${lastName}`;
      else if (firstName) return firstName;
      else if (lastName) return lastName;

      return email;
    }
  },

  methods: {
    async handleOrgChange(org) {
      try {
        await switchOrganization(this, org.id, true);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    handleLogout() {
      doLogout(this);
    }
  },

  components: {
  }
};
</script>

<style lang="scss" scoped>
</style>
