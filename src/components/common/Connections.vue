<template>
  <b-card class="connections" bg-variant="light">
    <div class="container-fluid col-lg-12 col-md-8 col-sm-6 col-xs-4">

    <div class="row">
      <div class="col-lg-12 col-md-8 col-sm-6 col-xs-4">
        <div style="display: inline-block; margin-left: 7px;">
          <h6>Remove seleted</h6>
        </div>
        <b-btn class="float-left" variant="danger" size="sm" v-b-modal.delete><font-awesome-icon icon="trash-alt" /></b-btn>
      </div>

      <div v-for="element in relations" v-bind:key="element.key" class="col-4" style="margin-top: 2em">
        <b-btn size="sm" @click="setCurrentConnectionType(element.key)">➕</b-btn>
        <div style="display: inline-block; margin-left: 7px;">
         <h6>{{element.key}}</h6>
        </div>
          <div v-for="item in element.data" v-bind:key="item.id" class="" style="margin-top: 1em">
            <b-form-checkbox v-model="item.selected"> {{item.title}} </b-form-checkbox>
          </div>
      </div>
      </div>
    </div>
    <b-modal id="modalnew"
              button-size="sm"
              :title="'Add connections to ' + currentConnectionType"
              size="lg"
              centered
              @ok="handleNewConnections()"
              ok-title="Add selected"
              ref="modalnew"
              >
       <b-form-group label="Filter" size="sm" class="col-6 mb-2">
          <b-input-group>
            <b-form-input size="sm" v-model="filter" placeholder="Type to Search" />
            <b-input-group-append>
              <b-btn size="sm" :disabled="!filter" @click="filter = ''">Clear</b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      <b-table  bordered
                fixed
                responsive
                :items="connectionTable"
                :fields="connectionsFieldToAdd"
                :filter="filter"
                :current-page="currentPage"
                :per-page="perPage"
                >
          <template slot="title" slot-scope="data">
            <b-form-checkbox v-model="data.item.selected"> {{data.item.title}} </b-form-checkbox>
          </template>
      </b-table>
      <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
    </b-modal>
    <b-modal id="delete"
                    button-size="sm"
                    title="Delete connections?"
                    size="sm"
                    centered
                    ok-variant="warning"
                    ok-title="Delete"
                    @ok="handleDeleteConnections()"
          >
    </b-modal>

  </b-card>
</template>

<script>
import _get from 'lodash/get';
import _ from 'lodash';
export default {
  name: 'connections',
  props: ['toConnectionData'],
  data() {
    return {
      relations: [],
      connectionsFieldToAdd:
      [
        { key: 'title', sortable: true },
        { key: 'description', sortable: true }
      ],
      currentConnectionType: '',
      connectionTable: [],
      filter: '',
      currentPage: 0,
      totalRows: 0,
      perPage: 10
    };
  },
  async mounted () {
    await this.loadRelaitedList();
  },
  computed: {
  },

  methods: {
    async loadRelaitedList() {
      this.toConnectionData.connects.forEach(element => {
        this.getConnection(element);
      });
      this.relations.sort();
    },
    async setCurrentConnectionType(element) {
      this.currentConnectionType = element;
      if (element === 'backlog') {
        await this.loadOrgBacklogs(element);
      } else if (element === 'initiative') {
        await this.loadOrgInitiatives(element);
      } else if (element === 'item') {
        await this.loadOrgItems(element);
      };
      this.$refs.modalnew.show();
    },
    async deleteConnected(element, table) {
      const connected = this.relations.find(n => n.key === element);

      connected.data.forEach(element => {
        table = _.pull(table, table.find(n => n.id === element.id));
      });
      this.totalRows = table.lenght;
      return table;
    },
    async loadOrgItems() {
      const orgId = this.$route.query.orgId;
      try {
        this.$loading(true);
        const response = await this.axios.get(`/api/items/all/backlogs/${orgId}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let items = _get(response, 'data.items');
        items.forEach(element => {
          element.selected = false;
        });
        items = await this.deleteConnected('item', items);
        console.log(items);
        this.connectionTable = items;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async loadOrgBacklogs() {
      try {
        this.$loading(true);
        const response = await this.axios.get(`/api/backlogs/${this.$store.state.organization.id}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's baclogs.`);

        let backlogs = _get(response, 'data.backlogs');
        backlogs.forEach(element => {
          element.selected = false;
        });
        backlogs = await this.deleteConnected('backlog', backlogs);
        this.connectionTable = backlogs;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async loadOrgInitiatives() {
      try {
        this.$loading(true);
        const response = await this.axios.get(`/api/initiatives/${this.$store.state.organization.id}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let initiatives = _get(response, 'data.initiatives');
        initiatives.forEach(element => {
          element.selected = false;
        });
        initiatives = await this.deleteConnected('initiative', initiatives);
        this.connectionTable = initiatives;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async getConnection(element) {
      // const string = ;
      try {
        const response = await this.axios.get('/api/connections/' + this.toConnectionData.name + '/' + element + '/' + this.toConnectionData.id);
        let success = _get(response, 'data.success');

        if (!success) this.$errorMessage.show('Unable to load connections');
        let connections = _get(response, 'data.info');

        let newObj = {};
        newObj.key = element;
        newObj.data = connections;
        connections.forEach(element => {
          element.selected = false;
        });

        this.relations.push(newObj);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleNewConnections() {
      try {
        this.$loading(true);
        let arrItems = [];
        let arrBacklogs = [];
        let arrInitiatives = [];

        if (this.currentConnectionType === 'backlog') {
          this.connectionTable.forEach(element => {
            if (element.selected) arrBacklogs.push(element.id);
          });
        } else if (this.currentConnectionType === 'initiative') {
          this.connectionTable.forEach(element => {
            if (element.selected) arrInitiatives.push(element.id);
          });
        } else if (this.currentConnectionType === 'item') {
          this.connectionTable.forEach(element => {
            if (element.selected) arrItems.push(element.id);
          });
        };

        const response = await this.axios.post('/api/connections/' + this.toConnectionData.name + '/' + this.toConnectionData.id, { items: arrItems, initiatives: arrInitiatives, backlogs: arrBacklogs, delete: false });
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to add connection.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.relations = [];
        await this.loadRelaitedList();
        this.$loading(false);
      }
    },
    async handleDeleteConnections() {
      try {
        this.$loading(true);
        let arrItems = [];
        let arrBacklogs = [];
        let arrInitiatives = [];

        this.relations.forEach(element => {
          if (element.key === 'backlog') {
            element.data.forEach(el => {
              if (el.selected) arrBacklogs.push(el.id);
            });
          } else if (element.key === 'initiative') {
            element.data.forEach(el => {
              if (el.selected) arrInitiatives.push(el.id);
            });
          } else if (element.key === 'item') {
            element.data.forEach(el => {
              if (el.selected) arrItems.push(el.id);
            });
          };
        });
        const response = await this.axios.post('/api/connections/' + this.toConnectionData.name + '/' + this.toConnectionData.id, { items: arrItems, initiatives: arrInitiatives, backlogs: arrBacklogs, delete: true });
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to add connection.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.relations = [];
        await this.loadRelaitedList();
        this.$loading(false);
      }
    }
  },

  components: {
  },
  watch: {
  }
};
</script>

<style lang="scss">
.hidden_header {
      display: none;
    }
</style>
