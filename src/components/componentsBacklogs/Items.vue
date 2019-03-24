<template>
  <v-container fluid>
    <div v-if="loading === true">
      <loading-indication></loading-indication>
    </div>
    <v-layout row wrap>
      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <h3>{{ this.title }}</h3>

        <v-spacer class="hidden-md-and-down"></v-spacer>
        <v-btn small outline color="pink" @click="$router.go(-1)">close</v-btn>
        <v-btn small outline color="success" @click="dialogNewItem = true">New</v-btn>
      </v-toolbar>
      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <div v-for="item in options" :key="item.id">
          <v-checkbox
            v-model="selected"
            :label="item.text"
            class="checkbox mr-2"
            :value="item.value"
          ></v-checkbox>
        </div>
      </v-toolbar>
      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <v-checkbox label="Show archived" class="checkbox" v-model="showArchived" @change="reload"></v-checkbox>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field label="Filter" v-model="filter" single-line class="pt-0" @keyup="filterItems"></v-text-field>
        <v-btn
          small
          outline
          class="pt-0 mt-0 clear-filter-botton"
          @click="filter = '', clearItemsFilter()"
        >Clear</v-btn>
      </v-toolbar>
      <!--toolbar for mobile sizes-->
      <v-layout row wrap justify-center>
        <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
          <!--new initiative dialog-->
          <v-btn small outline color="success" @click="dialogNewBackLog = true">New</v-btn>
          <v-checkbox
            label="Show archived"
            class="checkbox pl-2 pr-2"
            v-model="showArchived"
            @change="reload"
          ></v-checkbox>
        </v-flex>
        <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
          <v-text-field
            label="Filter"
            @keyup="filterItems"
            single-line
            class="pt-0 pl-2 pr-2"
            v-model="filter"
          ></v-text-field>
          <v-btn
            small
            outline
            class="pt-0 mt-0 clear-filter-botton"
            @click="filter = '', clearItemsFilter()"
          >Clear</v-btn>
        </v-flex>
      </v-layout>
    </v-layout>
    <!--cards section-->
    <v-layout row wrap v-for="element in selected" :key="element.id">
      <v-flex xs12>
        <h5 class="backlogs-cards-header">{{ element.name }}</h5>
      </v-flex>
      <v-flex xs6 sm4 md2 lg2 pl-1 pr-1 pt-3 v-for="item in element.filteredItems" :key="item.id">
        <v-card>
          <v-card-title primary-title>
            <h5 class="mb-0">
              Title:
              <router-link
                :to="'item/?orgId='+$store.state.organization.id +'&itemid='+ item.id"
              >{{ item.title }}</router-link>
            </h5>
          </v-card-title>
          <div class="card-body pt-0 pb-0">
            <p class="mb-2">
              Author:
              <a href="#" @click="filterItems(item.author)">{{item.author }}</a>
            </p>
          </div>
          <v-card-actions class="pl-3 pb-2">
            <v-btn
              class="edit-button extra-small-button"
              outline
              fab
              dark
              small
              color="primary"
              :to="'item/?orgId='+$store.state.organization.id +'&itemId='+ item.id"
            >
              <i class="material-icons">edit</i>
            </v-btn>
            <v-btn
              class="delete-button extra-small-button"
              outline
              fab
              dark
              small
              color="primary"
              @click="setCurrentItem(item), dialogDeleteItem = true"
            >
              <i class="material-icons">delete</i>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog v-model="dialogNewItem" max-width="850px">
      <v-card>
        <v-card-title>
          <span class="headline">{{currentItem.title}}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex xs12 sm7>
                <v-text-field v-model="newItem.title" placeholder="Title item"></v-text-field>
                <v-textarea v-model="newItem.description" placeholder="Title description"></v-textarea>
              </v-flex>
              <v-flex xs12 sm5>
                <v-layout row wrap align-center>
                  <v-flex xs4>
                    <v-subheader>Status</v-subheader>
                  </v-flex>
                  <v-flex xs8>
                    <v-select
                      :items="objStatuses"
                      item-text="name"
                      item-value="name"
                      return-object
                      @input="handleItemNewItemSetField($event, 'status')"
                    ></v-select>
                  </v-flex>
                  <v-flex xs4>
                    <v-subheader>Assignee:</v-subheader>
                  </v-flex>
                  <v-flex xs8>
                    <v-select
                      :items="users"
                      item-text="`${data.item.firstName} ${data.item.lastName}`"
                      item-value="`${data.item.firstName} ${data.item.lastName}`"
                      @input="handleItemNewItemSetField($event, 'assignee')"
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
                    <v-subheader>Points:</v-subheader>
                  </v-flex>
                  <v-flex xs8>
                    <v-select
                      :items="pointsVar"
                      :item-text="String(newItem.points)"
                      :item-value="String(newItem.points)"
                      @input="handleItemNewItemSetField($event, 'points')"
                    ></v-select>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-layout row wrap>
            <v-flex xs-12>
              <v-btn
                color="blue darken-1"
                class="save-and-close-button"
                flat
                medium
                @click="handleNewItem()"
              >Save and close</v-btn>
              <v-btn color="blue darken-1" flat medium @click="dialogNewItem=false">Cancel</v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
          <v-btn color="error" flat="flat" outline @click="handleItemDelete(currentItem)" small>Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <b-card bg-variant="light" class="card col-lg-12">
      <div class="Items">
        <div class="row">
          <label class="header col-10">
            <h2>{{ this.title }}</h2>
          </label>
          <div class="col-2">
            <b-btn class="float-right btnHeader" variant="primary" size="sm" v-b-modal.modalnew>New</b-btn>
            <b-btn
              class="float-right btnHeader"
              variant="secondary"
              size="sm"
              @click="$router.go(-1)"
            >close</b-btn>
          </div>

          <div class="col-6">
            <b-form-checkbox
              style="float-right"
              id="checkbox0"
              v-model="showArchived"
              @change="reload"
            >Show archived</b-form-checkbox>
          </div>

          <div class="col-6">
            <b-form-group label="Show: " label-for="statuses" class="float-right">
              <b-form-checkbox-group
                id="statuses"
                name="statuses"
                v-model="selected"
                :options="options"
                class="float-right"
              ></b-form-checkbox-group>
            </b-form-group>
          </div>

          <div class="col-6"></div>
          <b-input-group class="col-6">
            <b-form-input size="sm" v-model="filter" style="margin-top:5px;" placeholder="Filter"/>
            <b-input-group-append>
              <b-btn size="sm" class="btnHeader" :disabled="!filter" @click="filter = ''">Clear</b-btn>
            </b-input-group-append>
          </b-input-group>
        </div>
        <div v-for="element in selected" v-bind:key="element.id" class="row">
          <h6>{{ element.name }}</h6>
          <b-table
            bordered
            fixed
            responsive
            :items="element.filteredItems"
            :fields="itemsFields"
            thead-class="hidden_header"
            :filter="filter"
          >
            <template slot="title" slot-scope="data" class="col-8">
              <router-link
                :to="'item/?orgId='+$store.state.organization.id +'&itemId='+ data.item.id"
                v-on:click="setCurrentItem(data.item)"
              >{{ data.item.title }}</router-link>
            </template>
            <template slot="author" slot-scope="data" class="col-4">
              <a :href="`#`" v-on:click="filter = data.item.author">{{ data.item.author }}</a>
              <div style="float: right;">
                <b-button
                  style="vertical-align: right;"
                  variant="primary"
                  size="sm"
                  :to="'item/?orgId='+$store.state.organization.id +'&itemId='+ data.item.id"
                >
                  <font-awesome-icon icon="pencil-alt"/>
                </b-button>
                <b-button
                  style="bottom"
                  variant="danger"
                  size="sm"
                  v-b-modal.delete
                  @click="setCurrentItem(data.item)"
                >
                  <font-awesome-icon icon="trash-alt"/>
                </b-button>
              </div>
            </template>
          </b-table>
        </div>

        <b-modal
          id="edit"
          title="Edit"
          button-size="sm"
          size="sm"
          centered
          ok-variant="submit"
          @ok="handleItemEditTitle(currentItem, newNameOldItem)"
          ok-title="submit"
        >
          <b-form-input v-model="newNameOldItem" :placeholder="currentItem.title"></b-form-input>
        </b-modal>
        <b-modal
          id="delete"
          :title="'Wait. Are you sure you want to delete this permanently?'"
          button-size="sm"
          size="sm"
          centered
          body-class="zero-size"
          ok-variant="danger"
          @ok="handleItemDelete(currentItem)"
          ok-title="delete"
        ></b-modal>

        <b-modal
          id="modalnew"
          button-size="sm"
          title="New item"
          @ok="handleNewItem()"
          size="lg"
          centered
        >
          <b-form-group label="Title: " label-for="title" horizontal>
            <b-form-input v-model="newItem.title" placeholder="Title item" id="title">></b-form-input>
          </b-form-group>
          <div>
            <b-form-group label="Description: " label-for="description" horizontal>
              <b-form-textarea
                id="description"
                v-model="newItem.description"
                placeholder="Title description"
                :rows="3"
                :max-rows="6"
              ></b-form-textarea>
            </b-form-group>
          </div>

          <div class="newItemtable row">
            <div class="col">
              <b-form-group label="Status: " label-for="labelStatus">
                <b-dropdown
                  :text="newItem.status.name"
                  name="newItemStatuses"
                  size="sm"
                  class="statuses m-2"
                >
                  <b-dropdown-item
                    v-for="element in objStatuses"
                    v-bind:key="element.id"
                    @click="handleItemNewItemSetField(element, 'status')"
                    size="sm"
                  >{{ element.name }}</b-dropdown-item>
                </b-dropdown>
              </b-form-group>
            </div>

            <div class="col">
              <b-form-group label="Assignee: " label-for="newItemAssignee">
                <b-dropdown
                  :text="handleUsername(newItem.assignee)"
                  name="newItemAssignee"
                  size="sm"
                  class="users m-2"
                >
                  <b-dropdown-item
                    v-for="element in users"
                    v-bind:key="element.userId"
                    @click="handleItemNewItemSetField(element, 'assignee')"
                    size="sm"
                  >{{ handleUsername(element) }}</b-dropdown-item>
                </b-dropdown>
              </b-form-group>
            </div>

            <div class="col">
              <b-form-group label="Points: " label-for="newItemPoints">
                <b-dropdown
                  :text="String(newItem.points)"
                  name="newItemPoints"
                  size="sm"
                  class="points m-2"
                >
                  <b-dropdown-item
                    v-for="element in pointsVar"
                    v-bind:key="element"
                    @click="handleItemNewItemSetField(element, 'points')"
                    size="sm"
                  >{{ element }}</b-dropdown-item>
                </b-dropdown>
              </b-form-group>
            </div>
          </div>
        </b-modal>
      </div>
    </b-card>
  </v-container>
</template>

<script>
import _get from "lodash/get";
import _ from "lodash";
import Item from "../componentsBacklogs/item.vue";
import { username } from "@/utils";
export default {
  name: "Items",
  data() {
    return {
      loading: false,
      dialogNewItem: false,
      dialogItemEdit: false,
      dialogDeleteItem: false,
      initialitems: [],
      initialFilteredItems: null,
      filteredItems: null,
      objStatuses: [],
      groupByList: ["Status", "Stategic initiative"],
      currentGroupBy: "Status",
      selected: [],
      initialSelected: [],
      initialFilteredSelected: null,
      filteredSelected: null,
      options: [],
      users: [],
      newItem: {
        title: "",
        description: "",
        points: 0,
        status: { id: 1, name: "Unplaned" },
        assignee: {}
      },
      items: [],
      pointsVar: ["0", "1", "2", "3", "5", "8", "13", "21"],
      itemsFields: ["title", "author"],
      newNameOldItem: "",
      currentItem: "",
      filter: null,
      perPage: 5,
      title: "backlog title",
      showArchived: false
    };
  },
  async mounted() {
    this.setCurrentUser();
    await this.loadBacklogTitle();
    await this.loadOrgUsers();
    await this.loadOrgStatuses(true);
    this.selected.forEach(element => {
      this.options.push({ text: element.name, value: element });
    });
  },

  computed: {
    selectedCards: function() {
      return this.filteredSelected !== null
        ? this.filteredSelected
        : this.selected;
    }
  },
  methods: {
    async reload(checked) {
      this.showArchived = checked;
      await this.loadOrgStatuses(false);
    },
    setCurrentUser() {
      this.newItem.assignee = this.$store.state.user;
      this.newItem.assignee.userId = this.newItem.assignee.id;
    },
    async loadBacklogTitle() {
      try {
        const orgId = this.$route.query.orgId;
        const backlogid = this.$route.query.backlogid;
        this.$loading(true);
        const response = await this.axios.post(`/api/backlogs/${orgId}`, {
          backlogsId: [backlogid],
          fullSelect: false
        });

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load backlog info`);

        const backlogs = _get(response, "data.backlogs");

        if (backlogs.length !== 0) this.title = backlogs[0].title;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async loadOrgStatuses(firstLoad) {
      try {
        this.$loading(true);
        await this.loadOrgItems();

        const response = await this.axios.get(
          `/api/statuses/items/${this.$store.state.organization.id}`
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let objStatuses = _get(response, "data.statuses");

        this.objStatuses = objStatuses;
        this.objStatuses.forEach(element => {
          element.filteredItems = _.filter(this.items, {
            statusId: element.id
          });
          element.totalRows = element.filteredItems.length;
          element.currentPage = 1;
        });
        if (firstLoad) {
          this.selected = this.objStatuses;
          this.initialSelected = this.objStatusesj;
        }
        if (!firstLoad) {
          this.selected.forEach(element => {
            element.filteredItems = _.filter(this.items, {
              statusId: element.id
            });
            element.totalRows = element.filteredItems.length;
            element.currentPage = 1;
          });
          this.initialSelected = this.selected;
        }
        this.selected.sort(function(a, b) {
          return a.id - b.id;
        });

        // this.selected = _.sortBy(this.selected, o => o.id);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async loadOrgUsers() {
      try {
        const orgId = this.$route.query.orgId;
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
    async loadOrgItems() {
      const orgId = this.$route.query.orgId;
      const backlogid = this.$route.query.backlogid;
      try {
        this.$loading(true);
        const response = await this.axios.get(
          `/api/items/${this.showArchived}/backlogs/${orgId}/${backlogid}`
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const items = _get(response, "data.items");
        items.forEach(element => {
          element.author = username(element);
        });
        this.items = items;
        this.initialItems = items;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleItemNewItemSetField(element, name) {
      this.newItem[name] = element;
    },
    setCurrentItem(element) {
      this.currentItem = element;
    },
    async handleItemEditTitle(element, newNameOldItem) {
      if (!newNameOldItem) {
        return this.$notify({
          group: "error",
          type: "err",
          text: "Empty item title field"
        });
      }
      try {
        this.$loading(true);

        const response = await this.axios.put(
          `/api/items/edit/${this.$store.state.organization.id}/${element.id}`,
          { title: newNameOldItem }
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to update item.`);

        this.$notify({ group: "app", type: "success", text: "Saved" });
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgStatuses(false);
        this.$loading(false);
        this.newNameOldItem = "";
        this.currentItem = "";
      }
    },
    async handleItemDelete(item) {
      if (!item || !this.$store.state.user.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        let response = await this.axios.delete(
          `/api/items/${this.$store.state.organization.id}/${item.id}`
        );
        let success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to delete item.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgStatuses(false);
        this.$notify({
          group: "app",
          type: "success",
          text: `Item ${item.title} was deleted`
        });
        this.currentItem = "";
      }
    },
    async handleNewItem() {
      try {
        let data = {};
        data.assignee = String(this.newItem.assignee.userId);
        data.statusId = String(this.newItem.status.id);
        data.points = String(this.newItem.points);
        data.description = this.newItem.description;
        data.title = this.newItem.title;
        data.ownerTable = "backlogs";
        data.ownerId = this.$route.query.backlogid;
        const response = await this.axios.post(
          `/api/items/new/${this.$store.state.organization.id}`,
          data
        );
        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to create new item.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgStatuses(false);
        this.newItem = {
          title: "",
          description: "",
          points: 0,
          status: { id: 1, name: "Unplaned" },
          assignee: ""
        };
        this.setCurrentUser();
      }
    },
    handleUsername(element) {
      return username(element);
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.selected.forEach(element => {
        element.totalRows = filteredItems.length;
        element.currentPage = 1;
      });
    },
    filterItems(clickParam) {
      let items = this.initialSelected;
      let filterInputValue;

      if (typeof clickParam === "string") {
        filterInputValue = clickParam;
      } else {
        filterInputValue = this.filter;
      }
      console.log(items);
      console.log(filterInputValue);
      let filterKeys = ["title", "author"];
      // this.filteredSelected = items.map(obj => {
      //   this.filteredSelected = obj.filteredItems.filter(internalObj => {
      //     filterKeys.some(key => {
      //       return internalObj[key]
      //         .toString()
      //         .toLowerCase()
      //         .includes(filterInputValue.toLowerCase());
      //     });
      //   });
      // });
      this.filteredSelected = items.filter(obj => {
        for (let item of obj.filteredItems) {
          return filterKeys.some(key => {
            return item[key]
              .toString()
              .toLowerCase()
              .includes(filterInputValue.toLowerCase());
          });
        }
      });
      console.log(this.filteredSelected);
      this.initialFilteredSelected = this.filteredSelected.slice();
    },
    clearItemsFilter() {
      this.filteredItems = null;
    }
  },
  watch: {
    selected(newVal, oldVal) {
      if (newVal.length !== oldVal.length) this.loadOrgStatuses(false);
    }
  },
  components: {
    item: Item
  }
};
</script>

<style lang="scss">
.card {
  margin-top: 50px;
}
.btnHeader {
  width: 4.5em;
  height: 2em;
  float: right;
  margin-top: 5px;
}
.items {
  .header {
    margin-top: 10px;
  }
  .hidden_header {
    display: none;
  }
}
.v-toolbar__content {
  .checkbox {
    label {
      margin-bottom: 0;
    }
  }
}

.backlogs-cards-header {
  margin: 15px 10px 0 10px;
}

.extra-small-button {
  width: 30px !important;
  height: 30px !important;
  &:focus {
    outline: none;
  }
  i {
    font-size: 15px;
  }
}
</style>
