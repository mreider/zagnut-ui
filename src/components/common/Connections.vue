<template>
  <b-card class="connections">
    <!-- <p class="card-text" :value="toConnectionData">{{ toConnectionData }} и {{ relations }} </p> -->
    <div v-for="element in relations" v-bind:key="element.key" class="container-fluid row" horizontal>
      <b-btn class="float-right" style="margin-top: 2em" variant="danger" size="sm" @click="setCurrentConnectionType(element.key)"><font-awesome-icon icon="trash-alt" /></b-btn>
      <b-btn class="float-right" style="margin-top: 2em" variant="success" size="sm" @click="setCurrentConnectionType(element.key)" v-b-modal.modalnew>➕</b-btn>
      <h6>{{ element.key }}</h6>
      <div v-for="item in element.data" v-bind:key="item.id">
        <b-form-checkbox v-model="item.selected"> {{item.title}} </b-form-checkbox>
      </div>
    </div>
    <b-modal id="modalnew"
              button-size="sm"
              :title="'Add connections to ' + currentConnectionType"
              size="lg"
              centered
              @ok="handleNewConnections()"
              ok-title="Add selected"
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
                thead-class="hidden_header"
                :current-page="currentPage"
                :per-page="perPage"
                >
          <template slot="title" slot-scope="data">
            <b-form-checkbox v-model="data.item.selected"> {{data.item.title}} </b-form-checkbox>
          </template>
      </b-table>
      <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
    </b-modal>

  </b-card>
</template>

<script>
import _get from 'lodash/get';
export default {
  name: 'connections',
  props: ['toConnectionData'],
  data() {
    return {
      relations: [],
      connectionsField: ['Title'],
      connectionsFieldToAdd: ['title', 'description'],
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
    },
    handleSelect(element) {
      if (element) {
        element.selected = !element.selected;
        return element;
      }
    },
    async setCurrentConnectionType(element) {
      this.currentConnectionType = element;
      if (element === 'backlog') {
        await this.loadOrgBacklogs();
      } else if (element === 'initiative') {
        await this.loadOrgInitiatives();
      };
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
        this.totalRows = backlogs.lenght;
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
        this.totalRows = initiatives.lenght;
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
        newObj.options = [];
        connections.forEach(element => {
          newObj.options.push({text: element.title, value: element});
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
      console.log(this.connectionTable);
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
