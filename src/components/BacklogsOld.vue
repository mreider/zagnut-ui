<template>
<b-card bg-variant="light" class="card col-lg-12">
  <div class="backlogs">
    <div class="container-fluid row">
      <label class="header col-12"><h2>Backlogs</h2></label>
      <div class="col-4">
        <b-form-group label = "Group by:" label-for = "checkboxGroup" :label-cols="4">
          <b-dropdown :text="currentGroupBy" name="groupBy" size="sm" class="m-2" >
            <b-dropdown-item
            v-for="element in groupByList" v-if="groupByList"
            v-bind:key="element"
            @click="handleChangeGroupBy(element)"
            size = "sm"
            >{{ element }}
            </b-dropdown-item>
          </b-dropdown>
        </b-form-group>
      </div>

      <div class="col-8">
        <b-form-group label = "Show: " label-for = "statuses" class="float-right">
          <b-form-checkbox-group id="statuses" name="statuses" v-model="selected" :options="options" class="float-right">
          </b-form-checkbox-group>
          <div>
            <b-btn class="float-right" style="margin-top: 2em" variant="success" size="sm" v-b-modal.modalnew>➕ New item</b-btn>
          </div>
        </b-form-group>
      </div>

      <b-form-group label="Filter" class="col-6 mb-2">
        <b-input-group>
          <b-form-input v-model="filter" placeholder="Type to Search" />
          <b-input-group-append>
            <b-btn size="sm" :disabled="!filter" @click="filter = ''">Clear</b-btn>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
    </div>
    <div v-for="element in selected" v-bind:key="element.id" class="container-fluid row"> <h6>{{ element.name }}</h6>
      <b-table  bordered
                fixed
                responsive
                :items="element.filteredBacklogs"
                :fields="backlogsFields"
                thead-class="hidden_header"
                :filter="filter"
                >
        <template slot="title" slot-scope="data" class="col-8">
          <a :href="`#`" v-b-modal.edit @click="setCurrentBacklog(data.item)">
            {{  data.item.title }}
          </a>
        </template>
        <template slot="author" slot-scope="data" class="col-4">
          <a :href="`#`" v-on:click="filter = data.item.author">
            {{ data.item.author }}
          </a>
          <div style="float: right;">
            <b-button style="vertical-align: right;" variant="primary" size="sm" :to="'backlog/?orgId='+$store.state.organization.id +'&id='+ data.item.id">🖉</b-button>
            <b-button style="bottom" variant="danger" size="sm" v-b-modal.delete @click="setCurrentBacklog(data.item)">✖</b-button>
          </div>
        </template>
      </b-table>
    </div>

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
      <div>
        <b-form-group label = "Description: " label-for = "description" horizontal>
          <b-form-textarea id="description"
              v-model="newBacklog.description"
              placeholder="Title description"
              :rows="3"
              :max-rows="6">
          </b-form-textarea>
        </b-form-group>
      </div>

      <div class="newBacklogtable row" >
        <div class="col">
          <b-form-group label = "Status: " label-for = "labelStatus">
            <b-dropdown :text="newBacklog.status.name" name="newBacklogStatuses" size="sm" class="statuses m-2" >
              <b-dropdown-item
              v-for="element in objStatuses" v-if="objStatuses"
              v-bind:key="element.id"
              @click="handleBacklogNewItemSetField(element, 'status')"
              size = "sm"
              >{{ element.name }}
              </b-dropdown-item>
            </b-dropdown>
          </b-form-group>
        </div>

        <div class="col">
          <b-form-group label = "Assignee: " label-for = "newBacklogAssignee">
            <b-dropdown :text="handleUsername(newBacklog.assignee)" name="newBacklogAssignee" size="sm" class="users m-2" >
              <b-dropdown-item
              v-for="element in users"
              v-bind:key="element.userId"
              @click="handleBacklogNewItemSetField(element, 'assignee')"
              size = "sm"
              >{{ handleUsername(element) }}
              </b-dropdown-item>
            </b-dropdown>
          </b-form-group>
        </div>

        <div class="col">
          <b-form-group label = "Points: " label-for = "newBacklogPoints">
              <b-dropdown :text="String(newBacklog.points)" name="newBacklogPoints" size="sm" class="points m-2" >
                <b-dropdown-item
                v-for="element in pointsVar"
                v-bind:key="element"
                @click="handleBacklogNewItemSetField(element, 'points')"
                size = "sm"
                >{{ element }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
        </div>
      </div>
    </b-modal>

  </div>
  </b-card>
</template>

<script>
import _get from 'lodash/get';
import _ from 'lodash';
import Backlog from './componentsBacklogs/backlog.vue';
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
      newBacklog: { title: '', description: '', points: 0, status: { id: 1, name: 'Unplaned' }, assignee: {} },
      backlogs: [],
      pointsVar: ['0', '1', '2', '3', '5', '8', '13', '21'],
      backlogsFields: ['title', 'author'],
      newNameOldBacklog: '',
      currentBacklog: '',
      filter: null,
      perPage: 5
    };
  },
  async mounted() {
    await this.loadOrgUsers();
    await this.loadOrgStatuses(true);
    this.selected.forEach(element => {
      this.options.push({text: element.name, value: element});
    });
  },

  computed: {
  },

  methods: {
    async loadOrgStatuses(firstLoad) {
      try {
        this.$loading(true);
        await this.loadOrgBacklogs();

        const response = await this.axios.get(`/api/statuses/${this.$store.state.organization.id}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let objStatuses = _get(response, 'data.statuses');

        this.objStatuses = objStatuses;
        this.objStatuses.forEach(element => {
          element.filteredBacklogs = _.filter(this.backlogs, { statusId: element.id });
          element.totalRows = element.filteredBacklogs.length;
          element.currentPage = 1;
        });
        if (firstLoad) this.selected = this.objStatuses;

        if (!firstLoad) {
          this.selected.forEach(element => {
            element.filteredBacklogs = _.filter(this.backlogs, { statusId: element.id });
            element.totalRows = element.filteredBacklogs.length;
            element.currentPage = 1;
          });
        }
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async loadOrgUsers() {
      try {
        this.$loading(true);
        const response = await this.axios.get(`/api/org/${this.$store.state.organization.id}/users`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const users = _get(response, 'data.users');
        this.newBacklog.assignee = this.$store.state.user;

        this.users = users;
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
        if (!success) throw new Error(`Unable to load user's organizations.`);

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
        this.loadOrgStatuses(false);
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
        this.loadOrgStatuses(false);
        this.$notify({group: 'app', type: 'success', text: `Backlog ${backLog.title} was deleted`});
        this.currentBacklog = '';
      }
    },
    async handleNewBacklog() {
      try {
        let data = {};
        data.assignee = String(this.newBacklog.assignee.userId);
        data.statusId = String(this.newBacklog.status.id);
        data.points = String(this.newBacklog.points);
        data.description = this.newBacklog.description;
        data.title = this.newBacklog.title;
        const response = await this.axios.put(`/api/backlogs/new/${this.$store.state.organization.id}`, data);
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new backlog.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgStatuses(false);
        this.newBacklog = {title: '', description: '', points: 0, status: { id: 1, name: 'Unplaned' }, assignee: ''};
      }
    },
    handleUsername (element) {
      return username(element);
    },
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.selected.forEach(element => {
        element.totalRows = filteredItems.length;
        element.currentPage = 1;
      });
    }
  },
  watch: {
    selected(newVal, oldVal) {
      this.loadOrgStatuses(false);
    }
  },
  components: {
    backlog: Backlog
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
