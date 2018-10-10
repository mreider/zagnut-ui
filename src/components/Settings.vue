<template>
  <div class="settings">
    <b-tabs>
      <b-tab title="Profile"> <profile></profile> </b-tab>
      <b-tab title="Organization"> <organization></organization> </b-tab>
      <b-tab title="Users"> <users></users> </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import Profile from './componentsSettings/Profile.vue';
import Organization from './componentsSettings/Organization.vue';
import Users from './componentsSettings/Users.vue';
export default {
  name: 'Settings',
  data() {
    return {
    };
  },
  methods: {
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

      .col-form-label {
        margin-bottom: 0;
        padding-bottom: 0;
      }

      input {
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }
  }
</style>
