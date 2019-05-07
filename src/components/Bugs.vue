<template>
  <v-container fluid>
    <div v-if="loading === true">
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
            @click="sortBugCards('title')"
            :class="{'v-btn--active': this.activatedButton === 'title' }"
          >Bug</v-btn>
          <v-btn
            small
            color="primary"
            outline
            @click="sortBugCards('severity')"
            :class="{'v-btn--active': this.activatedButton === 'severity' }"
          >Severity</v-btn>
          <v-btn
            small
            color="primary"
            outline
            @click="sortBugCards('status')"
            :class="{'v-btn--active': this.activatedButton === 'status' }"
          >Status</v-btn>
          <v-btn
            small
            color="primary"
            outline
            @click="sortBugCards('createdAt')"
            :class="{'v-btn--active': this.activatedButton === 'createdAt' }"
          >Created</v-btn>
        </div>
        <v-spacer class="hidden-md-and-down"></v-spacer>
        <v-btn small outline color="success" @click="dialogNewBug = true">New</v-btn>
      </v-toolbar>

      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field label="Filter" v-model="filter" single-line class="pt-0" @keyup="filterBugs"></v-text-field>
        <v-btn
          small
          outline
          class="pt-0 mt-0 clear-filter-botton"
          @click="filter = '', clearBugsFilter()"
        >Clear</v-btn>
      </v-toolbar>

      <!--toolbar for mobile sizes-->
      <v-layout row wrap justify-center>
        <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
          <v-btn small outline color="success" @click="dialogNewBug = true">New</v-btn>
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
            @click="sortBugCards('title')"
            :class="{'v-btn--active': this.activatedButton === 'title' }"
          >Bug</v-btn>
          <v-btn
            small
            color="primary"
            outline
            @click="sortBugCards('severity')"
            :class="{'v-btn--active': this.activatedButton === 'severity' }"
          >Severity</v-btn>
          <v-btn
            small
            color="primary"
            outline
            @click="sortBugCards('status')"
            :class="{'v-btn--active': this.activatedButton === 'status' }"
          >Status</v-btn>
          <v-btn
            small
            color="primary"
            outline
            @click="sortBugCards('createdAt')"
            :class="{'v-btn--active': this.activatedButton === 'createdAt' }"
          >Created</v-btn>
        </v-flex>

        <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
          <v-text-field
            label="Filter"
            v-model="filter"
            single-line
            class="pt-0"
            @keyup="filterBugs"
          ></v-text-field>
          <v-btn
            small
            outline
            class="pt-0 mt-0 clear-filter-botton"
            @click="filter = '', clearBugsFilter()"
          >Clear</v-btn>
        </v-flex>
      </v-layout>

      <!--cards section-->
      <v-flex xs12 sm6 md4 lg3 pl-1 pr-1 pt-3 v-for="item in bugCards" :key="item.id">
        <v-card>
          <v-card-title primary-title>
            <h4 class="mb-0">
              Bug:
              <router-link
                :to="'bug/?orgId='+$store.state.organization.id +'&bugId='+ item.id"
              >{{ item.title }}</router-link>
            </h4>
          </v-card-title>
          <div class="card-body pt-0 pb-0">
            <p class="mb-2">
              Severity:
              <a href="#" @click="filterBugs(item.severity)">{{item.severity}}</a>
            </p>
            <p class="mb-2">
              Status:
              <a href="#" @click="filterBugs(item.status.name)">{{item.status.name}}</a>
            </p>
            <p class="mb-2">
              Reported by:
              <a href="#" @click="filterBugs(item.reportedBy)">{{item.reportedBy}}</a>
            </p>
            <p class="mb-2">
              Assigned to:
              <a href="#" @click="filterBugs(item.assignedTo)">{{item.assignedTo}}</a>
            </p>
            <p class="mb-2">
              Created at:
              <a href="#" @click="filterBugs(item.createdAt)">{{item.createdAt }}</a>
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
              :to="'bug/?orgId='+$store.state.organization.id +'&bugId='+ item.id"
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
              @click="setCurrentBug(item), dialogDeleteBug = true"
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
          v-if="initialBugs.length"
        ></v-pagination>
      </div>
    </v-layout>

    <v-dialog v-model="dialogNewBug" max-width="850px">
      <v-card>
        <v-card-title class="pb-0 pl-4">
          <span class="headline">New bug</span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex xs12 sm7>
                <v-text-field
                  v-model="newBug.title"
                  placeholder="Enter bug"
                  class="pt-0 padding-left-sm"
                ></v-text-field>
              </v-flex>
              <v-layout row wrap align-center>
                <v-flex xs6>
                  <v-layout row wrap align-center>
                    <v-flex xs12 sm4>
                      <v-subheader class="new-bug-subheader">Severity:</v-subheader>
                    </v-flex>
                    <v-flex xs12 sm8>
                      <v-select
                        :items="severityArray"
                        item-text="severity"
                        item-value="severity"
                        @input="handleNewBugSetField"
                        return-object
                        class="pt-0"
                      ></v-select>
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex xs6>
                  <v-layout row wrap align-center>
                    <v-flex xs12 sm4>
                      <v-subheader class="new-bug-subheader">Status:</v-subheader>
                    </v-flex>
                    <v-flex xs12 sm8>
                      <v-select
                        :items="objStatuses"
                        item-text="name"
                        item-value="name"
                        @input="handleNewBugSetField"
                        return-object
                        class="pt-0"
                      ></v-select>
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex xs6>
                  <v-layout row wrap align-center>
                    <v-flex xs12 sm4>
                      <v-subheader class="new-bug-subheader">Reported by:</v-subheader>
                    </v-flex>
                    <v-flex xs12 sm8>
                      <v-select
                        :items="users"
                        item-text="`${data.item.firstName} ${data.item.lastName}`"
                        item-value="`${data.item.firstName} ${data.item.lastName}`"
                        @input="handleNewBugSetField"
                        return-object
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
                  </v-layout>
                </v-flex>

                <v-flex xs6>
                  <v-layout row wrap align-center>
                    <v-flex xs12 sm4>
                      <v-subheader class="new-bug-subheader">Assigned to:</v-subheader>
                    </v-flex>
                    <v-flex xs12 sm8>
                      <v-select
                        :items="users"
                        item-text="assignedTo"
                        item-value="assignedTo"
                        return-object
                        v-model="assignedTo"
                        @change="handleNewBugSetField"
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
                  </v-layout>
                </v-flex>
              </v-layout>
              <v-flex xs12 sm7>
                <v-textarea
                  v-model="newBug.description"
                  placeholder="Enter description"
                  class="pt-0 padding-left-sm"
                ></v-textarea>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-layout row wrap>
            <v-btn
              color="blue darken-1"
              class="save-and-close-button"
              flat
              medium
              @click="handleNewBug(false)"
            >Save and close</v-btn>
            <v-btn color="blue darken-1" flat medium @click="handleNewBug(true)">Save and open</v-btn>
            <v-btn color="blue darken-1" flat medium @click="dialogNewBug=false">Cancel</v-btn>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDeleteBug" max-width="250">
      <v-card>
        <v-card-text
          class="text-xs-center subheading"
        >Wait. Are you sure you want to delete this permanently?</v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat="flat" outline @click="dialogDeleteBug = false" small>Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" flat="flat" outline @click="handleBugDelete(currentBug)" small>Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import _get from "lodash/get";
import _ from "lodash";
import { username } from "@/utils";
export default {
  name: "Bugs",
  data() {
    return {
      bugs: [],
      activatedButton: "",
      initialBugs: [],
      initialBugsForSorting: [],
      initialFilteredBugs: null,
      filteredBugs: null,
      filter: null,
      objStatuses: [],
      page: 1,
      totalPages: 1,
      perPage: 8,
      newBug: {
        title: "",
        description: "",
        severity: "P2",
        status: { name: "None", id: 0 },
        reportedBy: {},
        assignee: {}
      },
      // newBug: { title: '', description: '', status: { id: 10, name: 'Should have' }, horizon: { date: new Date(), horizon: this.getHorizonName(new Date()) }, vote: null },
      show: false,
      currentBug: "",
      admin: false,
      severityArray: [
        { severity: "P0" },
        { severity: "P1" },
        { severity: "P2" },
        { severity: "P3" }
      ],
      users: [],
      showArchived: false,
      dialogNewBug: false,
      dialogDeleteBug: false,
      loading: false,
      assignedTo: false
    };
  },
  async mounted() {
    this.setCurrentUser();
    await this.loadOrgStatuses();
    await this.loadOrgBugs();
    await this.loadOrgUsers();
  },

  computed: {
    bugCards: function() {
      return this.filteredBugs !== null
        ? this.filteredBugs.slice(0, this.perPage)
        : this.bugs;
    }
  },

  methods: {
    beforeCreate() {
      this.loading = true;
    },
    close() {
      this.dialogNewbug = false;
    },
    async reload(checked) {
      this.showArchived = checked;
      await this.loadOrgBugs();
    },
    setCurrentUser() {
      this.newBug.reportedBy = this.$store.state.user;
      this.newBug.reportedBy.userId = this.newBug.reportedBy.id;
      this.newBug.assignee = this.$store.state.user;
      this.newBug.assignee.userId = this.newBug.assignee.id;
    },
    setCurrentBug(element) {
      this.currentBug = element;
    },
    handleUsername(element) {
      return username(element);
    },
    async loadOrgStatuses() {
      this.loading === true;
      try {
        const orgId = this.$store.state.organization.id;

        const response = await this.axios.get(`/api/statuses/bugs/${orgId}`);

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        this.objStatuses = _get(response, "data.statuses");
      } catch (error) {
        this.oading === false;
        return this.$errorMessage.show(error);
      } finally {
      }
    },
    async loadOrgUsers() {
      this.loading = true;
      try {
        const orgId = this.$store.state.organization.id;
        const response = await this.axios.get(`/api/org/${orgId}/users`);

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const users = _get(response, "data.users");

        this.users = users;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
      }
    },
    async handleNewBug(go) {
      this.loading = true;
      try {
        let data = {};
        const orgId = this.$store.state.organization.id;
        data.assignee = String(this.newBug.assignee.userId);
        data.description = this.newBug.description;
        data.title = this.newBug.title;
        data.severity = this.newBug.severity;
        data.createdBy = String(this.newBug.reportedBy.userId);
        if (this.newBug.status.id !== 0) {
          data.statusId = String(this.newBug.status.id);
        }
        // if (data.assignee === String(this.$store.state.user.id)) delete data.assignee;

        const response = await this.axios.post(`/api/bugs/new/${orgId}`, data);
        const success = _get(response, "data.success");
        if (success) {
          const createdBug = _get(response, "data.bugs");
          this.dialogNewBug = false;
          if (go === true) {
            this.$router.push({
              name: "bug",
              query: { orgId: orgId, bugId: createdBug.id }
            });
          }
        }
        if (!success) throw new Error(`Unable to create new bug.`);
        this.loading = false;
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
        this.newBug = {
          title: "",
          description: "",
          severity: "P2",
          status: { name: "None", id: 0 },
          reportedBy: {},
          assignee: {}
        };
        this.show = false;
        this.loadOrgBugs();
        this.setCurrentUser();
      }
    },
    async handleBugDelete(bug) {
      this.loading = true;
      if (!bug || !this.$store.state.user.id) {
      }
      try {
        let response = await this.axios.delete(
          `/api/bugs/${this.$store.state.organization.id}/${bug.id}`
        );
        let success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to delete bug.`);
        this.dialogDeleteBug = false;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
        this.loadOrgBugs();
        this.$notify({
          group: "app",
          type: "success",
          text: `Item ${bug.title} was deleted`
        });
        this.currentBug = "";
      }
    },
    handleNewBugSetField(element, name) {
      if (element.hasOwnProperty("severity")) {
        name = "severity";
        element = element[name];
      }
      if (element.hasOwnProperty("name")) {
        name = "status";
      }
      if (element.hasOwnProperty("firstName") && this.assignedTo === null) {
        name = "reportedBy";
      }
      if (this.assignedTo !== null) {
        name = "assignee";
        this.assignedTo = null;
      }
      this.newBug[name] = element;
    },
    async loadOrgBugs() {
      this.loading = true;
      try {
        const response = await this.axios.get(
          `/api/bugs/full/${this.showArchived}/${
            this.$store.state.organization.id
          }` + "/false"
        );
        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        const bugs = _get(response, "data.bugs");

        bugs.forEach(element => {
          element.reportedBy = username(element.reportedByData);
          element.assignedTo = username(element.assigneeData);
          if (element.statusId) {
            element.status = _.find(this.objStatuses, { id: element.statusId });
          } else {
            element.status = { name: "None", id: 0 };
          }
          element.createdAt = new Date(element.createdAt).toLocaleString();
        });
        this.totalPages = Math.ceil(bugs.length / this.perPage);

        this.initialBugs = bugs;
        this.initialBugsForSorting = bugs.slice();
        this.bugs = this.initialBugs.slice(0, this.perPage);

        this.admin = _get(response, "data.admin");
        this.paginationFunction(this.page > this.totalPages ? 1 : this.page);
        this.loading = false;
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
      }
    },
    sortBugCards(bugName) {
      let param = bugName.toLowerCase();

      function sortFunction(a, b) {
        let aParam;
        let bParam;
        if (param === "status") {
          aParam = a[param]["name"].replace(/\s/g, "X").toLowerCase();
          bParam = b[param]["name"].replace(/\s/g, "X").toLowerCase();
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

      if (this.activatedButton !== bugName) {
        // Check if initiatives was filtered by filter input, if true, sorting filtered initiatives
        if (this.filteredBugs !== null) {
          let sortedFilteredbugs = this.initialFilteredBugs.slice();
          this.filteredBugs = sortedFilteredbugs
            .sort(sortFunction)
            .slice(0, this.perPage);
          this.page = 1;
        } else {
          this.initialBugsForSorting.sort(sortFunction);
          this.bugs = this.initialBugsForSorting.slice(0, this.perPage);
          this.page = 1;
        }
        this.activatedButton = bugName;
      } else {
        if (this.filteredBugs !== null) {
          this.filteredBugs = this.initialFilteredBugs.slice();
        } else {
          this.page = 1;
          this.bugs = this.initialBugs.slice(0, this.perPage);
        }

        this.activatedButton = "";
      }
    },
    filterBugs(clickParam) {
      this.activatedButton = "";
      this.page = 1;
      let bugs = this.initialBugs;

      let filterInputValue;

      if (typeof clickParam === "string") {
        filterInputValue = clickParam;
      } else {
        filterInputValue = this.filter;
      }

      let filterKeys = [
        "title",
        "severity",
        "status",
        "reportedBy",
        "assignedTo",
        "createdAt"
      ];
      this.filteredBugs = bugs.filter(function(obj) {
        return filterKeys.some(function(key) {
          if (typeof obj[key] === "string" || typeof obj[key] === "number") {
            return obj[key]
              .toString()
              .toLowerCase()
              .includes(filterInputValue.toLowerCase());
          }
          if (typeof obj[key] === "object") {
            return obj[key]["name"]
              .toLowerCase()
              .includes(filterInputValue.toLowerCase());
          }
        });
      });

      this.totalPages = Math.ceil(this.filteredBugs.length / this.perPage);
      this.initialFilteredBugs = this.filteredBugs.slice();
    },
    clearBugsFilter() {
      this.filteredBugs = null;
      this.totalPages = Math.ceil(this.initialBugs.length / this.perPage);
    },
    paginationFunction(event) {
      let sliceFrom = (event - 1) * this.perPage;
      this.page = event;
      let paginatedArray;
      if (this.activatedButton === "") {
        if (this.filteredBugs !== null) {
          paginatedArray = this.initialFilteredBugs.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
          this.filteredBugs = paginatedArray.slice();
        } else {
          paginatedArray = this.initialBugs.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
          this.bugs = paginatedArray;
        }
      } else {
        if (this.filteredBugs !== null) {
          paginatedArray = this.initialFilteredBugs.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
          this.filteredBugs = paginatedArray.slice();
        } else {
          paginatedArray = this.initialBugsForSorting.slice(
            sliceFrom,
            sliceFrom + this.perPage
          );
          this.bugs = paginatedArray;
        }
      }
    }
  },

  components: {}
};
</script>

<style lang="scss">
.card {
  margin-top: 50px;
}
.bugs {
  .header {
    margin-top: 10px;
  }
  .btnHeader {
    width: 4.5em;
    height: 2em;
    float: right;
    margin-top: 5px;
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
  margin-left: 14px !important;
  @media screen and (max-width: 420px) {
    margin-left: 9px !important;
  }
}

.new-bug-subheader {
  @media screen and (max-width: 420px) {
    padding-left: 0 !important;
  }
}

.padding-left-sm {
  padding-left: 12px;
  @media screen and (max-width: 420px) {
    padding-left: 0;
  }
}
</style>
