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
          <div class="button-box">
            <div class="float-right">
              <b-btn type="submit" variant="primary" @click="handleSaveItem()">Save</b-btn>
              <b-btn @click="$router.go(-1)"> Back </b-btn>
            </div>
            <div>
              <b-btn @click="showComments = !showComments"
                    :class="showComments ? 'collapsed' : null"
                    aria-controls="collapse4"
                    :aria-expanded="showComments ? 'true' : 'false'">
                Show comments
              </b-btn>
              <b-btn @click="addComment = !addComment"
                    :class="addComment ? 'collapsed' : null"
                    aria-controls="collapse4"
                    :aria-expanded="addComment ? 'true' : 'false'">
                Add comment
              </b-btn>
              <b-collapse class="mt-2" v-model="showComments" id="collapse4">
                <b-form-group
                    v-for="element in comments" v-if="comments"
                    v-bind:key="element.id"
                    breakpoint="lg"
                    :label="labelComment(element)"
                    label-size="sm"
                    label-class="font-weight-bold pt-0"
                    class="container-fluid"
                    >
                    <vue-tribute :options="options" @tribute-replaced="tributeReplaced(element)">
                      <b-form-textarea class="text-center" v-model="element.comment" :ref="'comment' + element.id" :id="'comment' + element.id" v-bind:readonly="element.readOnly"></b-form-textarea>
                    </vue-tribute>
                    <div style="float: right;">
                      <b-button style="bottom" variant="primary" size="sm" v-if="$store.state.user.id === element.createdBy && element.readOnly" @click="handleReadOnly(element)">🖉</b-button>
                      <b-button style="bottom" variant="success" size="sm" v-if="!element.readOnly" @click="handleUpdateComment(element)">💾</b-button>
                      <b-button style="bottom" variant="danger" size="sm" v-if="admin" @click="handleDeleteComment(element)">✖</b-button>
                    </div>
                </b-form-group>
              </b-collapse>
              <b-collapse class="mt-2" v-model="addComment" id="collapse5">
                <vue-tribute :options="options">
                  <b-form-textarea id="newComment"
                   v-model="newComment"
                   placeholder="Enter comment text"
                   :rows="2"
                   class="text-center"
                   ></b-form-textarea>
                 </vue-tribute>
                  <div style="float: right;">
                    <b-button style="bottom" variant="success" size="sm" @click="handleNewComment(newComment)">💾</b-button>
                  </div>

              </b-collapse>
            </div>
          </div>
        </div>
    </b-card>
  </div>
</template>

<script>

import _get from 'lodash/get';
import _ from 'lodash';
import { username } from '@/utils';
import VueTribute from 'vue-tribute';
export default {
  name: 'Item',
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
      },
      comments: [{ comment: '', readOnly: true }],
      showComments: false,
      addComment: false,
      newComment: '',
      mailers: [],
      admin: false,
      options: {
        selectTemplate: function (item) {
          // mailers.push(item.original.value);
          return '@' + item.original.key + '.';
        },
        values: []
      }

    };
  },
  async mounted() {
    await this.loadOrgStatuses();
    await this.loadOrgUsers();
    await this.loadItem();
    await this.loadComments();
  },

  computed: {
  },

  methods: {
    tributeReplaced(element) {
    // init change for vue-tribute
      let input = document.getElementById('comment' + element.id);
      let e = document.createEvent('HTMLEvents');
      e.initEvent('input', true, true);
      input.dispatchEvent(e);
    // init change for vue-tribute
    },
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
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async loadComments() {
      this.$loading(true);
      const orgId = this.$route.query.orgId;
      const id = this.$route.query.itemId;
      try {
        const response = await this.axios.get('/api/comments/get/' + 'items/' + orgId + '/' + id);

        let success = _get(response, 'data.success');
        if (!success) this.$errorMessage.show('Unable to load comments');
        let comments = _get(response, 'data.comments');
        comments.forEach(element => {
          element.readOnly = true;
        });
        this.comments = comments;
        // if (this.users) this.form.assignee = _.find(this.users, { 'id': this.form.assignee });
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
        this.options.values.length = 0;
        users.forEach(el => {
          this.options.values.push({value: el.email, key: username(el), string: '@' + username(el) + '.'});
        });
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    handleUsername(element) {
      return username(element);
    },
    labelComment(element) {
      let label = 'Created: ' + username(_.find(this.users, { 'userId': element.createdBy }));
      label = label + ' ' + 'on ' + new Date(element.createdAt).toLocaleString();
      return label;
    },
    handleReadOnly(element) {
      this.comments.forEach(el => {
        el.readOnly = true;
      });
      element.readOnly = false;
      this.$refs['comment' + element.id][0].focus();
    },
    async handleUpdateComment(element) {
      try {
        this.$loading(true);

        this.findEmailAndReturnMailers(element.comment);
        const response = await this.axios.put(`/api/comments/edit/${element.id}`, { comment: element.comment, mailers: this.mailers });
        this.mailers = [];

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update comment.`);

        this.$notify({group: 'app', type: 'success', text: 'Comment updated'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
        element.readOnly = true;
      }
    },
    async handleDeleteComment(element) {
      const orgId = this.$route.query.orgId;
      try {
        this.$loading(true);

        const response = await this.axios.delete('/api/comments/delete/' + orgId + '/' + element.id);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to delete comment.`);

        this.$notify({group: 'app', type: 'success', text: 'Comment deleted'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
        await this.loadComments();
      }
    },
    async handleNewComment(newComment) {
      const orgId = this.$route.query.orgId;
      const id = this.$route.query.itemId;

      try {
        this.$loading(true);
        this.findEmailAndReturnMailers(newComment);

        const response = await this.axios.post('/api/comments/new/items/' + orgId + '/' + id, { comment: newComment, mailers: this.mailers });
        this.mailers = [];

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create comment.`);

        this.$notify({group: 'app', type: 'success', text: 'Comment created'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
        await this.loadComments();
        this.newComment = '';
      }
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
    },
    findEmailAndReturnMailers(element) {
      let result = element.match(/@.+?(\.)/gi);
      this.mailers.length = 0;
      if (result) {
        result.forEach(el => {
          let item = _.find(this.options.values, { 'string': el });
          if (item) this.mailers.push(item.value);
        });
        this.mailers = _.union(this.mailers);
      };
    }
  },
  components: {
    VueTribute
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
