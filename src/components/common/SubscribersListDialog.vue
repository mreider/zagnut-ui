<template>
    <v-dialog
            v-model="dialogUserList"
            :overlay="false"
            max-width="350px"
    >
        <v-list>
            <v-list-tile v-for="(item) in users" :key="item.userId" :id="item.userId" @click="selectUser($event)">
                <v-list-tile-title>{{ item.firstName }} {{ item.lastName }}</v-list-tile-title>
            </v-list-tile>
        </v-list>
    </v-dialog>
</template>

<script>
  export default {
    name: "SubscribersListDialog",
    props: {
      dialogUserList: Boolean,
      users: Array
    },
    methods: {
      selectUser(item) {
        this.$emit('selectUser', item);
      }
    }
  };
</script>

<style scoped>

</style>
