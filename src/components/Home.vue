<template>
  <b-card class="home" bg-variant="light">
    <div class=" col-lg-12 col-md-8 col-sm-6 col-xs-4">
      <div class="img center" style="margin-top: 3em" v-if="showImg"> <img src="/static/home.png"  width="500" height="500" alt="home"> </div>
      <div v-for="element in rss" v-bind:key="element.name" class="col-12" style="margin-top: 1em">
        <h4> {{ element.name }} </h4>
        <b-card v-for="item in element.items" v-bind:key="item.link" class="col-12" style="margin-top: 1em">
          {{ item.title }}
          <b-media>
            <span v-html="item.content"></span>
          </b-media>
        </b-card>
      </div>
    </div>
  </b-card>
</template>

<script>

import _get from 'lodash/get';
export default {
  name: '',
  data() {
    return {
      rss: [],
      showImg: false
    };
  },

  computed: {
  },
  async mounted() {
    await this.loadFeed();
  },
  methods: {
    async loadFeed() {
      try {
        // this.$loading(true);
        if (!success) this.showImg = false;
        const response = await this.axios.get(`/api/rss`);

        const success = _get(response, 'data.success');

        const rss = _get(response, 'data.rss');
        this.rss = rss;
        if (!success) this.showImg = true;
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        // this.$loading(false);
      }
    }
  },
  components: {
  }
};
</script>

<style lang="scss" scoped>
</style>
