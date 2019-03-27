<template>
  <v-layout>
    <v-toolbar dark color="primary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>

      <v-toolbar-title class="white--text">
        <router-link :to="{ path: '/' }" class="toolbar-title-link">PM415</router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-text-field
        @keydown.enter.native="goSearch(searchText)"
        v-model="searchText"
        placeholder="Search"
      ></v-text-field>
      <v-btn icon @click="goSearch(searchText)">
        <v-icon>search</v-icon>
      </v-btn>
    </v-toolbar>

    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-list class="pt-0" dense>
        <v-divider></v-divider>
        <v-list-tile
          :to="{ path: '/initiatives' }"
          @click="drawer = false"
          class="navigation-drawer-link"
        >
          <v-list-tile-action>
            <v-icon>announcement</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Initiatives</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          :to="{ path: '/backlogs' }"
          @click="drawer = false"
          class="navigation-drawer-link"
        >
          <v-list-tile-action>
            <v-icon>horizontal_split</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Backlogs</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{ path: '/bugs' }" @click="drawer = false" class="navigation-drawer-link">
          <v-list-tile-action>
            <v-icon>bug_report</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Bugs</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-group no-action sub-group>
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-title>{{$store.state.organization.name}}</v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile
            v-for="org in $store.state.user.organizations"
            v-bind:key="org.id"
            @click="handleOrgChange(org)"
          >
            <v-list-tile-title>{{ org.name }}</v-list-tile-title>
          </v-list-tile>
        </v-list-group>

        <v-list-group no-action sub-group>
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-title>{{username}}</v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile :to="{ path: '/settings' }">
            <v-list-tile-title>Settings</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="handleLogout">
            <v-list-tile-title>Logout</v-list-tile-title>
          </v-list-tile>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
  </v-layout>

  <!-- <b-navbar toggleable="md" type="dark" variant="info">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

      <b-navbar-brand :to="{ path: '/' }">PM415</b-navbar-brand>

      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav>
          <b-nav-item :to="{ path: '/initiatives' }">Initiatives</b-nav-item>
          <b-nav-item :to="{ path: '/ideas' }">Ideas</b-nav-item>
          <b-nav-item :to="{ path: '/backlogs' }">Backlogs</b-nav-item>
          <b-nav-item :to="{ path: '/bugs' }">Bugs</b-nav-item>
          <b-nav-item>
            <b-input-group>
              <b-form-input
                size="sm"
                @keydown.enter.native="goSearch(searchText)"
                v-model="searchText"
                placeholder="Search"
                style="background-color: white"
              />
              <b-input-group-append>
                <b-btn
                  size="sm"
                  class="success SearchBtn btn btn-default"
                  @click="goSearch(searchText)"
                >
                  <font-awesome-icon icon="search" aria-hidden="true"/>
                </b-btn>
              </b-input-group-append>
            </b-input-group>
          </b-nav-item>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown :text="$store.state.organization.name" right>
            <b-dropdown-item
              href="#"
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
  </b-navbar>-->
</template>

<script>
import { doLogout } from "@/utils";
import _get from "lodash/get";
import { isCookieEnabled, setCookie } from "tiny-cookie";

export default {
  name: "Topbar",

  data() {
    return {
      searchText: "",
      drawer: false
    };
  },

  computed: {
    username() {
      const { firstName, lastName, email } = this.$store.state.user;
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
        const success = _get(response, "data.success");
        const message = _get(response, "data.message");
        const token = _get(response, "data.token");
        const organization = _get(response, "data.organization");

        if (!success || !token || !organization) throw new Error(message);

        if (isCookieEnabled()) setCookie("token", token, { expires: "7D" });
        this.$store.commit({ type: "token", token });
        this.$store.commit({
          type: "organization",
          name: organization.name,
          id: organization.id
        });

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
      this.$router.push({ name: "search", query: { text: text } });
    }
  },

  components: {}
};
</script>

<style lang="scss" >
.toolbar-title-link {
  color: #ffffff;
  &:hover {
    color: #ffffff;
    text-decoration: none;
  }
}
.navigation-drawer-link a {
  &:hover {
    color: inherit;
    text-decoration: none !important;
  }
}
</style>
