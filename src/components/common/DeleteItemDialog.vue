<template>
    <v-dialog v-model="dialogDeleteItem" max-width="250">
        <v-card>
            <v-card-text
                    class="text-xs-center subheading"
            >Wait. Are you sure you want to delete this permanently?</v-card-text>
            <v-card-actions>
                <v-btn
                        color="primary"
                        flat="flat"
                        outline
                        @click="closeDialog()"
                        small
                >Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn
                        color="error"
                        flat="flat"
                        outline
                        @click="deleteItem()"
                        small
                >Yes</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
  export default {
    name: "DeleteItemDialog",
    props: {
      dialogDeleteItem: Boolean
    },
    methods: {
      deleteItem() {
        this.$emit('deleteItem');
      },
      closeDialog() {
        this.$emit('closeDialog');
      }
    }
  };
</script>

<style scoped>

</style>
