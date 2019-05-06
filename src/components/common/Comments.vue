<template>
  <div>
    <v-layout row wrap v-for="element in comments" :key="element.id">
    <v-flex xs12>
      <SubscribedUsersToCommentList
          v-if = "element.subscribers && element.subscribers.length"
          :subscribers = "element.subscribers"
          :comments = "comments"
          :newCommentSubscribers = "newCommentChipsUsers"
          :ownerId = "ownerId"
      />
    </v-flex>
      <v-flex xs12 sm9>
        <v-textarea
          :ref="'comment' + element.id"
          :id="'comment' + element.id"
          :disabled="element.readOnly"
          box
          v-model="element.comment"
          @keyup="checkComment($event, false, element.id)"
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
          @click="handleDeleteComment(element)"
          v-if="toCommentsData.admin"
        >
          <v-icon>delete</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
    <v-flex xs12>
      <SubscribedUsersToCommentList
              v-if = "newCommentChipsUsers && newCommentChipsUsers.length"
              :subscribers = "newCommentChipsUsers"
              :comments = "comments"
              :newCommentSubscribers = "newCommentChipsUsers"
              :ownerId = "ownerId"
      />
      <v-dialog
              v-model="dialogUserList"
              :overlay="false"
              max-width="350px"
      >
        <v-list>
          <v-list-tile v-for="(item) in users" :key="item.userId" :id="item.userId" @click="selectChip($event)">
            <v-list-tile-title>{{ item.firstName }} {{ item.lastName }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-dialog>
    </v-flex>
      <v-flex xs12 sm9 mt-0>
        <v-textarea
          id="newComment"
          v-model="newComment"
          label="New comment: "
          placeholder="Enter comment text"
          @keyup="checkComment($event, true)"
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
          @click="handleNewComment(newComment)"
          v-if="toCommentsData.admin"
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
import SubscribedUsersToCommentList from "./SubscribedUsersToCommentList";
export default {
  name: "comments",
  props: ["toCommentsData"],
  data() {
    return {
      comments: [{ comment: "", readOnly: true }],
      asignedUsers: [],
      showComments: true,
      addComment: true,
      newComment: "",
      mailers: [],
      users: [],
      ownerId: "",
      options: {
        selectTemplate: function(item) {
          // mailers.push(item.original.value);
          return "@" + item.original.key + ".";
        },
        values: []
      },
      showPrependIcon: false,
      dialog: false,
      showByIcon: false,
      dialogUserList: false,
      commentChipsUsers: [],
      newCommentChipsUsers: [],
      wordIndex: null,
      commentStatus: false,
      editingCommentId: null
    };
  },
  async mounted() {
    await this.loadOrgUsers();
    await this.loadComments();
  },
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

        if (this.$route.query.hasOwnProperty("bugId")) {
          this.ownerId = this.$route.query.bugId;
        } else if (this.$route.query.hasOwnProperty("initiativeid")) {
          this.ownerId = this.$route.query.initiativeid;
        } else if (this.$route.query.hasOwnProperty("itemId")) {
          this.ownerId = this.$route.query.itemId;
        }
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
    loadCommentSubscribers(subownerId) {
      const ownerTable = this.$route.name.toLowerCase() + "s";
      const ownerId = this.ownerId;
      this.axios
        .get(`/api/subscribers/${ownerTable}/${ownerId}/comments/${subownerId}`)
        .then(response => {
          const index = this.comments.findIndex((item) => item.id === subownerId);
          for (let item of response.data.subscribers) {
            item.subownerId = subownerId;
          }
          this.comments[index].subscribers = response.data.subscribers;
          this.$loading(false);
        })
        .catch(err => {
          console.log(err);
        });
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
          for (let comment of comments) {
            comment.subscribers = [];
            this.loadCommentSubscribers(comment.id);
          }
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

        const ownerId = this.ownerId;
        const ownerTable = this.$route.name.toLowerCase() + "s";
        let usersIds = [];
        for (let item of element.subscribers) {
          usersIds.push(item.id);
        }
        this.axios
          .post(`/api/subscribers/new/${ownerTable}/${ownerId}`, {
            subowner: "comments",
            subownerId: String(element.id),
            usersId: usersIds
          })
          .then(response => {
            this.$loading(false);
            this.loadComments();
          })
          .catch(err => {
            console.log(err);
            this.$loading(false);
          });
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
      // const usersIds = this.asignedUsers.userId;
      let usersIds = [];
      for (let item of this.newCommentChipsUsers) {
        usersIds.push(item.userId);
      }
      const ownerId = this.ownerId;
      const ownerTable = this.$route.name.toLowerCase() + "s";
      const postComment = () => {
        this.axios
          .post(
            "/api/comments/new/" +
              this.toCommentsData.name +
              "/" +
              orgId +
              "/" +
              id,
            { comment: newComment, mailers: this.mailers }
          )
          .then(response => {
            this.axios
              .post(`/api/subscribers/new/${ownerTable}/${ownerId}`, {
                subowner: "comments",
                subownerId: String(response.data.comment.id),
                usersId: usersIds
              })
              .then(response => {
                this.$loading(false);
                this.newCommentChipsUsers = [];
                this.loadComments();
              })
              .catch(err => {
                console.log(err);
                this.$loading(false);
              });
            this.mailers = [];
            this.newComment = "";
          })
          .catch(err => {
            this.$loading(false);
            return this.$errorMessage.show(err);
          });
      };
      postComment();
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
    },
    checkComment(e, isNewComment, commentId) {
      this.commentStatus = isNewComment;
      this.editingCommentId = commentId;
      if (e.key === "@") this.dialogUserList = true;
    },
    selectChip(e) {
      this.dialogUserList = false;
      const userId = Number(e.target.parentNode.id);
      let commentArray;
      if (this.commentStatus === true) {
        commentArray = this.newComment.trim().split(" ");
      } else {
        let commentItem = this.comments.find((item) => item.id === this.editingCommentId);
        commentArray = commentItem.comment.trim().split(" ");
      }
      const foundUser = this.users.find((item) => item.userId === userId);
      if (foundUser) {
        for (let [index, word] of commentArray.entries()) {
          if (word === "@") {
            commentArray[index] = `@${foundUser.firstName + foundUser.lastName}`;
          }
        }
        if (this.commentStatus === true) {
          this.newComment = commentArray.join(" ");
          if (!this.newCommentChipsUsers.find((item) => item.userId === userId)) {
            this.newCommentChipsUsers.push(foundUser);
          }
        } else {
          let foundComment;
          for (let [index, value] of this.comments.entries()) {
            if (value.id === Number(this.editingCommentId)) foundComment = index;
          }
          this.comments[foundComment].comment = commentArray.join(" ");
          if (!this.comments[foundComment].subscribers.find((item) => item.id === userId)) {
            foundUser.id = userId;
            this.comments[foundComment].subscribers.push(foundUser);
          }
        }
      }
    }
  },
  components: {
    VueTribute,
    SubscribedUsersToCommentList: SubscribedUsersToCommentList
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
