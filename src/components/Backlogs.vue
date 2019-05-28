<template>
  <v-container fluid>
    <div v-if="loading === true">
      <loading-indication></loading-indication>
    </div>
    <v-layout row wrap>
      <CardsToolbar
          :showArchived="showArchivedFunction"
          :buttons="toolbarButtons"
          :sortItems="sortBacklogsCards"
          :activeButton="activatedButton"
          :openDialog="openNewItemDialog"
          :filterItems="filterBacklogs"
          :clearFilter="clearBacklogsFilter"
          :filter="filter"
      />
      <CardsToolbarMobile
          :showArchived="showArchivedFunction"
          :buttons="toolbarButtons"
          :sortItems="sortBacklogsCards"
          :activeButton="activatedButton"
          :openDialog="openNewItemDialog"
          :filterItems="filterBacklogs"
          :clearFilter="clearBacklogsFilter"
          :filter="filter"
      />
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

    <v-dialog v-model="dialogNewBackLog" max-width="500px">
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
                <v-text-field v-model="newBacklog.title" placeholder="Title backlog" class="pl-4"></v-text-field>
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
    <DeleteItemDialog
        :dialogDeleteItem="dialogDeleteBackLog"
        @deleteItem="handleBacklogDelete(currentBacklog)"
        @closeDialog="closeDeleteDialog"
    />
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
import _get from 'lodash/get';
import { username } from '@/utils';
import DeleteItemDialog from '../components/common/DeleteItemDialog';
import CardsToolbar from '../components/common/CardsToolbar';
import CardsToolbarMobile from '../components/common/CardsToolbarMobile';
export default {
  name: 'Backlogs',
  data() {
    return {
      newBacklog: { title: '' },
      backlogs: [],
      toolbarButtons: [{ name: 'title' }, { name: 'author' }],
      activatedButton: '',
      initialBacklogs: [],
      initialBacklogsForSorting: [],
      initialFilteredBacklogs: null,
      filteredBacklogs: null,
      newNameOldBacklog: '',
      currentBacklog: '',
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
    openNewItemDialog() {
      this.dialogNewBackLog = true;
    },
    async reload(checked) {
      this.showArchived = checked;
      await this.loadOrgBacklogs();
    },
    showArchivedFunction() {
      this.showArchived = !this.showArchived;
      this.reload(this.showArchived);
    },
    async loadOrgBacklogs() {
      this.loading = true;
      try {
        const response = await this.axios.get(
          `/api/backlogs/${this.showArchived}/${
            this.$store.state.organization.id
          }`
        );

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's backlogs.`);

        const backlogs = _get(response, 'data.backlogs');
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

        this.paginationFunction(this.page > this.totalPages ? 1 : this.page);
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

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update backlog.`);

        this.$notify({
          group: 'app',
          type: 'success',
          text: 'Backlog updated'
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
        this.newNameOldBacklog = '';
        this.currentBacklog = '';
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
        const success = _get(response, 'data.success');
        this.loading = false;
        this.dialogDeleteBackLog = false;
        if (!success) throw new Error(`Unable to create new organization.`);
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
        this.loading = false;
        this.$notify({
          group: 'app',
          type: 'success',
          text: `Backlog ${backLog.title} was deleted`
        });
        this.currentBacklog = '';
        await this.loadOrgBacklogs();
      }
    },
    closeDeleteDialog() {
      this.dialogDeleteBackLog = false;
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
        const success = _get(response, 'data.success');
        this.loading = false;
        this.dialogNewBackLog = false;
        if (!success) throw new Error(`Unable to create new backlog.`);
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
        this.loading = false;
        this.newBacklog = { title: '' };
        await this.loadOrgBacklogs();
      }
    },
    handleUsername(element) {
      return username(element);
    },
    sortBacklogsCards(backlogName) {
      let param = backlogName.toLowerCase();
      const convertParam = param => {
        return param.replace(/\s/g, '').toLowerCase();
      };
      function sortFunction(a, b) {
        let aParam;
        let bParam;
        if (param === 'horizon') {
          aParam = convertParam(a[param][param]);
          bParam = convertParam(b[param][param]);
        } else {
          aParam = convertParam(a[param]);
          bParam = convertParam(b[param]);
        }
        if (param === 'popularity') {
          return aParam > bParam ? -1 : 1;
        } else {
          return aParam < bParam ? -1 : 1;
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
        this.activatedButton = '';
      }
    },
    filterBacklogs(param) {
      this.activatedButton = '';
      this.page = 1;
      let backlogs = this.initialBacklogs;

      let filterInputValue;

      if (typeof param === 'string') {
        filterInputValue = param;
      } else if (typeof param === 'object') {
        filterInputValue = param.target.value;
      } else {
        filterInputValue = this.filter;
      }

      let filterKeys = ['title', 'author'];
      this.filteredBacklogs = backlogs.filter(function(obj) {
        return filterKeys.some(function(key) {
          if (typeof obj[key] === 'string' || typeof obj[key] === 'number') {
            return obj[key]
              .toString()
              .toLowerCase()
              .includes(filterInputValue.toLowerCase());
          }
          if (typeof obj[key] === 'object') {
            return obj[key]['horizon']
              .toLowerCase()
              .includes(filterInputValue.toLowerCase());
          }
        });
      });

      this.totalPages = Math.ceil(this.filteredBacklogs.length / this.perPage);
      this.initialFilteredBacklogs = this.filteredBacklogs.slice();
    },
    clearBacklogsFilter() {
      this.filter = '';
      this.filteredBacklogs = null;
      this.totalPages = Math.ceil(this.initialBacklogs.length / this.perPage);
    },
    paginationFunction(event) {
      let sliceFrom = (event - 1) * this.perPage;
      this.page = event;
      let paginatedArray;
      if (this.activatedButton === '') {
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
  components: { DeleteItemDialog, CardsToolbar, CardsToolbarMobile }
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
