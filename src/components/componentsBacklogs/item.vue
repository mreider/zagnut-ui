<template>
  <div class="item col-lg-12 col-md-8 col-sm-6 col-xs-4">
     <b-card bg-variant="light" class="card col-lg-12">
        <div class="container-fluid row">
          <div class="col-8">
            <b-form-input placeholder="Enter title" v-model="form.title" id="title" class="text-left description"></b-form-input>
            <label class="left">Created by  {{handleUsername(form.author)}} on {{new Date(form.createdAt).toLocaleString()}}</label>
          </div>
          <div class="col-4">
          </div>
          <div class="col-3" >
            <b-form-group label = "Status: " label-for = "labelStatus" label-size="sm" :label-cols="3" horizontal>
              <b-dropdown :text="currentStatus" name="itemStatus" size="sm" class="statuses m-2" >
                <b-dropdown-item
                v-for="element in objStatuses"
                v-bind:key="element.id"
                @click="handleItemSetField(element, 'status')"
                size = "sm"
                >{{ element.name }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
          </div>
          <div class="col-3" >
            <b-form-group label = "Assignee: " label-for = "ItemAssignee" label-size="sm" :label-cols="4" horizontal>
              <b-dropdown :text="handleUsername(form.assignee)" name="ItemAssignee" size="sm" class="users m-2" >
                <b-dropdown-item
                class="float-right"
                v-for="element in users"
                v-bind:key="element.userId"
                @click="handleItemSetField(element, 'assignee')"
                size = "sm"
                >{{ handleUsername(element) }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
          </div>
          <div class="col-3" >
            <b-form-group label = "Points: " label-for = "ItemPoints" label-size="sm" :label-cols="3" horizontal>
              <b-dropdown :text="String(form.points)" name="ItemPoints" size="sm" class="points m-2" >
                <b-dropdown-item
                v-for="element in pointsVar"
                v-bind:key="element"
                @click="handleItemSetField(element, 'points')"
                size = "sm"
                >{{ element }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
          </div>
          <div class="col-3">
          </div>
          <div class="col-12">
            <b-form-textarea v-model="form.description"
                              id="description"
                              :rows="6"
                              :max-rows="8"
                              class="description text-left"
                              placeholder="Enter description"
                              >
            </b-form-textarea>
          </div>
          <div class="col-12">
            <Connections :toConnectionData='toConnectionData'>
            </Connections>
          </div>
          <div class="button-box col-12" style="margin-top:20px;">
            <b-form-group label = "Archived: " class="float-left" label-for = "checkbox1" label-size="sm" :label-cols="7" horizontal>
              <b-form-checkbox id="checkbox1" class="m-2" v-model="form.archived" > </b-form-checkbox>
            </b-form-group>
            <div class="float-right">
              <b-btn size="sm" type="submit" variant="primary" @click="handleSaveItem()">Save & close</b-btn>
              <b-btn size="sm" @click="$router.go(-1)"> Back </b-btn>
              <b-btn variant="danger" size="sm" v-b-modal.deleteitem>Delete</b-btn>
            </div>
            <Comments :toCommentsData='toCommentsData' ref="comments_ref">
            </Comments>
          </div>
        </div>
    </b-card>
    <b-modal id="deleteitem"
          :title="'Wait. Are you sure you want to delete this permanently?'"
          button-size="sm"
          size="sm"
          centered
          body-class="zero-size"
          ok-variant="danger"
          @ok="handleItemDelete()"
          ok-title="delete"
          >
    </b-modal>
  </div>
</template>

<script>

import _get from 'lodash/get';
import _ from 'lodash';
import { username } from '@/utils';
import Connections from '../common/connections.vue';
import Comments from '../common/comments.vue';

export default {
  name: 'Item',
  data() {
    return {
      toConnectionData: {name: 'item', id: this.$route.query.itemId, connects: ['initiative', 'bug']},
      toCommentsData: {name: 'items', id: this.$route.query.itemId, admin: false},
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
        Author: {firstName: '', lastName: '', email: ''},
        archived: false
      }
    };
  },
  async mounted() {
    await this.loadOrgStatuses();
    await this.loadOrgUsers();
    await this.loadItem();
  },

  computed: {
  },

  methods: {
    async handleItemDelete() {
      const item = this.form;
      const orgId = this.$route.query.orgId;
      if (!item || !this.$store.state.user.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        let response = await this.axios.post('/api/connections/' + 'item' + '/' + item.id, { items: [], initiatives: [], backlogs: [], bugs: [], delete: true });
        let success = _get(response, 'data.success');
        if (success) {
          response = await this.axios.delete(`/api/items/${orgId}/${item.id}`);
          success = _get(response, 'data.success');
        };
        if (!success) throw new Error(`Unable to delete item.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$notify({group: 'app', type: 'success', text: `Item ${item.title} was deleted`});
        this.$router.go(-1);
      }
    },
    async loadItem() {
      this.$loading(true);
      const orgId = this.$route.query.orgId;
      const itemId = this.$route.query.itemId;
      try {
        const response = await this.axios.get('/api/items/' + orgId + '/' + itemId);

        let success = _get(response, 'data.success');
        if (!success) this.$errorMessage.show('Unable to load current user profile');
        let items = _get(response, 'data.item');
        if (items.archived === 0) {
          items.archived = false;
        } else {
          items.archived = true;
        };
        this.form = items;
        if (this.objStatuses) this.form.status = _.find(this.objStatuses, { 'id': this.form.statusId });
        this.currentStatus = this.form.status.name;
        this.points = String(this.form.points);
        this.admin = _get(response, 'data.admin');
        this.toCommentsData.admin = _get(response, 'data.admin');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async handleSaveItem() {
      try {
        // this.$loading(true);
        const orgId = this.$route.query.orgId;
        const id = this.$route.query.itemId;

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
        delete data['organizationId'];
        delete data['ownerId'];
        delete data['ownerTable'];

        data.points = String(data.points);

        const response = await this.axios.put(`/api/items/edit/${orgId}/${id}`, data);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update item.`);

        // this.$notify({group: 'app', type: 'success', text: 'Item updated'});
        const newComment = this.$refs['comments_ref'].newComment;
        if (newComment) this.$refs['comments_ref'].handleNewComment(this.$refs['comments_ref'].newComment);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        // this.$loading(false);
        this.$router.go(-1);
        this.$notify({group: 'app', type: 'success', text: 'Item updated'});
      }
    },
    async loadOrgUsers() {
      const orgId = this.$route.query.orgId;
      try {
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
    handleUsername(element) {
      return username(element);
    },
    handleItemSetField(element, name) {
      this.form[name] = element;
      if (name === 'status') this.currentStatus = element.name;
      if (name === 'status') this.points = element.name;
    },
    async loadOrgStatuses() {
      try {
        this.$loading(true);
        const orgId = this.$route.query.orgId;

        const response = await this.axios.get(`/api/statuses/items/${orgId}`);

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
    Connections,
    Comments
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
    padding-left: 10px;
  }

</style>
