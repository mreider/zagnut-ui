<template>
    <v-item-group multiple >
        <v-subheader>Subscribed users: </v-subheader>
        <v-item
                v-for="(item, i) in subscribers"
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
    name: "SubscribedUsersToCommentList",
    props: {
      subscribers: Array,
      comments: Array,
      newCommentSubscribers: Array,
      ownerId: String
    },
    methods: {
      removeSubscribedUser(item) {
        let subscribedUsers = [];
        let commentIndex;
        if (item.subownerId) {
          const commentObject = this.comments.find(commentObj => commentObj.id === item.subownerId);
          commentIndex = this.comments.findIndex(commentObj => commentObj.id === item.subownerId);
          subscribedUsers.push(commentObject);
        } else {
          subscribedUsers = this.newCommentSubscribers;
        }
        const itemIndex = subscribedUsers.findIndex(chipUser => chipUser.userId === item.userId);
        if (itemIndex >= 0) {
          if (!item.subownerId) {
            this.newCommentSubscribers.splice(itemIndex, 1);
          } else {
            this.comments[commentIndex].subscribers.splice(itemIndex, 1);
            let usersIds = [];
            usersIds.push(String(item.id));
            const ownerTable = this.$route.name.toLowerCase() + "s";
            const ownerId = this.ownerId;

            this.$loading(true);
            this.axios
              .post(`/api/subscribers/delete/${ownerTable}/${ownerId}`, {
                subowner: "comments",
                usersId: usersIds,
                subownerId: `${item.subownerId}`
              })
              .then(response => {
                this.$loading(false);
              })
              .catch(err => {
                console.log(err);
                this.$loading(false);
              });
          }
        }
      }
    }
  };
</script>

<style scoped>

</style>
