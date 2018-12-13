<template>
  <b-card bg-variant="light" class="card col-12">
    <div class="initiatives">
     <div class="row">
      <div class="col-12">
        <b-btn class="float-right btnHeader" variant="primary" size="sm" v-b-modal.modalnew> New</b-btn>
      </div>
      <div class="col-6">
      </div>
      <b-input-group  class="col-6">
        <b-form-input size="sm" v-model="filter" style="margin-top:5px;" placeholder="Filter" />
        <b-input-group-append>
          <b-btn size="sm" class="btnHeader "  :disabled="!filter" @click="filter = ''">Clear</b-btn>
        </b-input-group-append>
      </b-input-group >

      <b-table  bordered
                :fixed="false"
                :items="initiatives"
                :fields="initiativesFields"
                :filter="filter"
                :current-page="currentPage"
                :per-page="perPage"
                class="col-12"
                sort-by="horizon"
                @filtered="onFiltered"
                style="margin-top: 0.5em">
        <template slot="title" slot-scope="data">
            <router-link :to="'initiative/?orgId='+$store.state.organization.id +'&initiativeid='+ data.item.id">{{  data.item.title }}</router-link>
        </template>
        <template slot="author" slot-scope="data" class="col-4">
          <a :href="`#`" v-on:click="filter = data.item.author">
            {{ data.item.author }}
          </a>
          <div style="float: right;">
            <b-button style="vertical-align: right;" variant="primary" size="sm" :to="'initiative/?orgId='+$store.state.organization.id +'&initiativeid='+ data.item.id"><font-awesome-icon icon="pencil-alt" /> </b-button>
            <b-button v-if="$store.state.user.id ===  data.item.createdBy || admin" style="bottom" variant="danger" size="sm" v-b-modal.delete @click="setCurrentInitiative(data.item)"><font-awesome-icon icon="trash-alt" /></b-button>
          </div>
        </template>
        <template slot="importance" slot-scope="data" class="col-4">
          <a :href="`#`" v-on:click="filter = data.item.importance">
            {{ data.item.importance }}
          </a>
        </template>
        <template slot="horizon" slot-scope="data">
          <a :href="`#`" v-on:click="filter = data.item.horizon.horizon">
            {{  data.item.horizon.horizon }}
          </a>
        </template>
      </b-table>
      <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
    </div>

       <b-modal id="delete"
              :title="'Delete ' + currentInitiative.title + '?'"
              button-size="sm"
              size="sm"
              centered
              body-class="zero-size"
              ok-variant="danger"
              @ok="handleInitiativeDelete(currentInitiative)"
              ok-title="delete"
              >
      </b-modal>
      <b-modal id="modalnew"
              button-size="sm"
              title="New initiative"
              @ok="handleNewInitiative()"
              size="lg"
              centered
              v-model="show"
              ref="modalnew"
              :hide-footer="true"
              >
        <div class="container-fluid  row">
          <div class="col-7">
            <b-form-group label-for = "title">
              <b-form-input v-model="newInitiative.title" placeholder="Enter initiative" id="title">></b-form-input>
            </b-form-group>
            <b-form-group  label-for = "description">
              <b-form-textarea id="description"
                  v-model="newInitiative.description"
                  placeholder="Enter highlights"
                  :rows="3"
                  :max-rows="6">
              </b-form-textarea>
            </b-form-group>
          </div>
          <div class="col-5 row" >
            <b-form-group label = "Vote: " horizontal label-size="md" :label-cols="3" class="col-12">
              <template>
                <b-button v-model="vote" style="vertical-align: right;" size="lg" :variant.sync="btntrue" v-on:click="handleNewInitiativeSetField(true, 'vote')"><font-awesome-icon icon="thumbs-up"/> </b-button>
                <b-button v-model="vote" style="vertical-align: right;" size="lg" :variant.sync="btnfalse" v-on:click="handleNewInitiativeSetField(false, 'vote')"><font-awesome-icon icon="thumbs-down"/> </b-button>
              </template>
            </b-form-group>
            <b-form-group label = "Horizon:" label-for = "InitiativeHorizon" horizontal :label-cols="6" label-size="sm" class="col-12" style="margin-left: 1px;">
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
            <b-form-group label = "Priority:" label-for = "newInitiativeStatuses" horizontal :label-cols="6" label-size="sm" class="col-12" style="margin-left: 1px;">
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
          <div class="col-12">
            <div style="float: left">
              <b-button slot="modal-ok" style="vertical-align: right;" variant="primary" size="sm" @click="handleNewInitiative(false)">Save and close</b-button>
              <b-button style="vertical-align: right;" variant="primary" size="sm" @click="handleNewInitiative(true)">Save and open</b-button>
              <b-button style="vertical-align: right;" variant="primary" size="sm" @click="show = false">Cancel</b-button>
            </div>
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
        { key: 'title', sortable: true, thStyle: {width: '15%'}, label: 'Initiative' },
       // { key: 'description', label: 'Highlights', sortable: true, thStyle: { width: '35%' } },
        { key: 'popularity', sortable: true },
        { key: 'importance', sortable: true },
        { key: 'horizon', sortable: true },
        { key: 'author', sortable: true }
      ],
      filter: null,
      objStatuses: [],
      currentPage: 0,
      totalRows: 0,
      perPage: 10,
      newInitiative: { title: '', description: '', status: { id: 10, name: 'Should have' }, horizon: { date: new Date(), horizon: this.getHorizonName(new Date()) }, vote: null },
      horizonList: [],
      vote: '',
      btntrue: '',
      btnfalse: '',
      show: false,
      currentInitiative: '',
      admin: false
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
    setCurrentInitiative(element) {
      this.currentInitiative = element;
    },
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    handleCloseNew() {
      this.$refs.modalnew.hide();
    },
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
          element.horizon = {
            date: element.horizon,
            horizon: this.getHorizonName(new Date(element.horizon))
          };
        });
        this.totalRows = initiatives.length;

        this.initiatives = initiatives;
        this.admin = _get(response, 'data.admin');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleInitiativeDelete(initiative) {
      if (!initiative || !this.$store.state.user.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        const response = await this.axios.delete(`/api/initiatives/${this.$store.state.organization.id}/${initiative.id}`);
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new organization.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgInitiatives();
        this.$notify({group: 'app', type: 'success', text: `Item ${initiative.title} was deleted`});
        this.currentInitiative = '';
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
    async handleNewInitiative(go) {
      try {
        let data = {};
        data.statusId = String(this.newInitiative.status.id);
        data.description = this.newInitiative.description;
        data.title = this.newInitiative.title;
        data.horizon = this.formatDate(this.newInitiative.horizon.date);
        const response = await this.axios.post(`/api/initiatives/new/${this.$store.state.organization.id}`, data);
        const success = _get(response, 'data.success');
        if (success) {
          const createdInitiative = _get(response, 'data.initiative');
          if (this.vote !== '') this.doVote(this.vote, createdInitiative.id);
          if (go === true) {
            window.location.href = 'initiative/?orgId=' + this.$store.state.organization.id + '&initiativeid=' + createdInitiative.id;
          };
        };
        if (!success) throw new Error(`Unable to create new initiative.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.newInitiative = { title: '', description: '', status: { id: 12, name: "Won't have" }, horizon: { date: new Date(), horizon: this.getHorizonName(new Date()) }, vote: null };
        this.vote = '';
        this.btntrue = '';
        this.btnfalse = '';
        this.show = false;
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
          this.btnfalse = 'danger';
        };
       //  this.$nextTick();
      };
    },
    async doVote(result, initiativeId) {
      try {
        // this.$loading(true);
        const response = await this.axios.post(`/api/votes/initiatives/` + initiativeId + '/' + String(result));

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to vote.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        // this.$loading(false);
      }
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
  .btnHeader {
      width: 4.5em;
      height: 2em;
      float: right;
      margin-top:5px;
    }
  };
</style>
