<template>
  <div class="initiative col-lg-12 col-md-8 col-sm-6 col-xs-4">
     <b-card bg-variant="light" class="card col-lg-12">
       <div class="container-fluid  row">
          <div class="col-8">
            <b-form-group label-for = "title">
              <b-form-input v-model="form.title" placeholder="Enter initiative" id="title">></b-form-input>
            </b-form-group>
            <b-form-group label-for = "description">
              <b-form-textarea id="description"
                  v-model="form.description"
                  placeholder="Enter highlights"
                  :rows="3"
                  :max-rows="6">
              </b-form-textarea>
            </b-form-group>
          </div>
       <div class="col-4 row" >
            <b-form-group label = "Vote:" horizontal label-size="md" :label-cols="3" class="col-12">
              <template>
                <div style="display: inline-block; margin-left: 0px; padding-top: 0.5em">
                  <b-button v-model="vote" style="vertical-align: right;" size="lg" :variant.sync="btntrue" v-on:click="handleInitiativeSetField(true, 'vote')"><font-awesome-icon icon="thumbs-up"/> </b-button>
                  <b-button v-model="vote" style="vertical-align: right;" size="lg" :variant.sync="btnfalse" v-on:click="handleInitiativeSetField(false, 'vote')"><font-awesome-icon icon="thumbs-down"/> </b-button>
                  <label class="center" style="margin-left: 0.5em" v-if="vote !== true && vote !== false"> <h5> votes: {{  vote > 0 ? '+' : '' }}{{vote}}  </h5> </label>
                </div>
              </template>
            </b-form-group>
            <b-form-group label = "Horizon: " label-for = "InitiativeHorizon" horizontal :label-cols="6" label-size="sm" class="col-6" style="padding-left: 0.5em">
                <b-dropdown :text="form.horizon.horizon" name="InitiativeHorizon" size="sm" class="horizon m-2">
                <b-dropdown-item
                v-for="element in horizonList" v-if="horizonList"
                v-bind:key="element.horizon"
                @click="handleInitiativeSetField(element, 'horizon')"
                size = "sm"
                >{{ element.horizon }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
            <b-form-group label = "Priority: " label-for = "InitiativeStatuses" horizontal :label-cols="5" label-size="sm" class="col-6">
              <b-dropdown :text="form.status.name" name="InitiativeStatuses" size="sm" class="statuses m-2">
                <b-dropdown-item
                v-for="element in objStatuses" v-if="objStatuses"
                v-bind:key="element.id"
                @click="handleInitiativeSetField(element, 'status')"
                size = "sm"
                >{{ element.name }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
          </div>
          <div class="col-8">
          </div>
          <div class="col-4">
          </div>
          <div class="col-12">
            <Connections :toConnectionData='toConnectionData'>
            </Connections>
          </div>
          <div class="button-box" style="margin-top:20px;">
            <div class="float-right">
              <b-btn size="sm" type="submit" variant="primary" @click="handleSaveInitiative()">Save & close</b-btn>
              <b-btn size="sm" @click="$router.go(-1)"> Back </b-btn>
            </div>
            <Comments :toCommentsData='toCommentsData' ref="comments_ref">
            </Comments>
          </div>
      </div>
    </b-card>
  </div>
</template>

<script>

import _get from 'lodash/get';
import _ from 'lodash';
import Connections from '../common/connections.vue';
import Comments from '../common/comments.vue';
export default {
  name: 'Initiative',
  data() {
    return {
      toConnectionData: {name: 'initiative', id: this.$route.query.initiativeid, connects: ['item']},
      toCommentsData: {name: 'initiatives', id: this.$route.query.initiativeid, admin: false},
      objStatuses: [],
      horizonList: [],
      vote: '',
      btntrue: '',
      btnfalse: '',
      form: { title: '', description: '', status: { id: 10, name: 'Should have' }, horizon: { date: new Date(), horizon: this.getHorizonName(new Date()) }, vote: null },
      admin: false
    };
  },
  async mounted() {
    await this.loadOrgStatuses();
    await this.loadOrgInitiative();
    this.horizonLoadList();
    await this.loadVotes();
    // this.btnfalse = '';
  },

  computed: {
  },

  methods: {
    async loadOrgStatuses() {
      try {
        this.$loading(true);
        const orgId = this.$store.state.organization.id;

        const response = await this.axios.get(`/api/statuses/initiatives/${orgId}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        this.objStatuses = _get(response, 'data.statuses');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleInitiativeSetField(element, name) {
      this.form[name] = element;
      if (name === 'vote') {
        this.vote = element;
        if (element === true) {
          this.btntrue = 'success';
          this.btnfalse = '';
        } else {
          this.btntrue = '';
          this.btnfalse = 'danger';
        };
        await this.doVote(element);
       //  this.$nextTick();
      };
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
      return 'Q' + quarter + year;
    },
    formatDate(d) {
      const month = d.getMonth();
      const year = d.getFullYear();
      const day = d.getDate();
      return year + '-' + month + '-' + day;
    },
    async loadOrgInitiative() {
      try {
        this.$loading(true);

        const orgId = this.$route.query.orgId;
        const initiativeId = this.$route.query.initiativeid;
        const response = await this.axios.get(`/api/initiatives/` + orgId + '/' + initiativeId);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let initiative = _get(response, 'data.initiative');
        initiative.status = _.find(this.objStatuses, { 'id': initiative.statusId });
        initiative.horizon = {
          date: new Date(initiative.horizon),
          horizon: this.getHorizonName(new Date(initiative.horizon))
        };
        this.toCommentsData.admin = _get(response, 'data.admin');

        this.form = initiative;
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
        delete data['createdAt'];
        delete data['updatedAt'];
        delete data['createdBy'];
        delete data['popularity'];
        delete data['author'];
        delete data['id'];
        delete data.vote;

        data.horizon = this.formatDate(new Date(data.horizon.date));
        data.statusId = String(data.status.id);

        delete data.status;

        data.organizationId = String(data.organizationId);
        const response = await this.axios.put(`/api/initiatives/edit/${orgId}/${initiativeId}`, data);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to update initiative.`);

        // this.$notify({group: 'app', type: 'success', text: 'Item updated'});
        const newComment = this.$refs['comments_ref'].newComment;
        if (newComment) this.$refs['comments_ref'].handleNewComment(this.$refs['comments_ref'].newComment);
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$router.go(-1);
      }
    },
    async doVote(result) {
      try {
        // this.$loading(true);

        const initiativeId = this.$route.query.initiativeid;
        const response = await this.axios.post(`/api/votes/initiatives/` + initiativeId + '/' + String(result));

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to vote.`);

        let vote = _get(response, 'data.votes');

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
        const response = await this.axios.get(`/api/votes/initiatives/` + initiativeId);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable load votes.`);

        let vote = _get(response, 'data.votes');
        this.vote = vote;
        let myVote = _get(response, 'data.myVote');
        if (myVote !== 0) this.handleInitiativeSetField(myVote, 'vote');
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
    margin-top:50px;
  }
  .description {
    outline: 0in;
    border: 1px solid lightblue;
  }
</style>
