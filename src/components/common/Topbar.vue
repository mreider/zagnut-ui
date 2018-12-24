<template>
  <b-navbar toggleable="md" type="dark" variant="info">

    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

    <b-navbar-brand href="#">PM415</b-navbar-brand>

    <b-collapse is-nav id="nav_collapse">

      <b-navbar-nav>
        <b-nav-item :to="{ path: '/initiatives' }">Initiatives</b-nav-item>
        <!-- <b-nav-item :to="{ path: '/ideas' }">Ideas</b-nav-item> -->
        <b-nav-item :to="{ path: '/backlogs' }">Backlogs</b-nav-item>
        <b-nav-item :to="{ path: '/bugs' }">Bugs</b-nav-item>
        <b-nav-item >
          <b-input-group>
           <b-form-input size="sm" v-model="searchText" placeholder="Search" style="background-color: white"/>
           <b-input-group-append>
              <b-btn size="sm" class="SearchBtn"  @click="goSearch(searchText)"><font-awesome-icon icon="search" aria-hidden="true"/></b-btn>
           </b-input-group-append>
          </b-input-group>
        </b-nav-item>
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
          <b-dropdown-item :to="{ path: '/settings' }">Settings</b-dropdown-item>
          <b-dropdown-item @click="handleLogout">Logout</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

    </b-collapse>
  </b-navbar>
</template>

<script>
import { doLogout } from '@/utils';
import _get from 'lodash/get';
import { isCookieEnabled, setCookie } from 'tiny-cookie';

export default {
  name: 'Topbar',

  data() {
    return {
      searchText: ''
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
        this.$loading(true);

        const response = await this.axios.post(`/api/org/switch/${org.id}`);
        const success = _get(response, 'data.success');
        const message = _get(response, 'data.message');
        const token = _get(response, 'data.token');
        const organization = _get(response, 'data.organization');

        if (!success || !token || !organization) throw (new Error(message));

        if (isCookieEnabled()) setCookie('token', token, {expires: '7D'});
        this.$store.commit({type: 'token', token});
        this.$store.commit({type: 'organization', name: organization.name, id: organization.id});

        window.location.reload();
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    handleLogout() {
      doLogout(this);
    },
    goSearch(text) {
      this.$router.push({ name: 'search', query: {text: text} });
    }
  },

  components: {
  }
};
</script>

<style lang="scss" scoped>
</style>
