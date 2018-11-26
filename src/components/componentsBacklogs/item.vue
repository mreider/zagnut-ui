<template>
  <div class="item col-lg-12 col-md-8 col-sm-6 col-xs-4">
     <b-card bg-variant="light" class="card col-lg-12">

      <b-form-group horizontal
                    breakpoint="lg"
                    label="<h2>Item</h2>"
                    label-size="lg"
                    label-class="font-weight-bold pt-0"
                    class="container-fluid">
      </b-form-group>
        <div class="container-fluid row">
          <div class="col-12">
            <div>
              <label class="left">Created by: {{handleUsername(form.author)}} on {{new Date(form.createdAt).toLocaleString()}}</label>
            </div>
            <!-- <div>
              <label class="left" v-if="form.plannedOn" >Planned on: {{new Date(form.plannedOn).toLocaleString()}}</label>
            </div> -->
          </div>
          <div class="col-2" >
            <b-form-group label = "Status: " label-for = "labelStatus" label-size="sm" :label-cols="2">
              <b-dropdown :text="currentStatus" name="itemStatus" size="sm" class="statuses m-2" >
                <b-dropdown-item
                v-for="element in objStatuses" v-if="objStatuses"
                v-bind:key="element.id"
                @click="handleItemSetField(element, 'status')"
                size = "sm"
                >{{ element.name }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
            <b-form-group label = "Assignee: " label-for = "ItemAssignee" label-size="sm" :label-cols="2">
              <b-dropdown :text="handleUsername(form.assignee)" name="ItemAssignee" size="sm" class="users m-2" >
                <b-dropdown-item
                v-for="element in users"
                v-bind:key="element.userId"
                @click="handleItemSetField(element, 'assignee')"
                size = "sm"
                >{{ handleUsername(element) }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
            <b-form-group label = "Points: " label-for = "ItemPoints" label-size="sm" :label-cols="2">
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
          <div class="col-12">
            <Connections :toConnectionData='toConnectionData'>
            </Connections>
          </div>
          <div class="button-box" style="margin-top:20px;">
            <div class="float-right">
              <b-btn type="submit" variant="primary" @click="handleSaveItem()">Save</b-btn>
              <b-btn @click="$router.go(-1)"> Back </b-btn>
            </div>
            <Comments :toCommentsData='toCommentsData'>
            </Comments>
          </div>
        </div>
    </b-card>
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
      toConnectionData: {name: 'item', id: this.$route.query.itemId, connects: ['initiative']},
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
        Author: {firstName: '', lastName: '', email: ''}
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
    async loadItem() {
      this.$loading(true);
      const orgId = this.$route.query.orgId;
      const itemId = this.$route.query.itemId;
      try {
        const response = await this.axios.get('/api/items/' + orgId + '/' + itemId);

        let success = _get(response, 'data.success');
        if (!success) this.$errorMessage.show('Unable to load current user profile');
        this.form = _get(response, 'data.item');
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
        this.$loading(true);
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

        this.mailers.length = 0;
        const response = await this.axios.put(`/api/items/edit/${orgId}/${id}`, data);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update item.`);

        this.$notify({group: 'app', type: 'success', text: 'Item updated'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
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
  }
</style>
