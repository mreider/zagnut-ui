<template>
<div class="toolbar-container">
    <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <v-checkbox
          label="Show archived"
          class="checkbox"
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
        <v-btn small outline color="success" @click="openDialog">New</v-btn>
      </v-toolbar>
      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field label="Filter" :value="filter" single-line class="pt-0" @keyup="filterItems($event)"></v-text-field>
        <v-btn
          small
          outline
          class="pt-0 mt-0 clear-filter-botton"
          @click="clearFilter"
        >Clear</v-btn>
      </v-toolbar>
    </div>
</template>

<script>
export default {
  name: 'CardsToolbar',
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
