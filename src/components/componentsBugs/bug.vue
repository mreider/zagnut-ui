<template>
  <div class="initiative col-12">
    bug!
     <!-- <b-card bg-variant="light" class="card col-lg-12">
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
    </b-card> -->
  </div>
</template>

<script>

// import _get from 'lodash/get';
// import _ from 'lodash';
// import Connections from '../common/connections.vue';
// import Comments from '../common/comments.vue';
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
  },

  computed: {
  },

  methods: {
  },
  components: {
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
