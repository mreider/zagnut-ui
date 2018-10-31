<template>
  <div class="backlog">
     <label class="header col-12"><h2>Backlog</h2></label>
  </div>
</template>

<script>
import _get from 'lodash/get';
export default {
  name: 'Backlog',
  data() {
    return {
      form: { title: '', description: '', points: 0, status: { id: 1, name: 'Unplaned' }, assignee: {} }
    };
  },
  async mounted() {
    await this.loadBacklog();
  },

  computed: {
  },

  methods: {
    async loadBacklog() {
      this.$loading(true);
      const orgId = this.$route.query.orgId;
      const id = this.$route.query.id;
      try {
        const response = await this.axios.get('/api/backlogs/' + orgId + '/' + id);

        let success = _get(response, 'data.success');
        if (!success) this.$errorMessage.show('Unable to load current user profile');
        this.form = _get(response, 'data.backlog');
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
        console.log(this.form);
      }

      this.$loading(false);
    }
  },

  components: {
  }
};
</script>

<style lang="scss">
  .Backlog {
    .header {
      margin-top:50px;
    }
  }
</style>
