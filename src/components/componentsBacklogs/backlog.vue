<template>
  <div class="backlog">
     <b-card bg-variant="light" class="card col-lg-12">

      <b-form-group horizontal
                    breakpoint="lg"
                    label="<h2>Backlog</h2>"
                    label-size="lg"
                    label-class="font-weight-bold pt-0"
                    class="container-fluid">
      </b-form-group>
        <div class="container-fluid row">
          <div class="col-12">
            <div>
              <label class="left">Created by: {{handleUsername(form.author)}} on {{new Date(form.createdAt).toLocaleString()}}</label>
            </div>
            <div>
              <label class="left" v-if="form.plannedOn" >Planned on: {{new Date(form.plannedOn).toLocaleString()}}</label>
            </div>
          </div>
          <div class="col-2" >
            <b-form-group label = "Status: " label-for = "labelStatus" label-size="sm" :label-cols="2">
              <b-dropdown :text="currentStatus" name="backlogStatus" size="sm" class="statuses m-2" >
                <b-dropdown-item
                v-for="element in objStatuses" v-if="objStatuses"
                v-bind:key="element.id"
                @click="handleBacklogSetField(element, 'status')"
                size = "sm"
                >{{ element.name }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
            <b-form-group label = "Assignee: " label-for = "BacklogAssignee" label-size="sm" :label-cols="2">
              <b-dropdown :text="handleUsername(form.assignee)" name="BacklogAssignee" size="sm" class="users m-2" >
                <b-dropdown-item
                v-for="element in users"
                v-bind:key="element.userId"
                @click="handleBacklogSetField(element, 'assignee')"
                size = "sm"
                >{{ handleUsername(element) }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
            <b-form-group label = "Points: " label-for = "BacklogPoints" label-size="sm" :label-cols="2">
              <b-dropdown :text="String(form.points)" name="BacklogPoints" size="sm" class="points m-2" >
                <b-dropdown-item
                v-for="element in pointsVar"
                v-bind:key="element"
                @click="handleBacklogSetField(element, 'points')"
                size = "sm"
                >{{ element }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>

          </div>
          <div class="col-10">
          <b-form-group horizontal
                      label="Title:"
                      label-class="text-sm-right"
                      label-for="Title">
          <b-form-input v-model="form.title" id="Title" class="text-center"></b-form-input>
          </b-form-group>
          <b-form-group horizontal
                      label="Title description:"
                      label-class="text-sm-right"
                      label-for="description"
                     >
            <b-form-textarea v-model="form.description"
                           id="description"
                           :rows="6"
                           :max-rows="8"
                           class="description text-center"
                           >
            </b-form-textarea>
          </b-form-group>
          </div>
          <div class="button-box">
            <b-button class="float-right" type="submit" variant="primary" @click="handleBacklogSaveBacklog()">Save</b-button>
           </div>
        </div>

    </b-card>

  </div>
</template>

<script>
import _get from 'lodash/get';
import _ from 'lodash';
import { username } from '@/utils';
export default {
  name: 'Backlog',
  data() {
    return {
      objStatuses: [],
      currentStatus: '',
      users: [],
      pointsVar: ['0', '1', '2', '3', '5', '8', '13', '21'],
      points: '',
      form: {
        title: '',
        description: '',
        points: '',
        status: {name: 'asdasd'},
        assignee: {firstName: '', lastName: '', email: '', id: ''},
        forecastedRelease: '',
        actualRelease: '',
        statusId: 0,
        id: '',
        Author: {firstName: '', lastName: '', email: ''}
      }
    };
  },
  async mounted() {
    await this.loadOrgStatuses();
    await this.loadOrgUsers();
    await this.loadBacklog();
  },

  computed: {
  },

  methods: {
    async loadBacklog() {
      this.$loading(true);
      const orgId = this.$route.query.orgId;
      const id = this.$route.query.id;
      try {
        const response = await this.axios.get('/api/backlogs/' + orgId + '/' + id);

        let success = _get(response, 'data.success');
        if (!success) this.$errorMessage.show('Unable to load current user profile');
        this.form = _get(response, 'data.backlog');
        if (this.objStatuses) this.form.status = _.find(this.objStatuses, { 'id': this.form.statusId });
        this.currentStatus = this.form.status.name;
        this.points = String(this.form.points);
        // if (this.users) this.form.assignee = _.find(this.users, { 'id': this.form.assignee });
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }

      this.$loading(false);
    },

    async handleBacklogSaveBacklog() {
      try {
        this.$loading(true);
        const orgId = this.$route.query.orgId;
        const id = this.$route.query.id;

        let data = JSON.parse(JSON.stringify(this.form));

        if (this.form.assignee) data.assignee = String(this.form.assignee.userId);
        if (this.currentStatus) data.statusId = String(this.form.status.id);

        if (!this.forecastedRelease) delete data['forecastedRelease'];
        if (!this.actualRelease) delete data['actualRelease'];
        if (!this.plannedOn) delete data['plannedOn'];

        delete data['author'];
        delete data['status'];
        delete data['id'];
        delete data['createdAt'];
        delete data['updatedAt'];
        delete data['createdBy'];

        data.points = String(data.points);
        console.log(this.form);

        const response = await this.axios.put(`/api/backlogs/edit/${orgId}/${id}`, data);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update backlog.`);

        this.$notify({group: 'app', type: 'success', text: 'Backlog updated'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        // this.loadBacklog();
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
    handleUsername(element) {
      return username(element);
    },
    handleBacklogSetField(element, name) {
      this.form[name] = element;
      console.log(this.form);
      if (name === 'status') this.currentStatus = element.name;
      if (name === 'status') this.points = element.name;
    },
    async loadOrgStatuses() {
      try {
        this.$loading(true);
        const orgId = this.$route.query.orgId;

        const response = await this.axios.get(`/api/statuses/${orgId}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        this.objStatuses = _get(response, 'data.statuses');
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
  .card {
    margin-top:50px;
  }
  .description {
    outline: 0in;
    border: 1px solid lightblue;
  }
</style>
