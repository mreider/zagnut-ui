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
        <b-button variant="primary" size="sm" v-b-modal.edit v-if="data.item.role === 'Admin'" @click="setCurrentOrg(data.item)"> <font-awesome-icon icon="pencil-alt" /> </b-button>
        <b-button variant="danger" size="sm" v-b-modal.delete v-if="data.item.role === 'Admin'" @click="setCurrentOrg(data.item)"> <font-awesome-icon icon="trash-alt" /> </b-button>
      </template>
    </b-table>
    <b-modal id="delete"
              :title="'Wait. Are you sure you want to delete this permanently?'"
              button-size="sm"
              size="sm"
              centered
              body-class="zero-size"
              ok-variant="danger"
              @ok="handleOrganizationDelete(currentOrganization)"
              ok-title="delete"
              >
    </b-modal>

    <b-modal id="edit"
              title="Edit"
              button-size="sm"
              size="sm"
              centered
              ok-variant="submit"
              @ok="handleOrganizationEdit(currentOrganization, newOrgName)"
              ok-title="submit"
              >
        <b-form-input v-model=newOrgName :placeholder="currentOrganization.name"></b-form-input>
    </b-modal>
  </div>
</template>

<script>
import _get from 'lodash/get';
import { eventBus } from '@/main';

export default {
  name: 'Organization',
  props: ['organizations'],
  data() {
    return {
      organizationsFields: ['orgId', 'name', 'role', 'actions'],
      newOrgName: '',
      currentOrganization: ''
    };
  },

  computed: {
  },

  methods: {
    setCurrentOrg(org) {
      this.currentOrganization = org;
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
        this.newOrgName = '';
      }
      eventBus.$emit('reload', { loadOrganization: true });
      this.setCurrentOrg('');
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
        eventBus.$emit('reload', { loadOrganization: true });
        this.setCurrentOrg('');
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
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
        this.newOrgName = '';
        eventBus.$emit('reload', { loadOrganization: true });
        this.setCurrentOrg('');
      }
    }
  },

  components: {
  }
};
</script>

<style lang="scss">
</style>
