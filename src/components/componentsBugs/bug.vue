<template>
  <div class="bug col-12">
     <b-card bg-variant="light" class="card col-lg-12">
        <div class="container-fluid  row">
        <div class="col-7">
          <b-form-group label-for = "title">
            <b-form-input v-model="form.title" placeholder="Enter bug" id="title">></b-form-input>
            <label class="left">Created by  {{handleUsername(form.reportedBy)}} on {{form.createdAt}}</label>
          </b-form-group>
        </div>
        <div class="col-5">
        </div>
        <b-form-group label= "Severity" label-for="formSeverity" label-size="sm" class="col-3">
          <b-dropdown :text="form.severity" name="formSeverity" size="sm" class="severity m-2" >
            <b-dropdown-item
            v-for="element in severityArray"
            v-bind:key="element"
            @click="handleBugSetField(element, 'severity')"
            size = "sm"
            >{{ element }}
            </b-dropdown-item>
          </b-dropdown>
        </b-form-group>
        <b-form-group label= "Status" label-for="formStatus" label-size="sm" class="col-3">
          <b-dropdown :text="form.status.name" name="formStatus" size="sm" class="status m-2" >
            <b-dropdown-item
            v-for="element in objStatuses"
            v-bind:key="element.id"
            @click="handleBugSetField(element, 'status')"
            size = "sm"
            >{{ element.name }}
            </b-dropdown-item>
          </b-dropdown>
        </b-form-group>
        <b-form-group  label = "Reported by: " label-for = "formgReportedBy" label-size="sm" class="col-3" >
          <b-dropdown :text="handleUsername(form.reportedBy)" name="formReportedBy" size="sm" class="users m-2" >
            <b-dropdown-item
            v-for="element in users"
            v-bind:key="element.id"
            @click="handleBugSetField(element, 'reportedBy')"
            size = "sm"
            >{{ handleUsername(element) }}
            </b-dropdown-item>
          </b-dropdown>
        </b-form-group>
        <b-form-group  label = "Assigned to: " label-for = "formAssignedTo" label-size="sm" class="col-3">
          <b-dropdown :text="handleUsername(form.assignee)" name="formgAssignedTo" size="sm" class="users m-2" >
            <b-dropdown-item
            v-for="element in users"
            v-bind:key="element.id"
            @click="handleBugSetField(element, 'assignee')"
            size = "sm"
            >{{ handleUsername(element) }}
            </b-dropdown-item>
          </b-dropdown>
        </b-form-group>

        <b-form-group  label-for = "description" class="col-12">
          <b-form-textarea id="description"
              v-model="form.description"
              placeholder="Enter description"
              :rows="3"
              :max-rows="6">
          </b-form-textarea>
        </b-form-group>
        <div class="col-12">
          <Connections :toConnectionData='toConnectionData'>
          </Connections>
        </div>
        <div class="button-box col-12" style="margin-top:20px;">
            <b-form-group class="float-left" label = "Archived: " label-for = "checkbox1" label-size="sm" :label-cols="7" horizontal>
              <b-form-checkbox id="checkbox1" class="m-2" v-model="form.archived" > </b-form-checkbox>
            </b-form-group>
            <div class="float-right">
              <b-btn size="sm" type="submit" variant="primary" @click="handleSaveBug()">Save & close</b-btn>
              <b-btn size="sm" @click="$router.go(-1)"> Back </b-btn>
              <b-btn variant="danger" size="sm" v-b-modal.deletebug>Delete</b-btn>
            </div>
            <Comments :toCommentsData='toCommentsData' ref="comments_ref">
            </Comments>
        </div>
      </div>
    </b-card>
    <b-modal id="deletebug"
          :title="'Wait. Are you sure you want to delete this permanently?'"
          button-size="sm"
          size="sm"
          centered
          body-class="zero-size"
          ok-variant="danger"
          @ok="handleBugDelete()"
          ok-title="delete"
          >
    </b-modal>
  </div>
</template>

<script>

import _get from 'lodash/get';
import _ from 'lodash';
import Connections from '../common/connections.vue';
import Comments from '../common/comments.vue';
import { username } from '@/utils';
export default {
  name: 'bug',
  data() {
    return {
      toConnectionData: {name: 'bug', id: this.$route.query.bugid, connects: ['initiative', 'item']},
      toCommentsData: {name: 'bugs', id: this.$route.query.bugid, admin: false},
      objStatuses: [],
      severityArray: ['P0', 'P1', 'P2', 'P3'],
      users: [],
      form: { title: '', description: '', severity: 'P2', status: {name: 'None', id: 0}, reportedBy: {}, assignee: {} },
      admin: false
    };
  },
  async mounted() {
    await this.loadOrgStatuses();
    await this.loadOrgUsers();
    await this.loadOrgBug();
  },

  computed: {
  },

  methods: {
    async handleBugDelete() {
      const bugId = this.$route.query.bugid;
      try {
        let response = await this.axios.post('/api/connections/' + 'bug' + '/' + bugId, { items: [], initiatives: [], backlogs: [], bugs: [], delete: true });
        let success = _get(response, 'data.success');
        if (success) {
          response = await this.axios.delete(`/api/bugs/${this.$store.state.organization.id}/${bugId}`);
          success = _get(response, 'data.success');
        };
        if (!success) throw new Error(`Unable to delete bug.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$notify({group: 'app', type: 'success', text: `Bug ${this.form.title} was deleted`});
        this.$router.go(-1);
      }
    },
    async loadOrgBug() {
      try {
        this.$loading(true);

        const orgId = this.$route.query.orgId;
        const bugId = this.$route.query.bugid;
        const response = await this.axios.get(`/api/bugs/` + orgId + '/' + bugId);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load bugs's.`);

        let bug = _get(response, 'data.bug');
        if (bug.archived === 0) {
          bug.archived = false;
        } else {
          bug.archived = true;
        };

        bug.status = _.find(this.objStatuses, { 'id': bug.statusId });
        this.toCommentsData.admin = _get(response, 'data.admin');
        if (bug.statusId) {
          bug.status = _.find(this.objStatuses, { 'id': bug.statusId });
        } else {
          bug.status = {name: 'None', id: 0};
        };
        bug.assignee.userId = bug.assignee.id;
        bug.reportedBy.userId = bug.reportedBy.id;
        bug.createdAt = new Date(bug.createdAt).toLocaleString();
        this.form = bug;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    handleBugSetField(element, name) {
      this.form[name] = element;
    },
    async handleSaveBug() {
      try {
        const orgId = this.$route.query.orgId;
        const bugId = this.$route.query.bugid;

        let data = {};

        if (this.form.assignee) data.assignee = String(this.form.assignee.userId);
        data.description = this.form.description;
        data.title = this.form.title;
        data.archived = this.form.archived;
        data.severity = this.form.severity;
        if (this.form.reportedBy) data.createdBy = String(this.form.reportedBy.userId);
        if (this.form.status.id !== 0) data.statusId = String(this.form.status.id);

        delete data.status;
        const response = await this.axios.put(`/api/bugs/edit/${orgId}/${bugId}`, data);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update bug.`);
        // this.$notify({group: 'app', type: 'success', text: 'Item updated'});
        const newComment = this.$refs['comments_ref'].newComment;
        if (newComment) this.$refs['comments_ref'].handleNewComment(this.$refs['comments_ref'].newComment);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$router.go(-1);
        this.$notify({group: 'app', type: 'success', text: 'Bug updated'});
      }
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
    }
  },
  components: {
    Comments: Comments,
    Connections: Connections
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
