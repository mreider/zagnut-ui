<template>
  <div class="backlogs">
    <label class="header"><h2>Some things to do</h2></label>
      <div class="headerMenu">
        <label class="labelGroupBy" for="groupBy"> <h4> Group by: </h4></label>
        <b-dropdown :text="currentGroupBy" name="groupBy" size="sm" class="m-2" >
          <b-dropdown-item
          v-for="element in groupByList" v-if="groupByList"
          v-bind:key="element"
          @click="handleChangeGroupBy(element)"
          size = "sm"
          >{{ element }}
          </b-dropdown-item>
        </b-dropdown>
        <div>
          <label class="labelCheckboxGroup" for="checkboxGroup"> <h5> Show: </h5></label>
          <b-form-checkbox-group id="statuses"
                            v-model="selected"
                            name="stats"
                            :options="statuses"
                            aria-label="Statuses"
                            class="checkboxGroup"
                            >
          </b-form-checkbox-group>
        </div>

        <div class="button-box">
          <b-btn variant="success" size="sm" v-b-modal.modalnew>➕ New item</b-btn>
          <b-modal id="modalnew"
                    button-size="sm"
                    title="New backlog"
                    @ok="handleNewBacklog(newBacklog)"
                    size="lg"
                    centered
                    >
              <b-form-input v-model="newBacklog.title" placeholder="Title backlog">></b-form-input>
              <b-form-input type="text" class="input-group-text" v-model="newBacklog.desctription" placeholder="Title desctription">></b-form-input>
          </b-modal>
      </div>
      </div>
  </div>
</template>

<script>
import _get from 'lodash/get';
import _ from 'lodash';
export default {
  name: 'Backlogs',
  data() {
    return {
      statuses: [],
      groupByList: ['Status', 'Stategic initiative'],
      currentGroupBy: 'Status',
      selected: [],
      newBacklog: {title: '', desctription: '', points: 0, status: 0, assignee: ''}
    };
  },
  async mounted() {
    this.loadOrgStatuses();
  },

  computed: {

  },

  methods: {
    async loadOrgStatuses() {
      try {
        this.$loading(true);

        const response = await this.axios.get(`/api/statuses/${this.$store.state.organization.id}`);

        const success = _get(response, 'data.success');
        if (!success) throw new Error(`Unable to load user's organizations.`);

        let objStatuses = _get(response, 'data.statuses');
        let statuses = _.map(objStatuses, v => v.name);
        this.objStatuses = objStatuses;
        this.statuses = statuses;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    async handleChangeGroupBy(element) {
      this.currentGroupBy = element;
      // todo reload form with selected value give sort as param backend
    },
    async handleNewBacklog(newBacklog) {
      console.log(newBacklog);
    }
  },
  watch: {
    selected (newVal, oldVal) {
      // todo update list backlogs
      console.log(this.selected);
    }
  },
  components: {
  }
};
</script>

<style lang="scss">
  .backlogs {
    .header {
      margin-top:50px;
    }.headerMenu {
    }
    .labelGroupBy {
    }
  }
</style>
