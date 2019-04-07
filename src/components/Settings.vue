<template>
  <div class="settings">
    <b-tabs>
      <b-tab title="Profile">
        <profile :organizations="organizations"></profile>
      </b-tab>
      <b-tab title="Organization">
        <organization :organizations="organizations"></organization>
      </b-tab>
      <b-tab title="Users">
        <users :organizations="organizations"></users>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import Profile from "./componentsSettings/Profile.vue";
import Organization from "./componentsSettings/Organization.vue";
import Users from "./componentsSettings/Users.vue";
import _get from "lodash/get";
import { eventBus } from "@/main";
export default {
  name: "Settings",
  data() {
    return {
      organizations: []
    };
  },

  async mounted() {
    await this.loadOrganizations();
    eventBus.$on("reload", data => {
      if (data.loadOrganization === true) this.loadOrganizations();
    });
  },

  methods: {
    async loadOrganizations() {
      this.$loading(true);

      try {
        const response = await this.axios.get("/api/user/orgs");

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const organizations = _get(response, "data.organizations");
        organizations.forEach(o => {
          o._rowVariant = "";
        });
        organizations.forEach(o => {
          o.menuName = o.name;
          if (o.role === "Pending") {
            o.menuName = o.name + " (authorization pending)";
          }
        });

        this.organizations = organizations;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    }
  },
  components: {
    profile: Profile,
    organization: Organization,
    users: Users
  }
};
</script>

<style lang="scss">
.settings {
  .nav.nav-tabs {
    margin-bottom: 20px;

    .nav-item {
      .nav-link {
        font-size: 15px;
        padding: 16px 40px;
      }
    }
  }

  .tab-content {
    padding: 10px;
    outline: none !important;

    .col-form-label {
      margin-bottom: 0;
      padding-bottom: 0;
    }

    input {
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
  .tab-content > .active {
    outline: none !important;
  }
  .no-padding-left {
    padding-left: 0;
  }
}
</style>
