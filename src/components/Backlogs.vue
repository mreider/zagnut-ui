<template>
  <v-container fluid>
    <div v-if="loading === true || !initialBacklogs.length">
      <loading-indication></loading-indication>
    </div>
    <v-layout row wrap>
      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <v-checkbox label="Show archived" class="checkbox" v-model="showArchived" @change="reload"></v-checkbox>
        <div>
          <v-btn
            small
            color="primary"
            outline
            @click="sortBacklogsCards('title')"
            :class="{'v-btn--active': this.activatedButton === 'title' }"
          >Backlog</v-btn>
          <v-btn
            small
            color="primary"
            outline
            @click="sortBacklogsCards('autor')"
            :class="{'v-btn--active': this.activatedButton === 'autor' }"
          >Autor</v-btn>
        </div>
        <v-spacer class="hidden-md-and-down"></v-spacer>

        <!--new initiative dialog-->
        <v-dialog v-model="dialogNewBackLog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn small outline color="success" v-on="on" class="mr-0">New</v-btn>
          </template>
          <v-card>
            <v-card-title class="pb-0 pl-4">
              <span class="headline new-backlog-headline">New backlog</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md pl-3 pt-2 pb-2>
                <v-layout row wrap align-center>
                  <v-flex xs2 pl-0>
                    <v-subheader class="new-backlog-title">Title:</v-subheader>
                  </v-flex>
                  <v-flex xs10>
                    <v-text-field
                      v-model="newBacklog.title"
                      placeholder="Title backlog"
                      class="pl-4"
                    ></v-text-field>
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
                    @click="handleNewBacklog(false)"
                  >Save</v-btn>
                  <v-btn color="blue darken-1" flat medium @click="dialogNewBackLog=false">Cancel</v-btn>
                </v-flex>
              </v-layout>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field
          label="Filter"
          v-model="filter"
          single-line
          class="pt-0"
          @keyup="filterBacklogs"
        ></v-text-field>
        <v-btn
          small
          outline
          class="pt-0 mt-0 clear-filter-botton"
          @click="filter = '', clearBacklogsFilter()"
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
          <v-btn
            small
            color="primary"
            outline
            @click="sortBacklogsCards('title')"
            :class="{'v-btn--active': this.activatedButton === 'initiative' }"
          >Backlog</v-btn>
          <v-btn
            small
            color="primary"
            outline
            @click="sortBacklogsCards('autor')"
            :class="{'v-btn--active': this.activatedButton === 'autor'}"
          >Autor</v-btn>
        </v-flex>

        <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
          <v-text-field
            label="Filter"
            @keyup="filterBacklogs"
            single-line
            class="pt-0 pl-2 pr-2"
            v-model="filter"
          ></v-text-field>
          <v-btn
            small
            outline
            class="pt-0 mt-0 clear-filter-botton"
            @click="filter = '', clearBacklogsFilter()"
          >Clear</v-btn>
        </v-flex>
      </v-layout>
      <!--cards section-->
      <v-flex xs12 sm6 md4 lg3 pl-1 pr-1 pt-3 v-for="item in backlogsCards" :key="item.id">
        <v-card>
          <v-card-title primary-title>
            <h4 class="mb-0">
              Backlog:
              <router-link
                :to="'items/?orgId='+$store.state.organization.id +'&backlogid='+ item.id"
              >{{ item.title }}</router-link>
            </h4>
          </v-card-title>
          <div class="card-body pt-0 pb-0">
            <p class="mb-2">
              Author:
              <a href="#" @click="filterBacklogs(item.author)">{{item.author }}</a>
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
              @click="setCurrentBacklog(item), dialogBacklogEdit = true"
            >
              <i class="material-icons">edit</i>
            </v-btn>
            <v-btn
              v-if="$store.state.user.id ===  item.createdBy || admin"
              class="delete-button extra-small-button"
              outline
              fab
              dark
              small
              color="primary"
              @click="setCurrentBacklog(item), dialogDeleteBackLog = true"
            >
              <i class="material-icons">delete</i>
            </v-btn>
          </v-card-actions>
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
          v-if="initialBacklogs.length"
        ></v-pagination>
      </div>
    </v-layout>

    <v-dialog v-model="dialogDeleteBackLog" max-width="250">
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
          <v-btn
            color="error"
            flat="flat"
            outline
            @click="handleBacklogDelete(currentBacklog)"
            small
          >Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogBacklogEdit" max-width="450">
      <v-card>
        <v-layout row container wrap align-center>
          <v-flex xs12 align-center>
            <v-text-field v-model="newNameOldBacklog" :placeholder="currentBacklog.title"></v-text-field>
          </v-flex>
          <v-flex xs12 align-center>
            <v-checkbox
              label="Archived"
              class="checkbox"
              v-model="currentBacklog.archived"
              v-if="currentBacklog"
            ></v-checkbox>
          </v-flex>
        </v-layout>

        <v-card-actions>
          <v-btn
            flat="flat"
            outline
            @click="dialogBacklogEdit = false"
            small
            class="ml-3 mb-2"
          >Cancel</v-btn>
          <v-btn
            color="success"
            flat="flat"
            outline
            @click="handleBacklogEditTitle(currentBacklog, newNameOldBacklog)"
            small
            class="mb-2"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import _get from "lodash/get";
import { username } from "@/utils";
export default {
  name: "Backlogs",
  data() {
    return {
      newBacklog: { title: "" },
      backlogs: [],
      activatedButton: "",
      initialBacklogs: [],
      initialBacklogsForSorting: [],
      initialFilteredBacklogs: null,
      filteredBacklogs: null,
      newNameOldBacklog: "",
      currentBacklog: "",
      filter: null,
      page: 1,
      totalPages: 4,
      perPage: 8,
      showArchived: false,
      currentPage: 1,
      loading: false,
      dialogBacklogEdit: false,
      dialogDeleteBackLog: false,
      dialogNewBackLog: false,
      dialogEditBacklog: false
    };
  },
  async mounted() {
    await this.loadOrgBacklogs();
  },

  computed: {
    backlogsCards: function() {
      return this.filteredBacklogs !== null
        ? this.filteredBacklogs.slice(0, this.perPage)
        : this.backlogs;
    }
  },

  methods: {
    close() {
      this.dialogNewBackLog = false;
    },
    async reload(checked) {
      this.showArchived = checked;
      await this.loadOrgBacklogs();
    },
    async loadOrgBacklogs() {
      this.loading = true;
      try {
        const response = await this.axios.get(
          `/api/backlogs/${this.showArchived}/${
            this.$store.state.organization.id
          }`
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's backlogs.`);

        const backlogs = _get(response, "data.backlogs");
        backlogs.forEach(element => {
          element.author = username(element);
          if (element.archived === 1) {
            element.archived = true;
          } else {
            element.archived = false;
          }
        });

        this.totalPages = Math.ceil(backlogs.length / this.perPage);

        this.initialBacklogs = backlogs;
        this.initialBacklogsForSorting = backlogs.slice();
        this.backlogs = this.initialBacklogs.slice(0, this.perPage);
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
        this.loading = false;
        // this.$loading(false);
      }
    },
    async handleChangeGroupBy(element) {
      this.currentGroupBy = element;
    },
    async handleBacklogNewItemSetField(element, name) {
      this.newBacklog[name] = element;
    },
    setCurrentBacklog(element) {
      this.currentBacklog = element;
    },
    async handleBacklogEditTitle(element, newNameOldBacklog) {
      this.loading = true;
      let data = {};
      if (newNameOldBacklog) {
        data.title = newNameOldBacklog;
      }
      data.archived = element.archived;
      try {
        this.$loading(true);

        const response = await this.axios.put(
          `/api/backlogs/edit/${this.$store.state.organization.id}/${
            element.id
          }`,
          data
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to update backlog.`);

        this.$notify({
          group: "app",
          type: "success",
          text: "Backlog updated"
        });
        this.dialogEditBacklog;
        this.loading = false;
        this.dialogBacklogEdit = false;
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
        this.loading = true;
        await this.loadOrgBacklogs();
        this.$loading(false);
        this.newNameOldBacklog = "";
        this.currentBacklog = "";
      }
    },
    async handleBacklogDelete(backLog) {
      this.loading = true;
      if (!backLog || !this.$store.state.user.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        const response = await this.axios.delete(
          `/api/backlogs/${this.$store.state.organization.id}/${backLog.id}`
        );
        const success = _get(response, "data.success");
        this.loading = false;
        this.dialogDeleteBackLog = false;
        if (!success) throw new Error(`Unable to create new organization.`);
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
        this.loading = false;
        this.$notify({
          group: "app",
          type: "success",
          text: `Backlog ${backLog.title} was deleted`
        });
        this.currentBacklog = "";
        await this.loadOrgBacklogs();
      }
    },
    async handleNewBacklog() {
      this.loading = true;
      try {
        let data = {};
        data.title = this.newBacklog.title;
        const response = await this.axios.post(
          `/api/backlogs/new/${this.$store.state.organization.id}`,
          data
        );
        const success = _get(response, "data.success");
        this.loading = false;
        this.dialogNewBackLog = false;
        if (!success) throw new Error(`Unable to create new backlog.`);
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
        this.loading = false;
        this.newBacklog = { title: "" };
        await this.loadOrgBacklogs();
      }
    },
    handleUsername(element) {
      return username(element);
    },
    sortBacklogsCards(backlogName) {
      let param = backlogName.toLowerCase();
      function sortFunction(a, b) {
        let aParam;
        let bParam;
        if (param === "horizon") {
          aParam = a[param][param].replace(/\s/g, "X").toLowerCase();
          bParam = b[param][param].replace(/\s/g, "X").toLowerCase();
          if (aParam > bParam) {
            return -1;
          }
          if (aParam === bParam) {
            return 1;
          }
          return 0;
        } else {
          aParam =
            typeof a[param] === "string"
              ? a[param].replace(/\s/g, "X").toLowerCase()
              : a[param];
          bParam =
            typeof b[param] === "string"
              ? b[param].replace(/\s/g, "X").toLowerCase()
              : b[param];
          if (aParam < bParam) {
            return -1;
          }
          if (aParam === bParam) {
            return 1;
          }
          return 0;
        }
      }

      if (this.activatedButton !== backlogName) {
        // Check if initiatives was filtered by filter input, if true, sorting filtered initiatives
        if (this.filteredBacklogs !== null) {
          let sortedFilteredBacklogs = this.initialFilteredBacklogs.slice();
          this.filteredBacklogs = sortedFilteredBacklogs
            .sort(sortFunction)
            .slice(0, this.perPage);
          this.page = 1;
        } else {
          // this.initiatives.sort(sortFunction);
          this.initialBacklogsForSorting.sort(sortFunction);
          this.backlogs = this.initialBacklogsForSorting.slice(0, this.perPage);
          this.page = 1;
        }
        this.activatedButton = backlogName;
      } else {
        if (this.filteredBacklogs !== null) {
          this.filteredBacklogs = this.initialFilteredBacklogs.slice();
        } else {
          this.page = 1;
          this.backlogs = this.initialBacklogs.slice(0, this.perPage);
        }
        this.activatedButton = "";
      }
    },
    filterBacklogs(clickParam) {
      this.activatedButton = "";
      this.page = 1;
      let backlogs = this.initialBacklogs;

      let filterInputValue;

      if (typeof clickParam === "string") {
        filterInputValue = clickParam;
      } else {
        filterInputValue = this.filter;
      }

      let filterKeys = ["title", "author"];
      for (let i = 0, len = backlogs.length; i < len; i++) {
        this.filteredBacklogs = backlogs.filter(function(obj) {
          return filterKeys.some(function(key) {
            if (typeof obj[key] === "string" || typeof obj[key] === "number") {
              return obj[key]
                .toString()
                .toLowerCase()
                .includes(filterInputValue.toLowerCase());
            }
            if (typeof obj[key] === "object") {
              return obj[key]["horizon"]
                .toLowerCase()
                .includes(filterInputValue.toLowerCase());
            }
          });
        });
      }
      this.totalPages = Math.ceil(this.filteredBacklogs.length / this.perPage);
      this.initialFilteredBacklogs = this.filteredBacklogs.slice();
    },
    clearBacklogsFilter() {
      this.filteredBacklogs = null;
      this.totalPages = Math.ceil(this.initialBacklogs.length / this.perPage);
    },
    paginationFunction(event) {
      let sliceFrom = (event - 1) * this.perPage;
      let paginatedArray;
      if (this.activatedButton === "") {
        if (this.filteredBacklogs !== null) {
          paginatedArray = this.initialFilteredBacklogs.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
          this.filteredBacklogs = paginatedArray.slice();
        } else {
          paginatedArray = this.initialBacklogs.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
        }
      } else {
        if (this.filteredBacklogs !== null) {
          paginatedArray = this.initialFilteredBacklogs.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
          this.filteredBacklogs = paginatedArray.slice();
        } else {
          paginatedArray = this.initialBacklogsForSorting.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
        }
      }
      this.backlogs = paginatedArray;
    }
  },
  watch: {},
  components: {}
};
</script>

<style lang="scss" scoped>
.card {
  margin-top: 50px;
}
.backlogs {
  .btnHeader {
    width: 4.5em;
    height: 2em;
    float: right;
    margin-top: 5px;
  }
  .header {
    margin-top: 10px;
  }
  .hidden_header {
    display: none;
  }
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
.v-toolbar--card {
  .checkbox {
    margin-top: 15px;
    label {
      margin-bottom: 0;
    }
  }
}

.cards-toolbar {
  height: auto !important;
  .v-btn {
    @media screen and (max-width: 1264px) {
      margin: 6px 4px;
    }
  }
  .clear-filter-botton {
    margin-bottom: 13px;
    @media screen and (max-width: 1264px) {
      margin-bottom: 13px;
    }
  }
}
.save-and-close-button {
  margin-left: 0px !important;
  @media screen and (max-width: 420px) {
    margin-left: 9px !important;
  }
}
.new-backlog-headline {
  margin-left: 9px !important;
}
.new-backlog-title {
  padding-left: 9px !important;
  @media screen and (max-width: 420px) {
    padding-left: 9px !important;
  }
}
</style>
