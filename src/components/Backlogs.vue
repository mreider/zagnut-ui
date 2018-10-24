<template>
  <div class="backlogs">

    <label class="header"><h2>Some things to do</h2></label>
    <div class="headerMenu">
      <label class="labelGroupBy" for="groupBy"> <h4> Group by: </h4></label>
      <b-dropdown :text="currentGroupBy" name="groupBy" size="sm" class="m-2" >
        <b-dropdown-item
        v-for="element in groupByList" v-if="groupByList"
        v-bind:key="element"
        @click="handleChangeGroupBy(element)"
        size = "sm"
        >{{ element }}
        </b-dropdown-item>
      </b-dropdown>

      <div>
        <label class="labelCheckboxGroup" for="checkboxGroup"> <h6> Show: </h6></label>
        <b-form-checkbox-group id="statuses"
                          v-model="selected"
                          name="stats"
                          :options="statuses"
                          aria-label="Statuses"
                          class="checkboxGroup"
                          >
        </b-form-checkbox-group>
      </div>

      <div class="button-box">
        <b-btn variant="success" size="sm" v-b-modal.modalnew>➕ New item</b-btn>
      </div>
    </div>

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
        <b-form-group label = "Description: " label-for = "textarea1" horizontal>
          <b-form-textarea id="textarea1"
              v-model="newBacklog.description"
              placeholder="Title description"
              :rows="3"
              :max-rows="6">
          </b-form-textarea>
        </b-form-group>
      </div>

      <div class="newBacklogtable row" >
        <div class="col">
          <b-form-group label = "Status: " label-for = "labelStatus" horizontal>
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
          <b-form-group label = "Assignee: " label-for = "newBacklogAssignee" horizontal>
          <b-dropdown :text="username(newBacklog.assignee)" name="newBacklogAssignee" size="sm" class="users m-2" >
            <b-dropdown-item
            v-for="element in users"
            v-bind:key="element.userId"
            @click="handleBacklogNewItemSetField(element, 'assignee')"
            size = "sm"
            >{{ username(element) }}
            </b-dropdown-item>
          </b-dropdown>
          </b-form-group>
        </div>

        <div class="col">
          <div class="input-group">
            <b-form-group label = "Points: " label-for = "points" horizontal>
              <b-form-input v-model="newBacklog.points" id="points" type="number" min="0" style="width:50%">{{newBacklog.points}}</b-form-input>
            </b-form-group>
          </div>
        </div>
      </div>
    </b-modal>

  </div>
</template>

<script>
import _get from 'lodash/get';
import _ from 'lodash';
export default {
  name: 'Backlogs',
  data() {
    return {
      statuses: [],
      objStatuses: [],
      groupByList: ['Status', 'Stategic initiative'],
      currentGroupBy: 'Status',
      selected: [],
      users: [],
      newBacklog: {title: '', description: '', points: 0, status: { id: 1, name: 'Unplaned' }, assignee: {}}
    };
  },
  async mounted() {
    await this.loadOrgUsers();
    await this.loadOrgStatuses();
  },

  computed: {
  },

  methods: {
    async loadOrgStatuses() {
      try {
        this.$loading(true);

        const response = await this.axios.get(`/api/statuses/${this.$store.state.organization.id}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let objStatuses = _get(response, 'data.statuses');
        let statuses = _.map(objStatuses, v => v.name);
        this.objStatuses = objStatuses;
        this.statuses = statuses;
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

        this.users = users;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleChangeGroupBy(element) {
      this.currentGroupBy = element;
      // todo reload form with selected value give sort as param backend
    },
    async handleBacklogNewItemSetField(element, name) {
      this.newBacklog[name] = element;
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
        // todo reload list backlogs
        this.newBacklog = {title: '', description: '', points: 0, status: { id: 1, name: 'Unplaned' }, assignee: ''};
      }
    },
    username(user) {
      const {firstName, lastName, email} = user;
      if (firstName && lastName) return `${firstName} ${lastName}`;
      else if (firstName) return firstName;
      else if (lastName) return lastName;

      return email;
    }
  },
  watch: {
    selected (newVal, oldVal) {
      // todo update list backlogs
      // console.log(this.selected);
    }
  },
  components: {
  }
};
</script>

<style lang="scss">
  .backlogs {
    .header {
      margin-top:50px;
    }.col-form {
    //  color: aqua;
      margin: auto;
      // vertical-align: bottom;
    }
  }
</style>
