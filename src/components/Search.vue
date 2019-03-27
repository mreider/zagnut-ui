<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <v-checkbox label="Show archived" class="checkbox" v-model="showArchived" @change="reload"></v-checkbox>
        <v-select
          :items="variants"
          item-text="currentVarriant"
          item-value="currentVarriant"
          @input="handleChangeView($event)"
          class="pt-0"
        ></v-select>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field
          label="Filter"
          v-model="filter"
          single-line
          class="pt-0"
          @input="filterSearchResults"
        ></v-text-field>
        <v-btn
          small
          outline
          class="pt-0 mt-0 clear-filter-botton"
          @click="filter = '', clearSearchResultsFilter()"
        >Clear</v-btn>
      </v-toolbar>
      <v-layout row wrap justify-center>
        <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
          <v-checkbox
            label="Show archived"
            class="checkbox pl-2 pr-2"
            v-model="showArchived"
            @change="reload"
          ></v-checkbox>
        </v-flex>

        <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
          <v-select
            :items="variants"
            item-text="currentVarriant"
            item-value="currentVarriant"
            @input="handleChangeView($event)"
            class="pt-0"
          ></v-select>
          <v-spacer></v-spacer>
          <v-text-field
            label="Filter"
            single-line
            class="pt-0 pl-2 pr-2"
            v-model="filter"
            @input="filterSearchResults"
          ></v-text-field>
          <v-btn
            small
            outline
            class="pt-0 mt-0 clear-filter-botton"
            @click="filter = '', clearSearchResultsFilter()"
          >Clear</v-btn>
        </v-flex>
      </v-layout>
      <v-flex xs12 sm6 md4 lg3 pl-1 pr-1 pt-3 v-for="item in searchResults" :key="item.id">
        <v-card>
          <v-card-title primary-title>
            <h4 class="mb-0">Type: {{item.type}}</h4>
          </v-card-title>
          <div class="card-body pt-0 pb-0">
            <p class="mb-2">
              Title:
              <router-link :to="handleGetHref(item)">{{ item.title }}</router-link>
            </p>
            <p class="mb-2">Description or comment: {{item.description}}</p>
            <p class="mb-2">Created at: {{item.createdAt}}</p>
            <p class="mb-2">Author: {{handleUsername(item.author)}}</p>
            <p class="mb-2">Assignee: {{handleUsername(item.assignee)}}</p>
            <p class="pb-4">
              Owner id:
              <router-link
                :to="handleGetHref(item, (item.type === 'items') ? true : false)"
              >{{ item.ownerId }}</router-link>
            </p>
          </div>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap justify-center>
      <div class="text-xs-center pt-3">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="15"
          @input="paginationFunction"
          v-if="initialSearchResults.length"
        ></v-pagination>
      </div>
    </v-layout>
  </v-container>
</template>

<script>
import _get from "lodash/get";
import { username } from "@/utils";
import _ from "lodash";
export default {
  name: "Search",
  data() {
    return {
      text: this.$route.query.text,
      activatedButton: "",
      initialSearchResults: [],
      initialFilteredSearchResults: null,
      filteredSearchResults: null,
      initialSearchResultsForSorting: [],
      page: 1,
      totalPages: 1,
      perPage: 8,
      results: [],
      resTables: [],
      currentPage: 1,
      totalRows: 0,
      variants: [],
      currentVarriant: "all",
      itemsFields: [
        "type",
        "title",
        { key: "description", label: "Description or comment" },
        "createdAt",
        "author",
        "assignee",
        "ownerId"
      ],
      filter: "",
      showArchived: false
    };
  },
  async mounted() {
    this.text = this.$route.query.text;
    if (this.text) {
      await this.search();
    }
  },
  computed: {
    searchResults: function() {
      return this.filteredSearchResults !== null
        ? this.filteredSearchResults.slice(0, this.perPage)
        : this.results;
    }
  },
  methods: {
    async reload(checked) {
      this.showArchived = checked;
      this.text = this.$route.query.text;
      await this.search();
    },
    handleUsername(element) {
      return username(element);
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    handleChangeView(value) {
      if (value === "all") {
        this.filter = "";
        this.filterSearchResults(this.filter);
      } else {
        this.filter = value;
        this.filterSearchResults(this.filter);
      }
      this.currentVarriant = value;
    },
    handleGetHref(item, backlog) {
      if (item.type === "bugs" && !backlog) {
        return (
          "bug/?orgId=" +
          this.$store.state.organization.id +
          "&bugId=" +
          item.id
        );
      } else if (item.type === "initiatives" && !backlog) {
        return (
          "initiative/?orgId=" +
          this.$store.state.organization.id +
          "&initiativeid=" +
          item.id
        );
      } else if (item.type === "items" && !backlog) {
        return (
          "items/item/?orgId=" +
          this.$store.state.organization.id +
          "&itemId=" +
          item.id
        );
      } else if (item.type === "backlogs" && !backlog) {
        return (
          "items/?orgId=" +
          this.$store.state.organization.id +
          "&backlogid=" +
          item.id
        );
      } else if (backlog) {
        return (
          "items/?orgId=" +
          this.$store.state.organization.id +
          "&backlogid=" +
          item.ownerId
        );
      } else if (item.type === "comments" && !backlog) {
        let copyItem = JSON.parse(JSON.stringify(item));
        copyItem.type = copyItem.ownerTable;
        copyItem.id = copyItem.ownerId;
        return this.handleGetHref(copyItem, false);
      }
      return "";
    },
    async search() {
      if (this.text) {
        try {
          const orgId = this.$store.state.organization.id;

          const response = await this.axios.get(
            `/api/search/${this.text}/${orgId}/${this.showArchived}`
          );
          const success = _get(response, "data.success");
          if (!success) throw new Error(`Unable to search data.`);

          let results = _get(response, "data.data");
          let variants = [];
          results.forEach(element => {
            if (element.createdOn) {
              element.createdAt = new Date(element.createdOn).toLocaleString();
            }
            variants.push(element.type);
          });
          variants = _.union(variants);
          variants.push("all");
          this.variants = variants;

          this.totalPages = Math.ceil(results.length / this.perPage);
          this.initialSearchResults = results;
          this.initialSearchResultsForSorting = results.slice();

          this.results = this.initialSearchResults.slice(0, this.perPage);

          console.log(this.results);

          this.totalRows = results.length;
        } catch (error) {
          return this.$errorMessage.show(error);
        } finally {
          this.results.forEach(element => {
            // delete element['ownerTable'];
          });
        }
      }
    },
    filterSearchResults(clickParam) {
      this.page = 1;
      let searchResults = this.initialSearchResults;
      console.log("searchResults)");
      console.log(searchResults);

      let filterInputValue;

      if (typeof clickParam === "string") {
        filterInputValue = clickParam;
      } else {
        filterInputValue = this.filter;
      }

      let filterKeys = [
        "type",
        "title",
        "description",
        "author",
        "assignee",
        "ownerId",
        "createdAt"
      ];
      for (let i = 0, len = searchResults.length; i < len; i++) {
        this.filteredSearchResults = searchResults.filter(function(obj) {
          return filterKeys.some(function(key) {
            if (typeof obj[key] === "string" || typeof obj[key] === "number") {
              return obj[key]
                .toString()
                .toLowerCase()
                .includes(filterInputValue.toLowerCase());
            }
            if (
              typeof obj[key] === "object" &&
              obj[key].hasOwnProperty("lastName")
            ) {
              return obj[key]["lastName"]
                .toLowerCase()
                .includes(filterInputValue.toLowerCase());
            }
          });
        });
      }
      this.totalPages = Math.ceil(
        this.filteredSearchResults.length / this.perPage
      );
      this.initialFilteredSearchResults = this.filteredSearchResults.slice();
    },
    clearSearchResultsFilter() {
      this.filteredSearchResults = null;
      this.totalPages = Math.ceil(
        this.initialSearchResults.length / this.perPage
      );
    },
    paginationFunction(event) {
      let sliceFrom = (event - 1) * this.perPage;
      this.page = event;
      let paginatedArray;
      if (this.activatedButton === "") {
        if (this.filteredSearchResults !== null) {
          paginatedArray = this.initialFilteredSearchResults.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
          this.filteredSearchResults = paginatedArray.slice();
        } else {
          paginatedArray = this.initialSearchResults.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
          this.results = paginatedArray;
        }
      } else {
        if (this.filteredSearchResults !== null) {
          paginatedArray = this.initialFilteredSearchResults.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
          this.filteredSearchResults = paginatedArray.slice();
        } else {
          paginatedArray = this.initialSearchResultsForSorting.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
          this.searchResults = paginatedArray;
        }
      }
    }
  },

  components: {},
  watch: {
    "$route.query.text"() {
      if (this.text !== this.$route.query.text) {
        this.text = this.$route.query.text;
        this.search();
      }
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
  margin-top: 5px;
}
</style>
