<template>
  <div>
    <v-toolbar flat color="transparent" class="no-padding-right">
      <v-spacer></v-spacer>
      <v-btn outline color="success" @click="dialogNew = true">Add organization</v-btn>
    </v-toolbar>
    <v-data-table :headers="organizationsTableHeaders" :items="organizations" class="elevation-1">
      <template v-slot:items="props">
        <td>{{ props.item.orgId }}</td>
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.role }}</td>
        <td class="justify-center layout px-0">
          <v-icon small class="mr-2" @click="setCurrentOrg(props.item), dialogEdit  = true">edit</v-icon>
          <v-icon small @click="setCurrentOrg(props.item),  dialogDelete= true">delete</v-icon>
        </td>
      </template>
    </v-data-table>

    <v-dialog v-model="dialogDelete" max-width="250">
      <v-card>
        <v-card-text
          class="text-xs-center subheading"
        >Wait. Are you sure you want to delete this permanently?</v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat="flat" outline @click="dialogDelete = false" small>Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            flat="flat"
            outline
            @click="handleOrganizationDelete(currentOrganization)"
            small
          >Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogEdit" max-width="450">
      <v-card>
        <v-layout row container wrap align-center>
          <v-flex xs12 align-center>
            <v-text-field v-model="newOrgName" :placeholder="currentOrganization.name"></v-text-field>
          </v-flex>
        </v-layout>
        <v-card-actions>
          <v-btn flat="flat" outline @click="dialogEdit = false" small class="ml-3 mb-2">Cancel</v-btn>
          <v-btn
            color="success"
            flat="flat"
            outline
            @click="handleOrganizationEdit(currentOrganization, newOrgName)"
            small
            class="mb-2"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogNew" max-width="450">
      <v-card>
        <v-layout row container wrap align-center>
          <v-flex xs12 align-center>
            <v-text-field v-model="newOrgName" placeholder="Enter organization name">></v-text-field>
          </v-flex>
        </v-layout>
        <v-card-actions>
          <v-btn flat="flat" outline @click="dialogNew = false" small class="ml-3 mb-2">Cancel</v-btn>
          <v-btn
            color="success"
            flat="flat"
            outline
            @click="handleOrganizationNew(newOrgName)"
            small
            class="mb-2"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _get from "lodash/get";
import { eventBus } from "@/main";

export default {
  name: "Organization",
  props: ["organizations"],
  data() {
    return {
      organizationsFields: ["orgId", "name", "role", "actions"],
      organizationsTableHeaders: [
        { text: "Org Id", value: "orgId", sortable: false },
        { text: "Name", value: "name", sortable: false },
        { text: "role", value: "role", sortable: false },
        { text: "Actions", value: "name", sortable: false }
      ],
      newOrgName: "",
      currentOrganization: "",
      dialogDelete: false,
      dialogEdit: false,
      dialogNew: false
    };
  },

  computed: {},

  methods: {
    setCurrentOrg(org) {
      this.currentOrganization = org;
    },

    async handleOrganizationNew(data) {
      // this.$loading(true);
      if (!data) {
        return this.$notify({
          group: "error",
          type: "err",
          text: "Empty new organization name field"
        });
      }
      try {
        const response = await this.axios.post("/api/org", { name: data });
        const success = _get(response, "data.success");
        this.dialogNew = false;
        if (!success) throw new Error(`Unable to create new organization.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.newOrgName = "";
      }
      eventBus.$emit("reload", { loadOrganization: true });
      this.setCurrentOrg("");
    },

    async handleOrganizationDelete(org) {
      if (!org || !this.$store.state.user.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        const response = await this.axios.delete(`/api/org/${org.orgId}`);
        const success = _get(response, "data.success");
        this.dialogDelete = false;
        if (!success) throw new Error(`Unable to create new organization.`);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$notify({
          group: "app",
          type: "success",
          text: `Organization ${org.name} was deleted`
        });
        eventBus.$emit("reload", { loadOrganization: true });
        this.setCurrentOrg("");
      }
    },
    async handleOrganizationEdit(org, newOrgName) {
      if (!newOrgName) {
        return this.$notify({
          group: "error",
          type: "err",
          text: "Empty organization name field"
        });
      }

      try {
        this.$loading(true);

        const response = await this.axios.put(`/api/org/${org.orgId}`, {
          name: newOrgName
        });

        const success = _get(response, "data.success");
        this.dialogEdit = false;
        if (!success) throw new Error(`Unable to update organization.`);

        this.$notify({
          group: "app",
          type: "success",
          text: "Organization updated"
        });
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
        this.newOrgName = "";
        eventBus.$emit("reload", { loadOrganization: true });
        this.setCurrentOrg("");
      }
    }
  },

  components: {}
};
</script>

<style lang="scss">
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
.no-padding-right .v-toolbar__content {
  padding-right: 0;
}
</style>
