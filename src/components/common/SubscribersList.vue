<template>
    <v-item-group multiple >
        <v-subheader class="pl-2">Subscribed users: </v-subheader>
        <v-item
                v-for="(item, i) in subscribedUsers"
                :key="i"
        >
            <v-chip close @input="removeSubscribedUser(item)">
                {{ item.firstName }}  {{ item.lastName }}
            </v-chip>
        </v-item>
    </v-item-group>
</template>

<script>
  export default {
    name: "SubscribersList",
    props: {
      subscribedUsers: Array
    },
    methods: {
      removeSubscribedUser(item) {
        const itemIndex = this.subscribedUsers.findIndex(chipUser => chipUser.id === item.id);
        if (itemIndex >= 0) {
          const ownerTable = this.$route.name.toLowerCase() + "s";

          let ownerId;
          if (this.$route.query.hasOwnProperty("bugId")) {
            ownerId = this.$route.query.bugId;
          } else if (this.$route.query.hasOwnProperty("initiativeid")) {
            ownerId = this.$route.query.initiativeid;
          } else if (this.$route.query.hasOwnProperty("itemId")) {
            ownerId = this.$route.query.itemId;
          }
          let usersIds = [];
          usersIds.push(String(item.id));
          this.$loading(true);
          this.axios
            .post(`/api/subscribers/delete/${ownerTable}/${ownerId}`, {
              usersId: usersIds
            })
            .then(response => {
              this.$loading(false);
              console.log(itemIndex);
              this.subscribedUsers.splice(itemIndex, 1);
            })
            .catch(err => {
              console.log(err);
              this.$loading(false);
            });
        }
      }
    }
  };
</script>

<style scoped>

</style>
