<template>
  <div>
    <v-layout row wrap v-for="element in comments" :key="element.id">
      <v-flex xs12 sm9>
        <v-textarea
          :ref="'comment' + element.id"
          :id="'comment' + element.id"
          :disabled="element.readOnly"
          box
          v-model="element.comment"
          name="input-7-4"
          label="Comment: "
        ></v-textarea>
        <label class="label-comment">{{labelComment(element)}}</label>
      </v-flex>
      <v-flex xs12 sm3 align-content-end>
        <v-btn
          flat
          icon
          color="indigo"
          v-if="$store.state.user.id === element.createdBy && element.readOnly"
          @click="handleReadOnly(element)"
        >
          <v-icon>edit</v-icon>
        </v-btn>
        <v-btn
          flat
          icon
          color="cyan"
          v-if="!element.readOnly"
          @click="handleUpdateComment(element)"
        >
          <v-icon>save</v-icon>
        </v-btn>
        <v-btn
          flat
          icon
          color="pink"
          v-if="toCommentsData.admin"
          @click="handleDeleteComment(element)"
        >
          <v-icon>delete</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 sm9 mt-4>
        <v-textarea
          id="newComment"
          v-model="newComment"
          label="New comment: "
          placeholder="Enter comment text"
          :rows="2"
          class="text-left"
          :ref="newComment"
          outline
        ></v-textarea>
      </v-flex>
      <v-flex xs12 sm3 align-content-end>
        <v-btn
          flat
          icon
          color="primary"
          v-if="toCommentsData.admin"
          @click="handleNewComment(newComment)"
          class="add-comment-button"
        >
          <v-icon>add</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import _get from "lodash/get";
import _ from "lodash";
import { username } from "@/utils";
import VueTribute from "vue-tribute";
export default {
  name: "comments",
  props: ["toCommentsData"],
  data() {
    return {
      comments: [{ comment: "", readOnly: true }],
      showComments: true,
      addComment: true,
      newComment: "",
      mailers: [],
      users: [],
      options: {
        selectTemplate: function(item) {
          // mailers.push(item.original.value);
          return "@" + item.original.key + ".";
        },
        values: []
      }
    };
  },
  async mounted() {
    await this.loadOrgUsers();
    await this.loadComments();
  },
  computed: {},

  methods: {
    tributeReplaced(element) {
      // init change for vue-tribute
      let input = document.getElementById("comment" + element.id);
      let e = document.createEvent("HTMLEvents");
      e.initEvent("input", true, true);
      input.dispatchEvent(e);
      // init change for vue-tribute
    },
    labelComment(element) {
      let label = username(_.find(this.users, { userId: element.createdBy }));
      label = label + " " + new Date(element.createdAt).toLocaleString();
      return label;
    },
    async loadOrgUsers() {
      const orgId = this.$route.query.orgId;
      try {
        this.$loading(true);
        const response = await this.axios.get(`/api/org/${orgId}/users`);

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const users = _get(response, "data.users");
        this.users = users;
        this.options.values.length = 0;
        users.forEach(el => {
          this.options.values.push({
            value: el.email,
            key: username(el),
            string: "@" + username(el) + "."
          });
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
      this.$refs["comment" + element.id][0].focus();
    },
    async loadComments() {
      const orgId = this.$route.query.orgId;
      if (orgId) {
        this.$loading(true);
        try {
          const response = await this.axios.get(
            "/api/comments/get/" +
              this.toCommentsData.name +
              "/" +
              orgId +
              "/" +
              this.toCommentsData.id
          );

          let success = _get(response, "data.success");
          if (!success) this.$errorMessage.show("Unable to load comments");
          let comments = _get(response, "data.comments");
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
      }
    },
    async handleUpdateComment(element) {
      try {
        this.$loading(true);

        this.findEmailAndReturnMailers(element.comment);
        const response = await this.axios.put(
          `/api/comments/edit/${element.id}`,
          { comment: element.comment, mailers: this.mailers }
        );
        this.mailers = [];

        const success = _get(response, "data.success");
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

        const response = await this.axios.post(
          "/api/comments/new/" +
            this.toCommentsData.name +
            "/" +
            orgId +
            "/" +
            id,
          { comment: newComment, mailers: this.mailers }
        );
        this.mailers = [];

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to create comment.`);

        // this.$notify({group: 'app', type: 'success', text: 'Comment created'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
        await this.loadComments();
        this.newComment = "";
        // this.addComment = false;
      }
    },
    async handleDeleteComment(element) {
      const orgId = this.$route.query.orgId;
      try {
        this.$loading(true);

        const response = await this.axios.delete(
          "/api/comments/delete/" + orgId + "/" + element.id
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to delete comment.`);

        this.$notify({
          group: "app",
          type: "success",
          text: "Comment deleted"
        });
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
          let item = _.find(this.options.values, { string: el });
          if (item) this.mailers.push(item.value);
        });
        this.mailers = _.union(this.mailers);
      }
    }
  },
  components: {
    VueTribute
  },
  watch: {}
};
</script>
<style lang="scss">
.hidden_header {
  display: none;
}
.label-comment {
  display: block;
  margin-top: -15px;
}
.add-comment-button {
  @media screen and (max-width: 420px) {
    margin-top: -25px;
    margin-left: 0px;
  }
}
.v-btn__content {
  font-size: 10px;
}
</style>
