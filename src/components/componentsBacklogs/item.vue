<template>
  <v-container fluid>
    <v-layout row wrap justify-center>
      <v-flex xs12 sm10>
        <v-card>
          <v-card-title>
            <span class="headline">{{form.title}}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-text-field v-model="form.title" placeholder="Title item"></v-text-field>
                  <label
                    class="text-left"
                  >Created by {{handleUsername(form.author)}} on {{new Date(form.createdAt).toLocaleString()}}</label>
                  <v-item-group multiple >
                      <v-subheader class="pl-2">Subscribed users: </v-subheader>
                      <v-item
                              v-for="(item, i) in subscribedUsers"
                              :key="i"
                      >
                        <v-chip close @input="removeSubscribedUser(item)">
                          {{ item.firstName }}  {{ item.lastName }}
                        </v-chip>
                      </v-item>
                  </v-item-group>
                  <v-textarea
                    v-model="form.description"
                    placeholder="Title description"
                    class="mt-3"
                    @keyup="checkText($event)"
                  ></v-textarea>
                </v-flex>
                <v-flex xs12>
                  <v-layout row wrap align-center>
                    <v-flex xs4>
                      <v-subheader class="select-box-subheader">Status</v-subheader>
                    </v-flex>
                    <v-flex xs8>
                      <v-select
                        :items="objStatuses"
                        item-text="name"
                        item-value="name"
                        v-model="currentStatus"
                        return-object
                        @input="handleItemSetField($event, 'status')"
                      ></v-select>
                    </v-flex>
                    <v-flex xs4>
                      <v-subheader class="select-box-subheader">Assignee:</v-subheader>
                    </v-flex>
                    <v-flex xs8>
                      <v-select
                        :items="users"
                        item-value="userId"
                        v-model="assignee.userId"
                        return-object
                        @input="handleItemSetField($event, 'assignee')"
                        class="pt-0"
                      >
                        <template
                          slot="selection"
                          slot-scope="data"
                        >{{ data.item.firstName}} {{data.item.lastName}}</template>
                        <template slot="item" slot-scope="data">
                          <v-list-tile-content>
                            <v-list-tile-title
                              v-html="`${data.item.firstName} ${data.item.lastName}`"
                            ></v-list-tile-title>
                          </v-list-tile-content>
                        </template>
                      </v-select>
                    </v-flex>
                    <v-flex xs4>
                      <v-subheader class="select-box-subheader">Points:</v-subheader>
                    </v-flex>
                    <v-flex xs8>
                      <v-select
                        :items="pointsVar"
                        v-model="points"
                        :item-text="String(points)"
                        :item-value="String(points)"
                        @input="handleItemSetField($event, 'points')"
                      ></v-select>
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex xs4>
                  <v-checkbox label="Archived: " v-model="form.archived"></v-checkbox>
                </v-flex>
                <v-flex xs8></v-flex>
                <v-flex sm12>
                  <Comments :toCommentsData="toCommentsData" ref="comments_ref"></Comments>
                </v-flex>
                <v-flex sm12>
                  <Connections :toConnectionData="toConnectionData"></Connections>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-layout row wrap mb-3>
              <v-btn
                color="blue darken-1"
                id="save-and-close-button__backlog-component"
                flat
                small
                outline
                @click="handleSaveItem()"
              >Save and close</v-btn>
              <v-btn color="blue darken-1" flat small outline @click="$router.go(-1)">Cancel</v-btn>
              <v-btn
                color="blue darken-1"
                flat
                small
                outline
                @click="dialogDeleteItem = true"
                id="delete-button__backlog-component"
              >Delete</v-btn>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog v-model="dialogDeleteItem" max-width="250">
      <v-card>
        <v-card-text
          class="text-xs-center subheading"
        >Wait. Are you sure you want to delete this permanently?</v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            flat="flat"
            outline
            @click="dialogDeleteBackLog = false"
            small
          >Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" flat="flat" outline @click="handleItemDelete()" small>Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  </v-container>
</template>

<script>
import _get from "lodash/get";
import _ from "lodash";
import { username } from "@/utils";
import Connections from "../common/connections.vue";
import Comments from "../common/comments.vue";

export default {
  name: "Item",
  data() {
    return {
      toConnectionData: {
        name: "item",
        id: this.$route.query.itemId,
        connects: ["initiative", "bug"]
      },
      toCommentsData: {
        name: "items",
        id: this.$route.query.itemId,
        admin: false
      },
      objStatuses: [],
      currentStatus: "",
      assignee: {
        userId: "5"
      },
      users: [],
      pointsVar: ["0", "1", "2", "3", "5", "8", "13", "21"],
      points: "",
      dialogDeleteItem: false,
      form: {
        title: "",
        description: "",
        points: "",
        status: { name: "asdasd" },
        assignee: { firstName: "", lastName: "", email: "", id: "" },
        forecastedRelease: "",
        actualRelease: "",
        order_index: "3",
        statusId: 0,
        id: "",
        Author: { firstName: "", lastName: "", email: "" },
        archived: false
      },
      dialogUserList: false,
      subscribedUsers: []
    };
  },
  async mounted() {
    await this.loadOrgStatuses();
    await this.loadOrgUsers();
    await this.loadItem();
  },

  computed: {},

  methods: {
    async handleItemDelete() {
      const item = this.form;
      const orgId = this.$route.query.orgId;
      if (!item || !this.$store.state.user.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        let response = await this.axios.delete(
          `/api/items/${orgId}/${item.id}`
        );
        let success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to delete item.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$notify({
          group: "app",
          type: "success",
          text: `Item ${item.title} was deleted`
        });
        this.$router.go(-1);
      }
    },
    async loadItem() {
      this.$loading(true);
      const orgId = this.$route.query.orgId;
      const itemId = this.$route.query.itemId;
      console.log(orgId, itemId);
      try {
        const response = await this.axios.get(
          "/api/items/" + orgId + "/" + itemId
        );

        let success = _get(response, "data.success");
        this.assignee = response.data.item.assignee;
        // console.log(this.assignee);
        if (!success) {
          this.$errorMessage.show("Unable to load current user profile");
        }

        let items = _get(response, "data.item");
        if (items.archived === 0) {
          items.archived = false;
        } else {
          items.archived = true;
        }
        this.form = items;
        if (this.objStatuses) {
          this.form.status = _.find(this.objStatuses, {
            id: this.form.statusId
          });
        }

        this.currentStatus = this.form.status.name;
        this.points = String(this.form.points);
        this.admin = _get(response, "data.admin");
        this.toCommentsData.admin = _get(response, "data.admin");
        this.loadSubscribers(itemId);
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
        if (this.form.assignee) {
          data.assignee = String(this.form.assignee.userId);
        }
        if (this.currentStatus) {
          data.statusId = String(this.form.status.id);
        }
        if (!this.forecastedRelease) delete data["forecastedRelease"];
        if (!this.actualRelease) delete data["actualRelease"];
        if (!this.plannedOn) delete data["plannedOn"];

        delete data["author"];
        delete data["status"];
        delete data["id"];
        delete data["createdAt"];
        delete data["updatedAt"];
        delete data["createdBy"];
        delete data["organizationId"];
        delete data["ownerId"];
        delete data["ownerTable"];

        data.points = String(data.points);
        data.order_index = String(data.order_index);
        const response = await this.axios.put(
          `/api/items/edit/${orgId}/${id}`,
          data
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to update item.`);
        this.subscribeUsers();
        // this.$notify({group: 'app', type: 'success', text: 'Item updated'});
        const newComment = this.$refs["comments_ref"].newComment;
        if (newComment) {
          this.$refs["comments_ref"].handleNewComment(
            this.$refs["comments_ref"].newComment
          );
        }
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        // this.$loading(false);
        this.$router.go(-1);
        this.$notify({ group: "app", type: "success", text: "Item updated" });
      }
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
      if (name === "status") this.currentStatus = element.name;
      if (name === "status") this.points = element.name;
    },
    async loadOrgStatuses() {
      try {
        this.$loading(true);
        const orgId = this.$route.query.orgId;

        const response = await this.axios.get(`/api/statuses/items/${orgId}`);

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        this.objStatuses = _get(response, "data.statuses");
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    loadSubscribers(ownerId) {
      const ownerTable = this.$route.name.toLowerCase() + "s";
      this.axios
        .get(`/api/subscribers/${ownerTable}/${ownerId}`)
        .then(response => {
          this.subscribedUsers = response.data.subscribers;
          console.log(this.subscribedUsers);
          this.$loading(false);
        })
        .catch(err => {
          console.log(err);
        });
    },
    checkText(e) {
      if (e.key === "@") this.dialogUserList = true;
    },
    selectChip($event) {
      this.dialogUserList = false;
      const userId = Number($event.target.parentNode.id);
      let textArray;
      textArray = this.form.description.trim().split(" ");
      const foundUser = this.users.find((item) => item.userId === userId);
      if (foundUser) {
        for (let [index, word] of textArray.entries()) {
          if (word === "@") {
            textArray[index] = `@${foundUser.firstName + foundUser.lastName}`;
          }
        }
        this.form.description = textArray.join(" ");
        if (!this.subscribedUsers.find((item) => item.id === userId)) {
          foundUser.id = userId;
          this.subscribedUsers.push(foundUser);
        }
      }
    },
    subscribeUsers() {
      const ownerTable = this.$route.name.toLowerCase() + "s";
      const ownerId = this.$route.query.itemId;
      let usersIds = [];
      for (let item of this.subscribedUsers) {
        usersIds.push(item.userId || item.id);
      }
      this.axios
        .post(`/api/subscribers/new/${ownerTable}/${ownerId}`, {
          usersId: usersIds
        })
        .then(response => {
          this.$loading(false);
        })
        .catch(err => {
          console.log(err);
          this.$loading(false);
        });
    },
    removeSubscribedUser(item) {
      const itemIndex = this.subscribedUsers.findIndex(chipUser => chipUser.id === item.id);
      if (itemIndex >= 0) {
        const ownerTable = this.$route.name.toLowerCase() + "s";
        const ownerId = this.$route.query.itemId;
        let usersIds = [];
        usersIds.push(String(item.id));
        this.$loading(true);
        this.axios
          .post(`/api/subscribers/delete/${ownerTable}/${ownerId}`, {
            usersId: usersIds
          })
          .then(response => {
            this.$loading(false);
            this.subscribedUsers.splice(itemIndex, 1);
          })
          .catch(err => {
            console.log(err);
            this.$loading(false);
          });
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
  margin-top: 50px;
}
.description {
  outline: 0in;
  border: 1px solid lightblue;
  padding-left: 10px;
}
.comments-card {
  padding: 20px 0 0 30px;
}
#save-and-close-button__backlog-component {
  margin-left: 31px !important;
  @media screen and (max-width: 420px) {
    margin-left: 28px;
  }
}

#delete-button__backlog-component {
  @media screen and (max-width: 322px) {
    margin: 10px 0 0 30px;
  }
}

.select-box-subheader {
  @media screen and (max-width: 420px) {
    padding-left: 0;
  }
}

.v-btn__content {
  @media screen and (max-width: 320px) {
    font-size: 9px !important;
  }
}
</style>
