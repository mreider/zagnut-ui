<template>
<v-layout row wrap justify-center>
    <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
        <v-btn small outline color="success" @click="openDialog">New</v-btn>
        <v-checkbox
          label="Show archived"
          class="checkbox pl-2 pr-2"
          @change="showArchived"
        ></v-checkbox>
        <div>
          <v-item-group multiple>
            <v-item
              v-for="button in buttons"
              :key="button.name"
            >
              <v-btn
                small
                color="primary"
                outline
                @click="sort(button.name)"
                :class="{'v-btn--active': activeButton === button.name }"
              >{{button.name}}</v-btn>
            </v-item>
          </v-item-group>
        </div>
        <v-spacer class="hidden-md-and-down"></v-spacer>
      </v-flex>
      <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
        <v-text-field label="Filter" class="pt-0 pl-2 pr-2" :value="filter" single-line @keyup="filterItems($event)"></v-text-field>
        <v-btn
          small
          outline
          class="pt-0 mt-0 clear-filter-botton"
          @click="clearFilter"
        >Clear</v-btn>
      </v-flex>
    </v-layout>
</template>

<script>
export default {
  name: 'CardsToolbarMobile',
  data() {
    return {
      filter2: ''
    };
  },
  props: {
    buttons: Array,
    showArchived: Function,
    sortItems: Function,
    activeButton: String,
    openDialog: Function,
    filterItems: Function,
    clearFilter: Function,
    filter: String
  },
  methods: {
    sort(event) {
      this.sortItems(event);
    }
  }
};
</script>

<style scoped>
.toolbar-container {
  flex: 0 1 100%;
  margin: auto;
  width: 100%;
}
</style>
