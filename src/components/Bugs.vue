<template>
   <b-card bg-variant="light" class="card col-12">
    <div class="bugs">
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
                :items="bugs"
                :fields="bugsFields"
                :filter="filter"
                :current-page="currentPage"
                :per-page="perPage"
                class="col-12"
                @filtered="onFiltered"
                style="margin-top: 0.5em">
        <template slot="title" slot-scope="data">
            <router-link :to="'bug/?orgId='+$store.state.organization.id +'&bugid='+ data.item.id">{{  data.item.title }}</router-link>
        </template>
        <template slot="severity" slot-scope="data">
          <a :href="`#`" v-on:click="filter = data.item.severity">
            {{  data.item.severity }}
          </a>
        </template>
        <template slot="status" slot-scope="data">
          <a :href="`#`" v-on:click="filter = data.item.status.name">
            {{  data.item.status.name }}
          </a>
        </template>
        <template slot="reportedBy" slot-scope="data">
          <a :href="`#`" v-on:click="filter = data.item.reportedBy">
            {{  data.item.reportedBy }}
          </a>
        </template>
        <template slot="assignedTo" slot-scope="data">
          <a :href="`#`" v-on:click="filter = data.item.assignedTo">
            {{  data.item.assignedTo }}
          </a>
        </template>
        <template slot="createdAt" slot-scope="data" class="col-4">
          {{ data.item.createdAt }}
          <div style="float: right;">
            <b-button style="vertical-align: right;" variant="primary" size="sm" :to="'bug/?orgId='+$store.state.organization.id +'&bugid='+ data.item.id"><font-awesome-icon icon="pencil-alt" /> </b-button>
            <b-button v-if="$store.state.user.id ===  data.item.createdBy || admin" style="bottom" variant="danger" size="sm" v-b-modal.delete @click="setCurrentBug(data.item)"><font-awesome-icon icon="trash-alt" /></b-button>
          </div>
        </template>
      </b-table>
      <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
    </div>

    <b-modal id="delete"
          :title="'Delete ' + currentBug.title + '?'"
          button-size="sm"
          size="sm"
          centered
          body-class="zero-size"
          ok-variant="danger"
          @ok="handleBugDelete(currentBug)"
          ok-title="delete"
          >
    </b-modal>

    <b-modal id="modalnew"
            button-size="sm"
            title="New bug"
            @ok="handleNewBug()"
            size="lg"
            centered
            v-model="show"
            ref="modalnew"
            :hide-footer="true"
            >
      <div class="container-fluid  row">
        <div class="col-7">
          <b-form-group label-for = "title">
            <b-form-input v-model="newBug.title" placeholder="Enter bug" id="title">></b-form-input>
          </b-form-group>
        </div>
        <div class="col-5">
        </div>
        <b-form-group label= "Severity" label-for="newBugSeverity" label-size="sm" class="col-3">
          <b-dropdown :text="newBug.severity" name="newBugSeverity" size="sm" class="severity m-2" >
            <b-dropdown-item
            v-for="element in severityArray" v-if="severityArray"
            v-bind:key="element"
            @click="handleNewBugSetField(element, 'severity')"
            size = "sm"
            >{{ element }}
            </b-dropdown-item>
          </b-dropdown>
        </b-form-group>
        <b-form-group label= "Status" label-for="newBugStatus" label-size="sm" class="col-3">
          <b-dropdown :text="newBug.status.name" name="newBugStatus" size="sm" class="status m-2" >
            <b-dropdown-item
            v-for="element in objStatuses" v-if="objStatuses"
            v-bind:key="element.id"
            @click="handleNewBugSetField(element, 'status')"
            size = "sm"
            >{{ element.name }}
            </b-dropdown-item>
          </b-dropdown>
        </b-form-group>
        <b-form-group  label = "Reported by: " label-for = "newBugReportedBy" label-size="sm" class="col-3" >
          <b-dropdown :text="handleUsername(newBug.reportedBy)" name="newBugReportedBy" size="sm" class="users m-2" >
            <b-dropdown-item
            v-for="element in users"
            v-bind:key="element.userId"
            @click="handleNewBugSetField(element, 'reportedBy')"
            size = "sm"
            >{{ handleUsername(element) }}
            </b-dropdown-item>
          </b-dropdown>
        </b-form-group>
        <b-form-group  label = "Assigned to: " label-for = "newBugAssignedTo" label-size="sm" class="col-3">
          <b-dropdown :text="handleUsername(newBug.assignee)" name="newBugAssignedTo" size="sm" class="users m-2" >
            <b-dropdown-item
            v-for="element in users"
            v-bind:key="element.userId"
            @click="handleNewBugSetField(element, 'assignee')"
            size = "sm"
            >{{ handleUsername(element) }}
            </b-dropdown-item>
          </b-dropdown>
        </b-form-group>

        <b-form-group  label-for = "description" class="col-12">
          <b-form-textarea id="description"
              v-model="newBug.description"
              placeholder="Enter description"
              :rows="3"
              :max-rows="6">
          </b-form-textarea>
        </b-form-group>
        <div class="col-12">
          <div style="float: left">
            <b-button slot="modal-ok" style="vertical-align: right;" variant="primary" size="sm" @click="handleNewBug(false)">Save and close</b-button>
            <b-button style="vertical-align: right;" variant="primary" size="sm" @click="handleNewBug(true)">Save and open</b-button>
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
export default {
  name: 'Bugs',
  data() {
    return {
      bugs: [],
      bugsFields:
      [
        { key: 'title', sortable: true, thStyle: {width: '15%'}, label: 'Bug' },
       // { key: 'description', label: 'Highlights', sortable: true, thStyle: { width: '35%' } },
        { key: 'severity', sortable: true },
        { key: 'status', sortable: true },
        { key: 'reportedBy', sortable: false, label: 'Reported by' },
        { key: 'assignedTo', sortable: false, label: 'Assigned to' },
        { key: 'createdAt', sortable: true, label: 'Created' }
      ],
      filter: null,
      objStatuses: [],
      currentPage: 0,
      totalRows: 0,
      perPage: 10,
      newBug: { title: '', description: '', severity: 'P2', status: {name: 'None', id: 0}, reportedBy: {}, assignee: {} },
      // newBug: { title: '', description: '', status: { id: 10, name: 'Should have' }, horizon: { date: new Date(), horizon: this.getHorizonName(new Date()) }, vote: null },
      show: false,
      currentBug: '',
      admin: false,
      severityArray: ['P0', 'P1', 'P2', 'P3'],
      users: []
    };
  },
  async mounted() {
    this.setCurrentUser();
    await this.loadOrgStatuses();
    await this.loadOrgBugs();
    await this.loadOrgUsers();
  },

  computed: {
  },

  methods: {
    setCurrentUser() {
      this.newBug.reportedBy = this.$store.state.user;
      this.newBug.reportedBy.userId = this.newBug.reportedBy.id;
      this.newBug.assignee = this.$store.state.user;
      this.newBug.assignee.userId = this.newBug.assignee.id;
    },
    setCurrentBug(element) {
      this.currentBug = element;
    },
    handleUsername (element) {
      return username(element);
    },
    async loadOrgStatuses() {
      try {
        this.$loading(true);
        const orgId = this.$store.state.organization.id;

        const response = await this.axios.get(`/api/statuses/bugs/${orgId}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        this.objStatuses = _get(response, 'data.statuses');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async loadOrgUsers() {
      try {
        const orgId = this.$store.state.organization.id;
        this.$loading(true);
        const response = await this.axios.get(`/api/org/${orgId}/users`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const users = _get(response, 'data.users');

        this.users = users;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleNewBug(go) {
      try {
        let data = {};
        const orgId = this.$store.state.organization.id;
        data.assignee = String(this.newBug.assignee.userId);
        data.description = this.newBug.description;
        data.title = this.newBug.title;
        data.severity = this.newBug.severity;
        data.createdBy = String(this.newBug.reportedBy.userId);
        if (this.newBug.status.id !== 0) data.statusId = String(this.newBug.status.id);

        const response = await this.axios.post(`/api/bugs/new/${orgId}`, data);
        const success = _get(response, 'data.success');
        if (success) {
          const createdBug = _get(response, 'data.bugs');
          if (go === true) {
            this.$router.push({ name: 'bug', query: {orgid: orgId, bug: createdBug.id} });
          };
        };
        if (!success) throw new Error(`Unable to create new bug.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.newBug = { title: '', description: '', severity: 'P2', status: {name: 'None', id: 0}, reportedBy: {}, assignee: {} };
        this.show = false;
        this.loadOrgBugs();
        this.setCurrentUser();
      }
    },
    async handleBugDelete(bug) {
      if (!bug || !this.$store.state.user.id) {
      }
      try {
        const response = await this.axios.delete(`/api/bugs/${this.$store.state.organization.id}/${bug.id}`);
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to delete bug.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgBugs();
        this.$notify({group: 'app', type: 'success', text: `Item ${bug.title} was deleted`});
        this.currentBug = '';
      }
    },
    handleNewBugSetField(element, name) {
      this.newBug[name] = element;
    },
    async loadOrgBugs() {
      try {
        this.$loading(true);
        const response = await this.axios.get(`/api/bugs/full/${this.$store.state.organization.id}` + '/false');

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const bugs = _get(response, 'data.bugs');
        bugs.forEach(element => {
          element.reportedBy = username(element.reportedByData);
          element.assignedTo = username(element.assigneeData);
          if (element.statusId) {
            element.status = _.find(this.objStatuses, { 'id': element.statusId });
          } else {
            element.status = {name: 'None', id: 0};
          };
          element.createdAt = new Date(element.createdAt).toLocaleString();
        });
        this.totalRows = bugs.length;

        this.bugs = bugs;
        this.admin = _get(response, 'data.admin');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    }
  },

  components: {
  }
};
</script>

<style lang="scss">
 .card {
    margin-top:50px;
  }
  .bugs {
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
