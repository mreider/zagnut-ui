<template>
<b-card bg-variant="light" class="card col-lg-12">
  <div class="backlogs">
    <div class="row">
      <div class="col-12">
        <b-btn class="float-right" variant="primary" size="sm" v-b-modal.modalnew> New</b-btn>
      </div>
      <div class="col-8">
      </div>
      <b-form-group size="sm" class="col-4 mb-2" style="margin-top: 1em">

          <b-form-input size="sm" v-model="filter" placeholder="Type to filter results" />
          <b-btn class="float-right" size="sm" :disabled="!filter" @click="filter = ''">Clear</b-btn>
      </b-form-group>
    </div>

    <b-table  bordered
              fixed
              responsive
              :items="backlogs"
              :fields="backlogsFields"
              :filter="filter"
              >
      <template slot="title" slot-scope="data" class="col-8">
        <a :href="'items/?orgId='+$store.state.organization.id +'&backlogid='+ data.item.id">
          {{  data.item.title }}
        </a>
      </template>
      <template slot="author" slot-scope="data" class="col-4">
        <a :href="`#`" v-on:click="filter = data.item.author">
          {{ data.item.author }}
        </a>
        <div style="float: right;">
          <b-button style="vertical-align: right;" variant="primary" size="sm" v-b-modal.edit @click="setCurrentBacklog(data.item)"><font-awesome-icon icon="pencil-alt" /> </b-button>
          <b-button style="bottom" variant="danger" size="sm" v-b-modal.delete @click="setCurrentBacklog(data.item)"><font-awesome-icon icon="trash-alt" /></b-button>
        </div>
      </template>
    </b-table>

    <b-modal id="edit"
              title="Edit"
              button-size="sm"
              size="sm"
              centered
              ok-variant="submit"
              @ok="handleBacklogEditTitle(currentBacklog, newNameOldBacklog)"
              ok-title="submit"
              >
        <b-form-input v-model=newNameOldBacklog :placeholder="currentBacklog.title"></b-form-input>
    </b-modal>
    <b-modal id="delete"
              :title="'Delete ' + currentBacklog.title + '?'"
              button-size="sm"
              size="sm"
              centered
              body-class="zero-size"
              ok-variant="danger"
              @ok="handleBacklogDelete(currentBacklog)"
              ok-title="delete"
              >
    </b-modal>

    <b-modal id="modalnew"
              button-size="sm"
              title="New backlog"
              @ok="handleNewBacklog()"
              size="lg"
              centered
              >
      <b-form-group label = "Title: " label-for = "title" horizontal>
        <b-form-input v-model="newBacklog.title" placeholder="Title backlog" id="title">></b-form-input>
      </b-form-group>

    </b-modal>

  </div>
  </b-card>
</template>

<script>
import _get from 'lodash/get';
// import _ from 'lodash';
import Item from './componentsBacklogs/item.vue';
import { username } from '@/utils';
export default {
  name: 'Backlogs',
  data() {
    return {
      objStatuses: [],
      groupByList: ['Status', 'Stategic initiative'],
      currentGroupBy: 'Status',
      selected: [],
      options: [],
      users: [],
      newBacklog: { title: '' },
      backlogs: [],
      pointsVar: ['0', '1', '2', '3', '5', '8', '13', '21'],
      backlogsFields: [{ key: 'title', sortable: true, label: 'Backlog' }, { key: 'author', sortable: true }],
      newNameOldBacklog: '',
      currentBacklog: '',
      filter: null,
      perPage: 5
    };
  },
  async mounted() {
    await this.loadOrgBacklogs();
  },

  computed: {
  },

  methods: {
    async loadOrgBacklogs() {
      try {
        this.$loading(true);
        const response = await this.axios.get(`/api/backlogs/${this.$store.state.organization.id}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's backlogs.`);

        const backlogs = _get(response, 'data.backlogs');
        backlogs.forEach(element => {
          element.author = username(element);
        });
        this.backlogs = backlogs;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleChangeGroupBy(element) {
      this.currentGroupBy = element;
    },
    async handleBacklogNewItemSetField(element, name) {
      this.newBacklog[name] = element;
    },
    setCurrentBacklog(element) {
      this.currentBacklog = element;
    },
    async handleBacklogEditTitle(element, newNameOldBacklog) {
      if (!newNameOldBacklog) {
        return this.$notify({group: 'error', type: 'err', text: 'Empty backlog title field'});
      }
      try {
        this.$loading(true);

        const response = await this.axios.put(`/api/backlogs/edit/${this.$store.state.organization.id}/${element.id}`, { title: newNameOldBacklog });

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update backlog.`);

        this.$notify({group: 'app', type: 'success', text: 'Backlog updated'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        await this.loadOrgBacklogs();
        this.$loading(false);
        this.newNameOldBacklog = '';
        this.currentBacklog = '';
      }
    },
    async handleBacklogDelete(backLog) {
      if (!backLog || !this.$store.state.user.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        const response = await this.axios.delete(`/api/backlogs/${this.$store.state.organization.id}/${backLog.id}`);
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new organization.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$notify({group: 'app', type: 'success', text: `Backlog ${backLog.title} was deleted`});
        this.currentBacklog = '';
      }
    },
    async handleNewBacklog() {
      try {
        let data = {};
        data.title = this.newBacklog.title;
        const response = await this.axios.post(`/api/backlogs/new/${this.$store.state.organization.id}`, data);
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new backlog.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.newBacklog = { title: '' };
        await this.loadOrgBacklogs();
      }
    },
    handleUsername (element) {
      return username(element);
    },
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.backlogs.forEach(element => {
        element.totalRows = filteredItems.length;
        element.currentPage = 1;
      });
    }
  },
  watch: {
  },
  components: {
    item: Item
  }
};
</script>

<style lang="scss">
 .card {
    margin-top:50px;
  }
  .backlogs {
    .header {
      margin-top:10px;
    }
    .hidden_header {
      display: none;
    }

  };
</style>
