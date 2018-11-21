<template>
  <b-label v-model = "relations" class="connections"> {{ toConnectionData }} и {{ relations }} </b-label>
</template>

<script>
import _get from 'lodash/get';
export default {
  name: 'connections',
  props: ['toConnectionData'],
  data() {
    return {
      relations: {}
    };
  },
  async mounted () {
    await this.loadRelaitedList();
    console.log(this.relations);
  },
  computed: {
  },

  methods: {
    async loadRelaitedList() {
      this.toConnectionData.connects.forEach(element => {
        this.getConnection(element);
      });
    },
    async getConnection(element) {
      // const string = ;
      const response = await this.axios.get('/api/connections/' + this.toConnectionData.name + '/' + element + '/' + this.toConnectionData.id);
      console.log('/api/connections/' + this.toConnectionData.name + '/' + element + '/' + this.toConnectionData.id);
      let success = _get(response, 'data.success');
      if (!success) this.$errorMessage.show('Unable to load connections');
      let newArr = [];
      newArr.push(_get(response, 'data.info'));
      this.relations[element] = newArr;
    }
  },

  components: {
  }
};
</script>

<style lang="scss">
</style>
