<template>
  <div>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card v-for="element in relations" v-bind:key="element.key">
          <v-list subheader two-line>
            <v-subheader>Linked {{element.key}}s</v-subheader>
            <v-list-tile v-for="item in element.data" v-bind:key="item.id">
              <v-list-tile-action>
                <v-checkbox v-model="item.selected"></v-checkbox>
              </v-list-tile-action>

              <v-list-tile-content @click="invites = !invites">
                <v-list-tile-sub-title>
                  <router-link :to="item.href">{{item.title}}</router-link>
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <v-card-actions>
            <v-btn
              flat
              color="primary"
              small
              outline
              @click="setCurrentConnectionType(element.key)"
              class="ml-2 mb-3"
            >Link {{element.key}}</v-btn>
            <v-btn
              flat
              color="pink"
              small
              outline
              @click="deleteConnectionDialog = true"
              class="mb-3"
            >Remove seleted</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>

    <v-dialog v-model="deleteConnectionDialog" max-width="250">
      <v-card>
        <v-card-text
          class="text-xs-center subheading"
        >Wait. Are you sure you want to delete this permanently?</v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            flat="flat"
            outline
            @click="deleteConnectionDialog = false"
            small
          >Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" flat="flat" outline @click="handleDeleteConnections()" small>Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="modalnew" max-width="850px">
      <v-card>
        <v-card-title>
          <v-checkbox
            label="Show archived"
            class="checkbox pl-2 pr-2"
            v-model="showArchived"
            @change="reload"
          ></v-checkbox>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="filter"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="connectionsDataTableHeaders"
          :items="connectionTable"
          :search="filter"
        >
          <template v-slot:items="props">
            <td>
              <div style="display:flex; flex-direction:row; width:10px;">
                <v-checkbox v-model="props.item.selected" primary hide-details></v-checkbox>
                <router-link :to="props.item.href" class="pt-1">{{props.item.title}}</router-link>
              </div>
            </td>
            <td>
              <router-link :to="props.item.href">{{props.item.title}}</router-link>
            </td>
          </template>
        </v-data-table>
        <div class="text-xs-center pt-2">
          <!-- <v-pagination v-model="pagination.page"></v-pagination> -->
        </div>

        <v-card-actions>
          <v-btn
            color="primary"
            flat="flat"
            outline
            @click="modalnew = false"
            small
            class="ml-3 mb-3"
          >Cancel</v-btn>
          <v-btn
            color="error"
            flat="flat"
            outline
            @click="handleNewConnections()"
            small
            class="mb-3"
          >Link selected</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _get from "lodash/get";
import _ from "lodash";
export default {
  name: "connections",
  props: ["toConnectionData"],
  data() {
    return {
      relations: [],
      connectionsDataTableHeaders: [
        { text: "title", value: "title" },
        { text: "description", value: "title" }
      ],
      connectionsFieldToAdd: [
        { key: "title", sortable: true, label: "" },
        { key: "description", sortable: true }
      ],
      currentConnectionType: "",
      connectionTable: [],
      filter: "",
      showArchived: false,
      deleteConnectionDialog: false,
      modalnew: false
    };
  },
  async mounted() {
    await this.loadRelaitedList();
  },
  computed: {},
  methods: {
    async reload(checked) {
      this.showArchived = checked;
      let element = this.currentConnectionType;
      if (element === "backlog") {
        await this.loadOrgBacklogs(element);
      } else if (element === "initiative") {
        await this.loadOrgInitiatives(element);
      } else if (element === "item") {
        await this.loadOrgItems(element);
      } else if (element === "bug") {
        await this.loadOrgBugs(element);
      }
      this.connectionsFieldToAdd.forEach(el => {
        if (el.key === "title") el.label = element;
      });
    },
    async loadRelaitedList() {
      this.toConnectionData.connects.forEach(element => {
        this.getConnection(element);
      });
      this.relations.sort();
    },
    async setCurrentConnectionType(element) {
      this.currentConnectionType = element;
      if (element === "backlog") {
        await this.loadOrgBacklogs(element);
      } else if (element === "initiative") {
        await this.loadOrgInitiatives(element);
      } else if (element === "item") {
        await this.loadOrgItems(element);
      } else if (element === "bug") {
        await this.loadOrgBugs(element);
      }
      this.connectionsFieldToAdd.forEach(el => {
        if (el.key === "title") el.label = element;
      });
      this.modalnew = true;
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    async deleteConnected(element, table) {
      const connected = this.relations.find(n => n.key === element);

      connected.data.forEach(element => {
        table = _.pull(table, table.find(n => n.id === element.id));
      });
      this.totalRows = table.lenght;
      return table;
    },
    async loadOrgItems() {
      const orgId = this.$route.query.orgId;
      try {
        const response = await this.axios.get(
          `/api/items/all/${this.showArchived}/backlogs/${orgId}`
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let items = _get(response, "data.items");
        items.forEach(element => {
          element.selected = false;
          element.href =
            "/items" +
            "/item/?orgId=" +
            this.$store.state.organization.id +
            "&itemId=" +
            element.id;
        });
        items = await this.deleteConnected("item", items);

        this.connectionTable = items;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
      }
    },
    async loadOrgBugs() {
      const orgId = this.$route.query.orgId;
      try {
        const response = await this.axios.get(
          `/api/bugs/full/${this.showArchived}/${orgId}` + "/false"
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let bugs = _get(response, "data.bugs");
        bugs.forEach(element => {
          element.selected = false;
          element.href = "/bug/?orgId=" + orgId + "&bugId=" + element.id;
        });

        bugs = await this.deleteConnected("bug", bugs);

        this.connectionTable = bugs;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
      }
    },
    async loadOrgBacklogs() {
      try {
        const response = await this.axios.get(
          `/api/backlogs/${this.showArchived}/${
            this.$store.state.organization.id
          }`
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's baclogs.`);

        let backlogs = _get(response, "data.backlogs");
        backlogs.forEach(element => {
          element.selected = false;
        });
        backlogs = await this.deleteConnected("backlog", backlogs);
        this.connectionTable = backlogs;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
      }
    },
    async loadOrgInitiatives() {
      try {
        const response = await this.axios.get(
          `/api/initiatives/all/${this.showArchived}/${
            this.$store.state.organization.id
          }`
        );

        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let initiatives = _get(response, "data.initiatives");
        initiatives.forEach(element => {
          element.href =
            "/initiative/?orgId=" +
            this.$store.state.organization.id +
            "&initiativeid=" +
            element.id;
          element.selected = false;
        });
        initiatives = await this.deleteConnected("initiative", initiatives);
        this.connectionTable = initiatives;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
      }
    },
    async getConnection(element) {
      // const string = ;
      try {
        const response = await this.axios.get(
          "/api/connections/" +
            this.toConnectionData.name +
            "/" +
            element +
            "/" +
            this.toConnectionData.id
        );
        let success = _get(response, "data.success");

        if (!success) this.$errorMessage.show("Unable to load connections");
        let connections = _get(response, "data.info");

        let newObj = {};
        newObj.key = element;
        newObj.data = connections;

        connections.forEach(el => {
          el.selected = false;
          if (element === "initiative") {
            el.href =
              "/initiative/?orgId=" +
              this.$store.state.organization.id +
              "&initiativeid=" +
              el.id;
          } else if (element === "item") {
            el.href =
              "/items/item/?orgId=" +
              this.$store.state.organization.id +
              "&itemId=" +
              el.id;
          } else if (element === "bug") {
            el.href =
              "/bug/?orgId=" +
              this.$store.state.organization.id +
              "&bugId=" +
              el.id;
          }
        });

        this.relations.push(newObj);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
      }
    },
    async handleNewConnections() {
      try {
        let arrItems = [];
        let arrBacklogs = [];
        let arrInitiatives = [];
        let arrBugs = [];

        if (this.currentConnectionType === "backlog") {
          this.connectionTable.forEach(element => {
            if (element.selected) arrBacklogs.push(element.id);
          });
        } else if (this.currentConnectionType === "initiative") {
          this.connectionTable.forEach(element => {
            if (element.selected) arrInitiatives.push(element.id);
          });
        } else if (this.currentConnectionType === "item") {
          this.connectionTable.forEach(element => {
            if (element.selected) arrItems.push(element.id);
          });
        } else if (this.currentConnectionType === "bug") {
          this.connectionTable.forEach(element => {
            if (element.selected) arrBugs.push(element.id);
          });
        }
        const response = await this.axios.post(
          "/api/connections/" +
            this.toConnectionData.name +
            "/" +
            this.toConnectionData.id,
          {
            items: arrItems,
            initiatives: arrInitiatives,
            backlogs: arrBacklogs,
            bugs: arrBugs,
            delete: false
          }
        );
        const success = _get(response, "data.success");
        this.modalnew = false;
        if (!success) throw new Error(`Unable to add connection.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.relations = [];
        await this.loadRelaitedList();
      }
    },
    async handleDeleteConnections() {
      try {
        let arrItems = [];
        let arrBacklogs = [];
        let arrInitiatives = [];
        let arrBugs = [];

        this.relations.forEach(element => {
          if (element.key === "backlog") {
            element.data.forEach(el => {
              if (el.selected) arrBacklogs.push(el.id);
            });
          } else if (element.key === "initiative") {
            element.data.forEach(el => {
              if (el.selected) arrInitiatives.push(el.id);
            });
          } else if (element.key === "item") {
            element.data.forEach(el => {
              if (el.selected) arrItems.push(el.id);
            });
          } else if (element.key === "bug") {
            element.data.forEach(el => {
              if (el.selected) arrBugs.push(el.id);
            });
          }
        });
        const response = await this.axios.post(
          "/api/connections/" +
            this.toConnectionData.name +
            "/" +
            this.toConnectionData.id,
          {
            items: arrItems,
            initiatives: arrInitiatives,
            backlogs: arrBacklogs,
            bugs: arrBugs,
            delete: true
          }
        );
        const success = _get(response, "data.success");
        this.deleteConnectionDialog = false;
        if (!success) throw new Error(`Unable to add connection.`);
      } catch (error) {
        this.deleteConnectionDialog = false;
        return this.$errorMessage.show(error);
      } finally {
        this.relations = [];
        await this.loadRelaitedList();
      }
    }
  },
  components: {},
  watch: {}
};
</script>

<style lang="scss">
.btnHeader {
  width: 4.5em;
  height: 2em;
  float: right;
  margin-top: 5px;
}
.hidden_header {
  display: none;
}
.v-list__tile.theme--light {
  height: 35px;
}
</style>
