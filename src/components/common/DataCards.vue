<template>
  <v-container fluid>
    <div v-if="loading === true">
      <loading-indication></loading-indication>
    </div>
    <v-layout row wrap>
      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <v-checkbox label="Show archived" class="checkbox" v-model="showArchived" @change="reload"></v-checkbox>
        <div>
          <v-btn
            v-for="item in computedFields"
            :key="item.id"
            small
            color="primary"
            outline
            @click="sortCards(item.key)"
            :class="{'v-btn--active': this.activatedButton === item.key }"
          >{{item.key}}</v-btn>
        </div>
        <v-spacer class="hidden-md-and-down"></v-spacer>

        <!--new initiative dialog-->
        <slot name="dialog-new-card"></slot>
      </v-toolbar>
      <v-toolbar card prominent align-center class="cards-toolbar hidden-sm-and-down">
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field
          label="Filter"
          v-model="filter"
          single-line
          class="pt-0"
          @keyup="filterInitiatives"
        ></v-text-field>
        <v-btn
          small
          outline
          class="pt-0 mt-0 clear-filter-botton"
          @click="filter = '', clearFilter()"
        >Clear</v-btn>
      </v-toolbar>
      <!--toolbar for mobile sizes-->
      <v-layout row wrap justify-center>
        <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
          <!--new initiative dialog-->
          <v-btn small outline color="success" @click="dialogNewCard = true">New</v-btn>
          <v-checkbox
            label="Show archived"
            class="checkbox pl-2 pr-2"
            v-model="showArchived"
            @change="reload"
          ></v-checkbox>
          <v-btn
            v-for="item in computedFields"
            :key="item.id"
            small
            color="primary"
            outline
            @click="sortCards(item.key)"
            :class="{'v-btn--active': this.activatedButton === item.key }"
          >{{item.key}}</v-btn>
        </v-flex>

        <v-flex xs12 pl-3 pr-3 class="cards-toolbar-mobile hidden-md-and-up">
          <v-text-field
            label="Filter"
            @keyup="filterInitiatives"
            single-line
            class="pt-0 pl-2 pr-2"
            v-model="filter"
          ></v-text-field>
          <v-btn
            small
            outline
            class="pt-0 mt-0 clear-filter-botton"
            @click="filter = '', clearFilter()"
          >Clear</v-btn>
        </v-flex>
      </v-layout>
      <!--cards section-->
      <v-flex xs12 sm6 md4 lg3 pl-1 pr-1 pt-3 v-for="item in cards" :key="item.id">
        <v-card>
          <v-card-title primary-title>
            <h4 class="mb-0">property name:
              <router-link
                :to="'initiative/?orgId='+$store.state.organization.id +'&initiativeid='+ item.id"
              >{{ item.title }}</router-link>
            </h4>
          </v-card-title>
          <div class="card-body pt-0 pb-0">
            <p class="mb-2">Description: {{item.description}}</p>
            <p class="mb-2">Popularity: {{item.popularity}}</p>
            <p class="mb-2">
              importance:
              <a href="#" @click="filterInitiatives(item.importance)">{{item.importance}}</a>
            </p>
            <p class="mb-2">
              Horizon:
              <a
                href="#"
                @click="filterInitiatives(item.horizon.horizon)"
              >{{item.horizon.horizon}}</a>
            </p>
            <p class="mb-2">
              Author:
              <a
                href="#"
                @click="filterInitiatives(item.lastName)"
              >{{item.firstName + ' ' + item.lastName }}</a>
            </p>
          </div>

          <v-card-actions class="pl-3 pb-2">
            <v-btn
              slot="activator"
              class="edit-button extra-small-button"
              outline
              fab
              dark
              small
              color="primary"
              :to="'initiative/?orgId='+$store.state.organization.id +'&initiativeid='+ item.id"
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
              @click="setCurrentInitiative(item), dialogDeleteInitiative = true"
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
        ></v-pagination>
      </div>
    </v-layout>

    <v-dialog v-model="dialogDeleteCard" max-width="250">
      <v-card>
        <v-card-text
          class="text-xs-center subheading"
        >Wait. Are you sure you want to delete this permanently?</v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat="flat" outline @click="dialogDeleteCard = false" small>Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            flat="flat"
            outline
            @click="handleInitiativeDelete(currentCard)"
            small
          >Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
