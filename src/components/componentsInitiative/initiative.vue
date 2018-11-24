<template>
  <div class="initiative col-lg-12 col-md-8 col-sm-6 col-xs-4">
     <b-card bg-variant="light" class="card col-lg-12">
       <div class="container-fluid  row">
          <div class="col-8">
            <b-form-group label = "Title: " label-for = "title">
              <b-form-input v-model="form.title" placeholder="Title initiative" id="title">></b-form-input>
            </b-form-group>
            <b-form-group label = "Highlights: " label-for = "description">
              <b-form-textarea id="description"
                  v-model="form.description"
                  placeholder="Highlights"
                  :rows="3"
                  :max-rows="6">
              </b-form-textarea>
            </b-form-group>
          </div>
       <div class="col-4" >
            <b-form-group label = "Vote: ">
              <template>
                <b-button v-model="vote" style="vertical-align: right;" size="lg" :variant.sync="btntrue" v-on:click="handleInitiativeSetField(true, 'vote')"><font-awesome-icon icon="thumbs-up"/> </b-button>
                <b-button v-model="vote" style="vertical-align: right;" size="lg" :variant.sync="btnfalse" v-on:click="handleInitiativeSetField(false, 'vote')"><font-awesome-icon icon="thumbs-down"/> </b-button>
              </template>
            </b-form-group>
            <b-form-group label = "Horizon: " label-for = "InitiativeHorizon">
                <b-dropdown :text="form.horizon.horizon" name="InitiativeHorizon" size="sm" class="horizon m-2" >
                <b-dropdown-item
                v-for="element in horizonList" v-if="horizonList"
                v-bind:key="element.horizon"
                @click="handleInitiativeSetField(element, 'horizon')"
                size = "sm"
                >{{ element.horizon }}
                </b-dropdown-item>
              </b-dropdown>
            </b-form-group>
            <div class="Initiativetable row" >
              <div class="col-6">
                <b-form-group label = "Status: " label-for = "InitiativeStatuses">
                  <b-dropdown :text="form.status.name" name="InitiativeStatuses" size="sm" class="statuses m-2" >
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
            </div>
          </div>
          <div class="col-8">
          </div>
          <div class="col-4">
          </div>
          <div class="col-12">
            <Connections :toConnectionData='toConnectionData'>
            </Connections>
          </div>
      </div>
    </b-card>
  </div>
</template>

<script>

import _get from 'lodash/get';
import _ from 'lodash';
import Connections from '../common/connections.vue';
export default {
  name: 'Initiative',
  data() {
    return {
      toConnectionData: {name: 'initiative', id: this.$route.query.initiativeid, connects: ['backlog']},
      objStatuses: [],
      horizonList: [],
      vote: '',
      btntrue: '',
      btnfalse: '',
      form: { title: '', description: '', popularity: 0, status: { id: 12, name: "Won't have" }, horizon: { date: new Date(), horizon: this.getHorizonName(new Date()) }, vote: null }
    };
  },
  async mounted() {
    await this.loadOrgStatuses();
    await this.loadOrgInitiative();
    this.horizonLoadList();
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
    handleInitiativeSetField(element, name) {
      this.form[name] = element;
      if (name === 'vote') {
        this.vote = element;
        if (element === true) {
          this.btntrue = 'success';
          this.btnfalse = '';
        } else {
          this.btntrue = '';
          this.btnfalse = 'success';
        };
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

        this.form = initiative;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    }

  },
  components: {
    Connections
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
