<template>
  <div class="invitation">
    <h3>Invitation status: {{ status }}</h3>

    <div v-if="status === 'confirmed'">
      Your invitation to organization {{ organization }} was confirmed!
    </div>
  </div>
</template>

<script>
import _get from 'lodash/get';

export default {
  name: 'Invite',

  data() {
    return {
      status: 'checking',
      organization: null
    };
  },

  async mounted() {
    const token = this.$route.query.token;

    if (!token) return;

    if (token) {
      this.invited = true;

      this.$loading(true);

      try {
        const response = await this.axios.get('api/org/invite', { params: { token } });

        const success = _get(response, 'data.success');
        if (!success) throw new Error('Token iinvalid or expired');

        this.organization = _get(response, 'data.organization');
        this.status = 'confirmed';
      } catch (error) {
        this.status = 'error';
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    }
  },

  methods: {
  },

  components: {
  }
};
</script>

<style lang="scss">
  .invitation {
    padding: 40px;
    text-align: center;
  }
</style>
