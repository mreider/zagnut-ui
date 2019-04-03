<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <h3>{{ this.title }}</h3>

        <v-spacer></v-spacer>
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
          <v-checkbox
            label="Show archived"
            class="checkbox ml-2"
            v-model="showArchived"
            @change="reload"
          ></v-checkbox>
          <v-btn small outline color="pink" @click="$router.go(-1)">close</v-btn>
          <v-btn small outline color="success" @click="dialogNewItem = true">New</v-btn>
        </v-flex>
        <v-flex
          xs6
          v-for="item in options"
          :key="item.id"
          class="cards-toolbar-mobile hidden-md-and-up pl-4"
        >
          <v-checkbox
            v-model="selected"
            :label="item.text"
            class="checkbox mr-2"
            :value="item.value"
          ></v-checkbox>
        </v-flex>
        <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
          <v-text-field
            label="Filter"
            v-model="filter"
            single-line
            class="pt-0 pl-2 pr-2"
            @keyup="filterItems"
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

    <v-layout row wrap v-for="element in filteredSelected.slice().reverse()" :key="element.id">
      <v-flex xs12>
        <h5 class="backlogs-cards-header">{{ element.name }}</h5>
      </v-flex>
      <draggable
        :list="element.filteredItems"
        @start="draging=true"
        @end="onEnd($event)"
        :move="onMove"
        class="layout row wrap"
      >
        <v-flex
          xs12
          sm6
          md4
          lg3
          pl-1
          pr-1
          pt-3
          v-for="item in element.filteredItems"
          :key="item.id"
        >
          <v-card>
            <v-card-title primary-title>
              <h5 class="mb-0">
                Title:
                <router-link
                  :to="'item/?orgId='+$store.state.organization.id +'&itemId='+ item.id"
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
      </draggable>
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
  </v-container>
</template>

<script>
import _get from "lodash/get";
import _ from "lodash";
import Item from "../componentsBacklogs/item.vue";
import { username } from "@/utils";
import draggable from "vuedraggable";

export default {
  name: "Items",
  data() {
    return {
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
      filteredSelected: [],
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
      showArchived: false,
      dragging: false,
      draggedContext: {},
      relatedContext: {}
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
      console.log(this.filteredSelected);
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
          // this.initialSelected = this.objStatusesj;
          // this.filteredSelected = this.objStatusesj;
        }
        if (!firstLoad) {
          this.selected.forEach(element => {
            element.filteredItems = _.filter(this.items, {
              statusId: element.id
            });
            element.totalRows = element.filteredItems.length;
            element.currentPage = 1;
          });
          this.filteredSelected = this.selected;
          console.log(this.filteredSelected);
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
        this.dialogItemEdit = false;
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
      this.$loading(true);
      if (!item || !this.$store.state.user.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        let response = await this.axios.delete(
          `/api/items/${this.$store.state.organization.id}/${item.id}`
        );
        let success = _get(response, "data.success");
        this.dialogDeleteItem = false;
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
        this.dialogNewItem = false;
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
      let items = JSON.parse(JSON.stringify(this.initialSelected.slice()));
      let filterInputValue;
      this.initialFilteredSelected = JSON.parse(
        JSON.stringify(this.initialSelected.slice())
      );

      if (typeof clickParam === "string") {
        filterInputValue = clickParam;
      } else {
        filterInputValue = this.filter;
      }
      let filterKeys = ["title", "author"];
      for (let i = 0, len = items.length; i < len; i++) {
        let filteredItems = items[i].filteredItems.filter(obj => {
          return filterKeys.some(function(key) {
            return obj[key]
              .toString()
              .toLowerCase()
              .includes(filterInputValue.toLowerCase());
          });
        });
        items[i].filteredItems = filteredItems;
        this.filteredSelected = items.slice();
      }
    },
    clearItemsFilter() {
      this.filterItems("");
    },
    onMove({ relatedContext, draggedContext }) {
      this.draggedContext = draggedContext;
      this.relatedContext = relatedContext;
      console.log(relatedContext);
      console.log(draggedContext);
    },
    onEnd(event) {
      this.loading = false;
      let foundArrIndex = this.filteredSelected.findIndex(
        x => x.id === this.draggedContext.element.statusId
      );
      let arrayToUpdate = this.filteredSelected[foundArrIndex].filteredItems;
      for (let i = 0, len = arrayToUpdate.length; i < len; i++) {
        arrayToUpdate[i].order_index = i.toString();
      }
      const updatedArr = JSON.parse(JSON.stringify(this.filteredSelected));
      this.filteredSelected = updatedArr;
      console.log(this.filteredSelected);

      // this.filteredSelected[foundArrIndex].filteredItems.sort((a, b) => {
      //   if (a.order_index > b.order_index) {
      //     return 1;
      //   }
      //   if (a.order_index < b.order_index) {
      //     return -1;
      //   }
      //   return 0;
      // });
      // console.log(this.filteredSelected[foundArrIndex]);

      // const orgId = this.$route.query.orgId;
      // let data = {};
      // data.order_index = this.draggedContext.futureIndex.toString();
      // const id = this.draggedContext.element.id;

      // const response = this.axios.put(`/api/items/edit/${orgId}/${id}`, data);

      // const success = _get(response, "data.success");
      // if (!success) throw new Error(`Unable to update item.`);
    }
  },
  watch: {
    selected(newVal, oldVal) {
      if (newVal.length !== oldVal.length) this.loadOrgStatuses(false);
    }
  },
  components: {
    item: Item,
    draggable
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
