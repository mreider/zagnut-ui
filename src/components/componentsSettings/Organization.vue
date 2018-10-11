<template>
 <div>
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
  </div>
</template>

<script>
import _get from 'lodash/get';
import { eventBus } from '@/main';

export default {
  name: 'Organization',
  data() {
    return {
      organizationsFields: ['orgId', 'name', 'role', 'actions'],
      organizations: [],
      newOrgName: ''
    };
  },

  computed: {
  },

  async mounted () {
    await this.loadOrganizations();
  },

  methods: {
    modalId(i, postfix) {
      return `modal-${i}-${postfix}`;
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
      eventBus.$emit('reload', { loadOrganization: true });
    },

    async handleOrganizationDelete(org) {
      if (!org || !this.$store.state.user.id) {
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
        eventBus.$emit('reload', { loadOrganization: true });
      }
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
        eventBus.$emit('reload', { loadOrganization: true });
      }
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
    }
  },

  components: {
  }
};
</script>

<style lang="scss">
  .organization {
  }
</style>
