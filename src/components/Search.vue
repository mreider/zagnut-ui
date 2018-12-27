<template>
  <b-card bg-variant="light" class="card col-12" style="margin-top:2em;" >
    <!-- <b-input-group prepend="Text to search" class="col-12">
      <b-form-input v-model="text"></b-form-input>
      <b-input-group-append>
        <b-btn variant="outline-success" size="sm" @click="search"><font-awesome-icon icon="search" aria-hidden="true"/>  Search</b-btn>
      </b-input-group-append>
    </b-input-group> -->
    <div class="row">
      <b-dropdown :text="currentVarriant" size="sm" class="col-6">
      <b-dropdown-item
        v-for="oneVar in variants" v-if="variants"
        v-bind:key="oneVar"
        @click="handleChangeView(oneVar)"
      >{{ oneVar }}</b-dropdown-item>
      </b-dropdown>

      <b-input-group  class="col-6">
        <b-form-input size="sm" v-model="filter" style="margin-top:5px;" placeholder="Filter" />
        <b-input-group-append>
          <b-btn size="sm" class="btnHeader "  :disabled="!filter" @click="filter = ''">Clear</b-btn>
        </b-input-group-append>
    </b-input-group >
    </div>
    <b-table  bordered
              fixed
              responsive
              :fields="itemsFields"
              :items="results"
              :filter="filter"
              :current-page="currentPage"
              :per-page="perPage"
              @filtered="onFiltered"
              style="margin-top: 0.5em"
              >
      <template slot="title" slot-scope="data" class="col-8">
       <router-link :to="handleGetHref(data.item)">{{  data.item.title }}</router-link>
      </template>
      <template slot="author" slot-scope="data" class="col-4">
        <!-- <a :href="`#`" v-on:click="filter = data.item.author"> -->
          {{ handleUsername(data.item.author) }}
        <!-- </a> -->
        <div style="float: right;">
          <!-- <b-button style="vertical-align: right;" variant="primary" size="sm" :to="'item/?orgId='+$store.state.organization.id +'&itemId='+ data.item.id"> <font-awesome-icon icon="pencil-alt" /> </b-button> -->
          <!-- <b-button style="bottom" variant="danger" size="sm" v-b-modal.delete @click="setCurrentItem(data.item)"><font-awesome-icon icon="trash-alt" /></b-button> -->
        </div>
      </template>
      <template slot="createdOn" slot-scope="data" class="col-2">
      </template>
      <template slot="assignee" slot-scope="data" class="col-2">
        {{ handleUsername(data.item.assignee) }}
      </template>
      <template slot="ownerId" slot-scope="data" class="col-2">
        <router-link :to="handleGetHref(data.item, (data.item.type === 'items') ? true : false)">{{( data.item.ownerId) }}</router-link>
      </template>
    </b-table>
    <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />

  </b-card>
</template>

<script>
import _get from 'lodash/get';
import { username } from '@/utils';
import _ from 'lodash';
export default {
  name: 'Search',
  data() {
    return {
      text: this.$route.query.text,
      results: [],
      resTables: [],
      currentPage: 1,
      perPage: 20,
      totalRows: 0,
      variants: [],
      currentVarriant: 'all',
      itemsFields: ['type', 'title', {key: 'description', label: 'Description or comment'}, 'createdAt', 'author', 'assignee', 'ownerId'],
      filter: ''
    };
  },
  async mounted() {
    this.text = this.$route.query.text;
    if (this.text) {
      await this.search();
    }
  },
  computed: {
  },
  methods: {
    handleUsername (element) {
      return username(element);
    },
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    handleChangeView (value) {
      if (value === 'all') {
        this.filter = '';
      } else {
        this.filter = value;
      };
      this.currentVarriant = value;
    },
    handleGetHref(item, backlog) {
      if (item.type === 'bugs' && !backlog) {
        return 'bug/?orgId=' + this.$store.state.organization.id + '&bugid=' + item.id;
      } else if (item.type === 'initiatives' && !backlog) {
        return 'initiative/?orgId=' + this.$store.state.organization.id + '&initiativeid=' + item.id;
      } else if (item.type === 'items' && !backlog) {
        return 'items/item/?orgId=' + this.$store.state.organization.id + '&itemId=' + item.id;
      } else if (item.type === 'backlogs' && !backlog) {
        return 'items/?orgId=' + this.$store.state.organization.id + '&backlogid=' + item.id;
      } else if (backlog) {
        return 'items/?orgId=' + this.$store.state.organization.id + '&backlogid=' + item.ownerId;
      } else if (item.type === 'comments' && !backlog) {
        let copyItem = JSON.parse(JSON.stringify(item));
        copyItem.type = copyItem.ownerTable;
        return this.handleGetHref(copyItem, false);
      };
      return '';
    },
    async search() {
      if (this.text) {
        try {
          const orgId = this.$store.state.organization.id;

          const response = await this.axios.get(`/api/search/${this.text}/${orgId}`);

          const success = _get(response, 'data.success');
          if (!success) throw new Error(`Unable to search data.`);

          let results = _get(response, 'data.data');

          let variants = [];
          results.forEach(element => {
            if (element.createdOn) {
              element.createdAt = new Date(element.createdOn).toLocaleString();
            };
            variants.push(element.type);
          });
          variants = _.union(variants);
          variants.push('all');
          this.variants = variants;

          this.results = results;
          this.totalRows = results.length;
        } catch (error) {
          return this.$errorMessage.show(error);
        } finally {
          this.results.forEach(element => {
            delete element['ownerTable'];
          });
        }
      };
    }
  },

  components: {
  },
  watch: {
    '$route.query.text'() {
      if (this.text !== this.$route.query.text) {
        this.text = this.$route.query.text;
        this.search();
      };
    }
  }
};
</script>

<style lang="scss">
  .ideas {
    .tab-content {
      padding: 10px;
    }
  }
  .btnHeader {
      width: 4.5em;
      height: 2em;
      float: right;
      margin-top:5px;
  }
</style>
