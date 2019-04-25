<template>
  <div>
    <v-card class="initiative-card">
      <v-card-text>
        <v-container grid-list-md>
          <v-layout row wrap>
            <v-flex xs12>
              <v-text-field v-model="form.title" placeholder="Enter initiative"></v-text-field>
              <v-textarea v-model="form.description" placeholder="Enter hightlights"></v-textarea>
            </v-flex>
            <v-flex xs12>
              <v-layout row wrap align-center>
                <v-flex xs4 mt-1>
                  <v-subheader>Vote</v-subheader>
                </v-flex>
                <v-flex xs8 mt-1>
                  <v-btn
                    flat
                    icon
                    color="blue-grey darken-3"
                    :class="{'v-btn--active': this.btntrue === 'voteUp' }"
                    @click="handleInitiativeSetField(true, 'vote')"
                  >
                    <v-icon>thumb_up</v-icon>
                  </v-btn>
                  <v-btn
                    flat
                    icon
                    color="blue-grey darken-3"
                    :class="{'v-btn--active': this.btnfalse === 'voteDown' }"
                    @click="handleInitiativeSetField(false, 'vote')"
                  >
                    <v-icon>thumb_down</v-icon>
                  </v-btn>
                  <label
                    class="center"
                    style="margin-left: 0.5em"
                    v-if="vote !== true && vote !== false"
                  >
                    <h5>votes: {{ vote > 0 ? '+' : '' }}{{vote}}</h5>
                  </label>
                </v-flex>
                <v-flex xs4>
                  <v-subheader>Horizon</v-subheader>
                </v-flex>
                <v-flex xs8>
                  <v-select
                    :items="horizonList"
                    item-text="horizon"
                    item-value="horizon"
                    v-model="form.horizon"
                    return-object
                    @input="handleInitiativeSetField"
                  ></v-select>
                </v-flex>
                <v-flex xs4>
                  <v-subheader>Priority</v-subheader>
                </v-flex>
                <v-flex xs8>
                  <v-select
                    :items="objStatuses"
                    item-text="name"
                    item-value="name"
                    v-model="form.status"
                    return-object
                    @change="handleInitiativeSetField"
                  ></v-select>
                </v-flex>
              </v-layout>
            </v-flex>

            <v-flex xs4>
              <v-checkbox label="Archived" class="checkbox" v-model="form.archived"></v-checkbox>
            </v-flex>
            <v-flex xs8></v-flex>
            <v-flex sm12>
              <Comments :toCommentsData="toCommentsData" ref="comments_ref"></Comments>
            </v-flex>
            <v-flex sm12>
              <Connections :toConnectionData="toConnectionData"></Connections>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-layout row wrap>
          <v-flex xs-12>
            <v-btn
              color="blue darken-1"
              id="save-and-close-button__intiative-component"
              @click="handleSaveInitiative()"
              flat
              small
              medium
              outline
            >Save and close</v-btn>
            <v-btn color="blue darken-1" small flat medium @click="$router.go(-1)" outline>Back</v-btn>
            <v-btn
              color="blue darken-1"
              flat
              medium
              small
              @click="dialogDeleteInitiative = true"
              outline
              class="delete-button"
            >Delete</v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="dialogDeleteInitiative" max-width="250">
      <v-card>
        <v-card-text
          class="text-xs-center subheading"
        >Wait. Are you sure you want to delete this permanently?</v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            flat="flat"
            outline
            @click="dialogDeleteInitiative = false"
            small
          >Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" flat="flat" outline @click="handleInitiativeDelete()" small>Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _get from "lodash/get";
import _ from "lodash";
import Connections from "../common/connections.vue";
import Comments from "../common/comments.vue";
export default {
  name: "Initiative",
  data() {
    return {
      toConnectionData: {
        name: "initiative",
        id: this.$route.query.initiativeid,
        connects: ["item", "bug"]
      },
      toCommentsData: {
        name: "initiatives",
        id: this.$route.query.initiativeid,
        admin: false
      },
      objStatuses: [],
      horizonList: [],
      vote: "",
      btntrue: "",
      btnfalse: "",
      form: {
        title: "",
        description: "",
        status: { id: 10, name: "Should have" },
        horizon: { date: new Date(), horizon: this.getHorizonName(new Date()) },
        vote: null,
        archived: false
      },
      admin: false,
      dialogDeleteInitiative: false,
      currentStatus: ""
    };
  },
  async mounted() {
    await this.loadOrgStatuses();
    await this.loadOrgInitiative();
    this.horizonLoadList();
    await this.loadVotes();
    // this.btnfalse = '';
  },
  computed: {},
  methods: {
    async handleInitiativeDelete() {
      let initiative = this.form;
      if (!initiative || !this.$store.state.user.id) {
        // return this.$notify({group: 'error', type: 'err', text: 'Empty new organization name field'});
      }
      try {
        let response = await this.axios.delete(
          `/api/initiatives/${this.$store.state.organization.id}/${
            initiative.id
          }`
        );
        let success = _get(response, "data.success");
        this.dialogDeleteInitiative = false;
        if (!success) throw new Error(`Unable delete initiative.`);
      } catch (error) {
        this.dialogDeleteInitiative = false;
        return this.$errorMessage.show(error);
      } finally {
        this.$notify({
          group: "app",
          type: "success",
          text: `Item ${initiative.title} was deleted`
        });
        this.$router.go(-1);
      }
    },
    async loadOrgStatuses() {
      try {
        this.$loading(true);
        const orgId = this.$store.state.organization.id;
        const response = await this.axios.get(
          `/api/statuses/initiatives/${orgId}`
        );
        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);
        this.objStatuses = _get(response, "data.statuses");
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleInitiativeSetField(element, name) {
      this.form[name] = element;
      if (name === "vote") {
        this.vote = element;
        if (element === true) {
          this.btntrue = "voteUp";
          this.btnfalse = "";
        } else {
          this.btntrue = "";
          this.btnfalse = "voteDown";
        }
        await this.doVote(element);
        //  this.$nextTick();
      }
    },
    horizonLoadList() {
      let newDate = new Date();
      let obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);
      newDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
      obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);
      newDate = new Date(new Date().setMonth(new Date().getMonth() + 6));
      obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);
      newDate = new Date(new Date().setMonth(new Date().getMonth() + 9));
      obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);
      newDate = new Date(new Date().setMonth(new Date().getMonth() + 12));
      obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);
      newDate = new Date(new Date().setMonth(new Date().getMonth() + 15));
      obj = {
        date: newDate,
        horizon: this.getHorizonName(newDate)
      };
      this.horizonList.push(obj);
    },
    getHorizonName(d) {
      const month = d.getMonth();
      const year = d.getFullYear();
      let quarter = 0;
      if (month < 3) {
        quarter = 1;
      } else if (month < 6) {
        quarter = 2;
      } else if (month < 9) {
        quarter = 3;
      } else if (month < 12) {
        quarter = 4;
      }
      return "Q" + quarter + year;
    },
    formatDate(d) {
      const month = d.getMonth();
      const year = d.getFullYear();
      const day = d.getDate();
      return year + "-" + month + "-" + day;
    },
    async loadOrgInitiative() {
      try {
        this.$loading(true);
        const orgId = this.$route.query.orgId;
        const initiativeId = this.$route.query.initiativeid;
        const response = await this.axios.get(
          `/api/initiatives/` + orgId + "/" + initiativeId
        );
        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to load user's organizations.`);
        let initiative = _get(response, "data.initiative");
        initiative.status = _.find(this.objStatuses, {
          id: initiative.statusId
        });
        initiative.horizon = {
          date: new Date(initiative.horizon),
          horizon: this.getHorizonName(new Date(initiative.horizon))
        };
        this.toCommentsData.admin = _get(response, "data.admin");
        if (initiative.archived === 0) {
          initiative.archived = false;
        } else {
          initiative.archived = true;
        }
        this.form = initiative;
        this.currentStatus = initiative.statusId;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleSaveInitiative() {
      try {
        const orgId = this.$route.query.orgId;
        const initiativeId = this.$route.query.initiativeid;
        let data = JSON.parse(JSON.stringify(this.form));
        delete data["createdAt"];
        delete data["updatedAt"];
        delete data["createdBy"];
        delete data["popularity"];
        delete data["author"];
        delete data["id"];
        delete data.vote;
        data.horizon = this.formatDate(new Date(data.horizon.date));
        data.statusId = String(data.status.id);
        delete data.status;
        data.organizationId = String(data.organizationId);
        data.order_index = String(data.order_index);
        const response = await this.axios.put(
          `/api/initiatives/edit/${orgId}/${initiativeId}`,
          data
        );
        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to update initiative.`);
        // this.$notify({group: 'app', type: 'success', text: 'Item updated'});
        const newComment = this.$refs["comments_ref"].newComment;
        if (newComment.length > 0) {
          this.$refs["comments_ref"].handleNewComment(
            this.$refs["comments_ref"].newComment
          );
        }
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$router.go(-1);
        this.$notify({
          group: "app",
          type: "success",
          text: "Initiative updated"
        });
      }
    },
    async doVote(result) {
      try {
        // this.$loading(true);
        const initiativeId = this.$route.query.initiativeid;
        const response = await this.axios.post(
          `/api/votes/initiatives/` + initiativeId + "/" + String(result)
        );
        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to vote.`);
        let vote = _get(response, "data.votes");
        this.vote = vote;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        // this.$loading(false);
      }
    },
    async loadVotes() {
      try {
        // this.$loading(true);
        const initiativeId = this.$route.query.initiativeid;
        const response = await this.axios.get(
          `/api/votes/initiatives/` + initiativeId
        );
        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable load votes.`);
        let vote = _get(response, "data.votes");
        this.vote = vote;
        let myVote = _get(response, "data.myVote");
        if (myVote !== 0) this.handleInitiativeSetField(myVote, "vote");
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        // this.$loading(false);
      }
    }
  },
  components: {
    Connections,
    Comments
  }
};
</script>

<style lang="scss">
.card {
  margin-top: 50px;
}
.description {
  outline: 0in;
  border: 1px solid lightblue;
}
.initiative-card {
  padding-bottom: 20px;
  label.v-label.theme--light {
    margin-bottom: 0;
  }
  .delete-button {
    @media screen and (max-width: 322px) {
      margin-left: 28px !important;
      margin-top: 10px;
    }
  }
}
#save-and-close-button__intiative-component {
  margin-left: 31px;
  @media screen and (max-width: 420px) {
    margin-left: 28px;
  }
}
.v-btn__content {
  @media screen and (max-width: 320px) {
    font-size: 9px !important;
  }
}
</style>
