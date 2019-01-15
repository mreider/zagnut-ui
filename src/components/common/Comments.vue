<template>
  <div>
    <!-- <b-btn @click="showComments = !showComments"
                    :class="showComments ? 'collapsed' : null"
                    aria-controls="collapse4"
                    :aria-expanded="showComments ? 'true' : 'false'">
                Show comments
    </b-btn> -->
    <b-collapse class="mt-2" v-model="showComments" id="collapse4">
      <b-form-group
          v-for="element in comments"
          v-bind:key="element.id"
          breakpoint="lg"
          :description="labelComment(element)"
          description-size="sm"
          description-class="font-weight-bold pt-0"
          class="container-fluid"
          >
          <vue-tribute :options="options" @tribute-replaced="tributeReplaced(element)">
            <b-form-textarea class="text-left" v-model="element.comment" :ref="'comment' + element.id" :id="'comment' + element.id" v-bind:readonly="element.readOnly"></b-form-textarea>
          </vue-tribute>
          <div style="float: right;">
            <b-button style="bottom" variant="primary" size="sm" v-if="$store.state.user.id === element.createdBy && element.readOnly" @click="handleReadOnly(element)"><font-awesome-icon icon="pencil-alt" /> </b-button>
            <b-button style="bottom" variant="success" size="sm" v-if="!element.readOnly" @click="handleUpdateComment(element)"><font-awesome-icon icon="save" /></b-button>
            <b-button style="bottom" variant="danger" size="sm" v-if="toCommentsData.admin" @click="handleDeleteComment(element)"><font-awesome-icon icon="trash-alt" /></b-button>
          </div>
      </b-form-group>
    </b-collapse>
    <b-collapse class="mt-2"  v-model="addComment" id="collapse5">
      <vue-tribute :options="options">
        <b-form-textarea id="newComment"
          v-model="newComment"
          placeholder="Enter comment text"
          :rows="2"
          class="text-left"
          :ref="newComment"
          ></b-form-textarea>
        </vue-tribute>
        <div style="float: right;">
          <b-button style="bottom" variant="primary" size="sm" @click="handleNewComment(newComment)"><font-awesome-icon icon="save" /> Add comment</b-button>
        </div>
    </b-collapse>
  </div>
</template>

<script>
import _get from 'lodash/get';
import _ from 'lodash';
import { username } from '@/utils';
import VueTribute from 'vue-tribute';
export default {
  name: 'comments',
  props: ['toCommentsData'],
  data() {
    return {
      comments: [{ comment: '', readOnly: true }],
      showComments: true,
      addComment: true,
      newComment: '',
      mailers: [],
      users: [],
      options: {
        selectTemplate: function (item) {
          // mailers.push(item.original.value);
          return '@' + item.original.key + '.';
        },
        values: []
      }
    };
  },
  async mounted () {
    await this.loadOrgUsers();
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
    labelComment(element) {
      let label = username(_.find(this.users, { 'userId': element.createdBy }));
      label = label + ' ' + new Date(element.createdAt).toLocaleString();
      return label;
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
    handleReadOnly(element) {
      this.comments.forEach(el => {
        el.readOnly = true;
      });
      element.readOnly = false;
      this.$refs['comment' + element.id][0].focus();
    },
    async loadComments() {
      const orgId = this.$route.query.orgId;
      if (orgId) {
        this.$loading(true);
        try {
          const response = await this.axios.get('/api/comments/get/' + this.toCommentsData.name + '/' + orgId + '/' + this.toCommentsData.id);

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
      };
    },
    async handleUpdateComment(element) {
      try {
        this.$loading(true);

        this.findEmailAndReturnMailers(element.comment);
        const response = await this.axios.put(`/api/comments/edit/${element.id}`, { comment: element.comment, mailers: this.mailers });
        this.mailers = [];

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update comment.`);

        // this.$notify({group: 'app', type: 'success', text: 'Comment updated'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
        element.readOnly = true;
      }
    },
    async handleNewComment(newComment) {
      const orgId = this.$route.query.orgId;
      const id = this.toCommentsData.id;

      try {
        this.$loading(true);
        this.findEmailAndReturnMailers(newComment);

        const response = await this.axios.post('/api/comments/new/' + this.toCommentsData.name + '/' + orgId + '/' + id, { comment: newComment, mailers: this.mailers });
        this.mailers = [];

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create comment.`);

        // this.$notify({group: 'app', type: 'success', text: 'Comment created'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
        await this.loadComments();
        this.newComment = '';
        // this.addComment = false;
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
  },
  watch: {
  }
};

</script>
<style lang="scss">
.hidden_header {
      display: none;
    }
</style>
