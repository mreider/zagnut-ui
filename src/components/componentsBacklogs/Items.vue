<template>
<b-card bg-variant="light" class="card col-lg-12">
  <div class="Items">
    <div class="row">
      <label class="header col-10">
        <h2>{{ this.title }}</h2>
      </label>
      <div class = "col-2">
        <b-btn class="float-right btnHeader" variant="primary" size="sm"  v-b-modal.modalnew>New</b-btn>
        <b-btn class="float-right btnHeader" variant="secondary"  size="sm"  @click="$router.go(-1)"> close </b-btn>
      </div>

      <div class="col-6">
        <b-form-checkbox style="float-right" id="checkbox0" v-model="showArchived" @change="reload"> Show archived </b-form-checkbox>
      </div>

      <div class="col-6">
        <b-form-group label = "Show: " label-for = "statuses" class="float-right">
          <b-form-checkbox-group id="statuses" name="statuses" v-model="selected" :options="options" class="float-right">
          </b-form-checkbox-group>
        </b-form-group>
      </div>

     <div class="col-6">
      </div>
      <b-input-group  class="col-6">
        <b-form-input size="sm" v-model="filter" style="margin-top:5px;" placeholder="Filter" />
        <b-input-group-append>
          <b-btn size="sm" class="btnHeader "  :disabled="!filter" @click="filter = ''">Clear</b-btn>
        </b-input-group-append>
      </b-input-group >

    </div>
    <div v-for="element in selected" v-bind:key="element.id" class="row"> <h6>{{ element.name }}</h6>
      <b-table  bordered
                fixed
                responsive
                :items="element.filteredItems"
                :fields="itemsFields"
                thead-class="hidden_header"
                :filter="filter"
                >
        <template slot="title" slot-scope="data" class="col-8">
          <router-link :to="'item/?orgId='+$store.state.organization.id +'&itemId='+ data.item.id" v-on:click="setCurrentItem(data.item)">{{  data.item.title }}</router-link>
        </template>
        <template slot="author" slot-scope="data" class="col-4">
          <a :href="`#`" v-on:click="filter = data.item.author">
            {{ data.item.author }}
          </a>
          <div style="float: right;">
            <b-button style="vertical-align: right;" variant="primary" size="sm" :to="'item/?orgId='+$store.state.organization.id +'&itemId='+ data.item.id"> <font-awesome-icon icon="pencil-alt" /> </b-button>
            <b-button style="bottom" variant="danger" size="sm" v-b-modal.delete @click="setCurrentItem(data.item)"><font-awesome-icon icon="trash-alt" /></b-button>
          </div>
        </template>
      </b-table>
    </div>

    <b-modal id="edit"
              title="Edit"
              button-size="sm"
              size="sm"
              centered
              ok-variant="submit"
              @ok="handleItemEditTitle(currentItem, newNameOldItem)"
              ok-title="submit"
              >
        <b-form-input v-model=newNameOldItem :placeholder="currentItem.title"></b-form-input>
    </b-modal>
    <b-modal id="delete"
              :title="'Wait. Are you sure you want to delete this permanently?'"
              button-size="sm"
              size="sm"
              centered
              body-class="zero-size"
              ok-variant="danger"
              @ok="handleItemDelete(currentItem)"
              ok-title="delete"
              >
    </b-modal>

    <b-modal id="modalnew"
              button-size="sm"
              title="New item"
              @ok="handleNewItem()"
              size="lg"
              centered
              >
      <b-form-group label = "Title: " label-for = "title" horizontal>
        <b-form-input v-model="newItem.title" placeholder="Title item" id="title">></b-form-input>
      </b-form-group>
      <div>
        <b-form-group label = "Description: " label-for = "description" horizontal>
          <b-form-textarea id="description"
              v-model="newItem.description"
              placeholder="Title description"
              :rows="3"
              :max-rows="6">
          </b-form-textarea>
        </b-form-group>
      </div>

      <div class="newItemtable row" >
        <div class="col">
          <b-form-group label = "Status: " label-for = "labelStatus">
            <b-dropdown :text="newItem.status.name" name="newItemStatuses" size="sm" class="statuses m-2" >
              <b-dropdown-item
              v-for="element in objStatuses"
              v-bind:key="element.id"
              @click="handleItemNewItemSetField(element, 'status')"
              size = "sm"
              >{{ element.name }}
              </b-dropdown-item>
            </b-dropdown>
          </b-form-group>
        </div>

        <div class="col">
          <b-form-group label = "Assignee: " label-for = "newItemAssignee">
            <b-dropdown :text="handleUsername(newItem.assignee)" name="newItemAssignee" size="sm" class="users m-2" >
              <b-dropdown-item
              v-for="element in users"
              v-bind:key="element.userId"
              @click="handleItemNewItemSetField(element, 'assignee')"
              size = "sm"
              >{{ handleUsername(element) }}
              </b-dropdown-item>
            </b-dropdown>
          </b-form-group>
        </div>

        <div class="col">
          <b-form-group label = "Points: " label-for = "newItemPoints">
              <b-dropdown :text="String(newItem.points)" name="newItemPoints" size="sm" class="points m-2" >
                <b-dropdown-item
                v-for="element in pointsVar"
                v-bind:key="element"
                @click="handleItemNewItemSetField(element, 'points')"
                size = "sm"
                >{{ element }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
        </div>
      </div>
    </b-modal>

  </div>
  </b-card>
</template>

<script>
import _get from 'lodash/get';
import _ from 'lodash';
import Item from '../componentsBacklogs/item.vue';
import { username, deleteAllCommentsConnections } from '@/utils';
export default {
  name: 'Items',
  data() {
    return {
      objStatuses: [],
      groupByList: ['Status', 'Stategic initiative'],
      currentGroupBy: 'Status',
      selected: [],
      options: [],
      users: [],
      newItem: { title: '', description: '', points: 0, status: { id: 1, name: 'Unplaned' }, assignee: {} },
      items: [],
      pointsVar: ['0', '1', '2', '3', '5', '8', '13', '21'],
      itemsFields: ['title', 'author'],
      newNameOldItem: '',
      currentItem: '',
      filter: null,
      perPage: 5,
      title: 'backlog title',
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
        const response = await this.axios.post(`/api/backlogs/${orgId}`, { backlogsId: [ backlogid ], fullSelect: false });

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load backlog info`);

        const backlogs = _get(response, 'data.backlogs');

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

        const response = await this.axios.get(`/api/statuses/items/${this.$store.state.organization.id}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let objStatuses = _get(response, 'data.statuses');

        this.objStatuses = objStatuses;
        this.objStatuses.forEach(element => {
          element.filteredItems = _.filter(this.items, { statusId: element.id });
          element.totalRows = element.filteredItems.length;
          element.currentPage = 1;
        });
        if (firstLoad) this.selected = this.objStatuses;

        if (!firstLoad) {
          this.selected.forEach(element => {
            element.filteredItems = _.filter(this.items, { statusId: element.id });
            element.totalRows = element.filteredItems.length;
            element.currentPage = 1;
          });
        }
        this.selected.sort(function(a, b) { return a.id - b.id; });

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
    async loadOrgItems() {
      const orgId = this.$route.query.orgId;
      const backlogid = this.$route.query.backlogid;
      try {
        this.$loading(true);
        const response = await this.axios.get(`/api/items/${this.showArchived}/backlogs/${orgId}/${backlogid}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const items = _get(response, 'data.items');
        items.forEach(element => {
          element.author = username(element);
        });
        this.items = items;
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
        return this.$notify({group: 'error', type: 'err', text: 'Empty item title field'});
      }
      try {
        this.$loading(true);

        const response = await this.axios.put(`/api/items/edit/${this.$store.state.organization.id}/${element.id}`, { title: newNameOldItem });

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update item.`);

        this.$notify({group: 'app', type: 'success', text: 'Saved'});
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgStatuses(false);
        this.$loading(false);
        this.newNameOldItem = '';
        this.currentItem = '';
      }
    },
    async handleItemDelete(item) {
      if (!item || !this.$store.state.user.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        let success = await deleteAllCommentsConnections('items', item.id, 'item');
        if (success) {
          let response = await this.axios.delete(`/api/items/${this.$store.state.organization.id}/${item.id}`);
          success = _get(response, 'data.success');
        };
        if (!success) throw new Error(`Unable to delete item.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgStatuses(false);
        this.$notify({group: 'app', type: 'success', text: `Item ${item.title} was deleted`});
        this.currentItem = '';
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
        data.ownerTable = 'backlogs';
        data.ownerId = this.$route.query.backlogid;
        const response = await this.axios.post(`/api/items/new/${this.$store.state.organization.id}`, data);
        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to create new item.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgStatuses(false);
        this.newItem = { title: '', description: '', points: 0, status: { id: 1, name: 'Unplaned' }, assignee: '' };
        this.setCurrentUser();
      }
    },
    handleUsername (element) {
      return username(element);
    },
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.selected.forEach(element => {
        element.totalRows = filteredItems.length;
        element.currentPage = 1;
      });
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
    margin-top:50px;
  }
  .btnHeader {
      width: 4.5em;
      height: 2em;
      float: right;
      margin-top:5px;
    }
  .items {
    .header {
      margin-top:10px;
    }
    .hidden_header {
      display: none;
    }
  };
</style>
