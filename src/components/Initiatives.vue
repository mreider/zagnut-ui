<template>
  <b-card bg-variant="light" class="card col-lg-12">
    <div class="initiatives">
      <div class="container-fluid row">
        <label class="header col-12"><h2>Initiatives</h2></label>
        <b-form-group label="Filter" size="sm" class="col-6 mb-2">
          <b-input-group>
            <b-form-input size="sm" v-model="filter" placeholder="Type to Search" />
            <b-input-group-append>
              <b-btn size="sm" :disabled="!filter" @click="filter = ''">Clear</b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <div class="col-6">
          <div>
            <b-btn class="float-right" style="margin-top: 2em" variant="success" size="sm" v-b-modal.modalnew>➕ Add an initiative</b-btn>
          </div>
        </div>
      </div>
      <b-table  bordered
                :fixed="false"
                :items="initiatives"
                :fields="initiativesFields"
                :filter="filter"
                :current-page="currentPage"
                :per-page="perPage"
                class="col-lg-12">
        <template slot="title" slot-scope="data">
            {{  data.item.title }}
        </template>
        <template slot="author" slot-scope="data" class="col-4">
          <a :href="`#`" v-on:click="filter = data.item.author">
            {{ data.item.author }}
          </a>
          <div style="float: right;">
            <b-button style="vertical-align: right;" variant="primary" size="sm" :to="'initiatives/?orgId='+$store.state.organization.id +'&initiativeid='+ data.item.id"><font-awesome-icon icon="pencil-alt" /> </b-button>
          </div>
        </template>
        <template slot="importance" slot-scope="data" class="col-4">
          <a :href="`#`" v-on:click="filter = data.item.importance">
            {{ data.item.importance }}
          </a>
        </template>
        <template slot="horizon" slot-scope="data">
          <a :href="`#`" v-on:click="filter = data.item.horizon">
            {{  data.item.horizon }}
          </a>
        </template>
      </b-table>
      <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />

      <b-modal id="modalnew"
              button-size="sm"
              title="New initiative"
              @ok="handleNewInitiative()"
              size="lg"
              centered
              >
        <div class="container-fluid  row">
          <div class="col-8">
            <b-form-group label = "Title: " label-for = "title">
              <b-form-input v-model="newInitiative.title" placeholder="Title initiative" id="title">></b-form-input>
            </b-form-group>
            <b-form-group label = "Highlights: " label-for = "description">
              <b-form-textarea id="description"
                  v-model="newInitiative.description"
                  placeholder="Highlights"
                  :rows="3"
                  :max-rows="6">
              </b-form-textarea>
            </b-form-group>
          </div>
          <div class="col-4" >
            <b-form-group label = "Vote: ">
              <template>
                <b-button v-model="vote" style="vertical-align: right;" size="lg" :variant.sync="btntrue" v-on:click="handleNewInitiativeSetField(true, 'vote')"><font-awesome-icon icon="thumbs-up"/> </b-button>
                <b-button v-model="vote" style="vertical-align: right;" size="lg" :variant.sync="btnfalse" v-on:click="handleNewInitiativeSetField(false, 'vote')"><font-awesome-icon icon="thumbs-down"/> </b-button>
              </template>
            </b-form-group>
            <b-form-group label = "Horizon: " label-for = "newInitiativeHorizon">
                <b-dropdown :text="newInitiative.horizon.horizon" name="newInitiativeHorizon" size="sm" class="horizon m-2" >
                <b-dropdown-item
                v-for="element in horizonList" v-if="horizonList"
                v-bind:key="element.horizon"
                @click="handleNewInitiativeSetField(element, 'horizon')"
                size = "sm"
                >{{ element.horizon }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
            <div class="newInitiativetable row" >
              <div class="col-6">
                <b-form-group label = "Status: " label-for = "newInitiativeStatuses">
                  <b-dropdown :text="newInitiative.status.name" name="newInitiativeStatuses" size="sm" class="statuses m-2" >
                    <b-dropdown-item
                    v-for="element in objStatuses" v-if="objStatuses"
                    v-bind:key="element.id"
                    @click="handleNewInitiativeSetField(element, 'status')"
                    size = "sm"
                    >{{ element.name }}
                    </b-dropdown-item>
                  </b-dropdown>
                </b-form-group>
              </div>
            </div>
          </div>
          <div class="col-8">
          </div>
          <div class="col-4">
          </div>

        </div>
      </b-modal>

    </div>
  </b-card>
</template>

<script>
import _get from 'lodash/get';
import _ from 'lodash';
import { username } from '@/utils';
import Connections from './common/connections.vue';
export default {
  name: 'Initiatives',
  data() {
    return {
      initiatives: [],
      initiativesFields:
      [
        { key: 'title', sortable: true },
        { key: 'description', label: 'highlihts', sortable: true, thStyle: { width: '35%' } },
        { key: 'popularity', sortable: true },
        { key: 'importance', sortable: true },
        { key: 'horizon', sortable: false },
        { key: 'author', sortable: true }
      ],
      filter: null,
      objStatuses: [],
      currentPage: 0,
      totalRows: 0,
      perPage: 10,
      newInitiative: { title: '', description: '', popularity: 0, status: { id: 12, name: "Won't have" }, horizon: { date: new Date(), horizon: this.getHorizonName(new Date()) }, vote: null },
      horizonList: [],
      vote: '',
      btntrue: '',
      btnfalse: ''
    };
  },

  computed: {
  },
  async mounted() {
    await this.loadOrgStatuses();
    await this.loadOrgInitiatives();
    this.horizonLoadList();
  },

  methods: {
    horizonLoadList() {
      let newDate = new Date();
      let obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);

      newDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
      obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);

      newDate = new Date(new Date().setMonth(new Date().getMonth() + 6));
      obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);

      newDate = new Date(new Date().setMonth(new Date().getMonth() + 9));
      obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);

      newDate = new Date(new Date().setMonth(new Date().getMonth() + 12));
      obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);

      newDate = new Date(new Date().setMonth(new Date().getMonth() + 15));
      obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);
    },
    async loadOrgInitiatives() {
      try {
        this.$loading(true);
        const response = await this.axios.get(`/api/initiatives/${this.$store.state.organization.id}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const initiatives = _get(response, 'data.initiatives');
        initiatives.forEach(element => {
          element.author = username(element);
          element.importance = _.find(this.objStatuses, { 'id': element.statusId }).name;
          element.horizon = this.getHorizonName(new Date(element.horizon));
        });
        this.totalRows = initiatives.lenght;
        this.initiatives = initiatives;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async loadOrgStatuses() {
      try {
        this.$loading(true);
        const orgId = this.$store.state.organization.id;

        const response = await this.axios.get(`/api/statuses/initiatives/${orgId}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        this.objStatuses = _get(response, 'data.statuses');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleNewInitiative() {
      try {
        let data = {};
        data.statusId = String(this.newInitiative.status.id);
        data.description = this.newInitiative.description;
        data.title = this.newInitiative.title;
        data.horizon = this.formatDate(this.newInitiative.horizon.date);
        data.popularity = String(this.newInitiative.popularity);
        const response = await this.axios.post(`/api/initiatives/new/${this.$store.state.organization.id}`, data);
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new item.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.newInitiative = { title: '', description: '', popularity: 0, status: { id: 12, name: "Won't have" }, horizon: { date: new Date(), horizon: this.getHorizonName(new Date()) }, vote: null };
        this.loadOrgInitiatives();
      }
    },
    handleNewInitiativeSetField(element, name) {
      this.newInitiative[name] = element;
      if (name === 'vote') {
        this.vote = element;
        if (element === true) {
          this.btntrue = 'success';
          this.btnfalse = '';
        } else {
          this.btntrue = '';
          this.btnfalse = 'success';
        };
       //  this.$nextTick();
      };
    },
    getHorizonName(d) {
      const month = d.getMonth();
      const year = d.getFullYear();
      let quarter = 0;
      if (month < 3) {
        quarter = 1;
      } else if (month < 6) {
        quarter = 2;
      } else if (month < 9) {
        quarter = 3;
      } else if (month < 12) {
        quarter = 4;
      }
      return 'Q' + quarter + year;
    },
    formatDate(d) {
      const month = d.getMonth();
      const year = d.getFullYear();
      const day = d.getDate();
      return year + '-' + month + '-' + day;
    }
  },
  components: {
    connections: Connections
  }
};
</script>

<style lang="scss">
 .card {
    margin-top:50px;
  }
  .initiatives {
    .header {
      margin-top:10px;
    }
    .hidden_header {
      // display: none;
    }

  };
</style>
