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
          v-for="item in drawerLinkItems"
          :key="item.title"
          :to="{ path: item.link }"
          @click="drawer = false"
          class="navigation-drawer-link"
        >
          <v-list-tile-action>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{item.title}}</v-list-tile-title>
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
      drawer: false,
      drawerLinkItems: [
        {
          title: "Initiatives",
          icon: "announcement",
          link: "/initiatives"
        },
        {
          title: "Backlogs",
          icon: "horizontal_split",
          link: "/backlogs"
        },
        {
          title: "Bugs",
          icon: "bug_report",
          link: "/bugs"
        }
      ]
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
