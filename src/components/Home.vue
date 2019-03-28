<template>
  <v-container grid-list-xs>
    <div v-if="loading === true">
      <loading-indication></loading-indication>
    </div>
    <v-layout row wrap v-for="element in rss" v-bind:key="element.name" class="news-layout">
      <v-flex xs12>
        <h4 class="mb-4 ml-1">{{ element.name }}</h4>
      </v-flex>
      <v-flex xs12 sm12 v-for="item in element.items" v-bind:key="item.link" mb-4>
        <v-card>
          <v-card-title>
            <div>
              <span class="grey--text">{{ item.title }}</span>
            </div>
          </v-card-title>
          <v-card-text>
            <p v-html="item.content"></p>
          </v-card-text>
          <v-card-actions>
            <a :href="item.link" class="read-more-link" target="_blank">
              <v-btn flat small outline color="blue darken-3">Read more</v-btn>
            </a>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import _get from "lodash/get";
export default {
  name: "",
  data() {
    return {
      rss: [],
      showImg: false,
      loading: false
    };
  },

  computed: {},
  async mounted() {
    await this.loadFeed();
  },
  methods: {
    async loadFeed() {
      this.loading = true;
      try {
        // this.$loading(true);
        if (!success) this.showImg = false;
        const response = await this.axios.get(`/api/rss`);

        const success = _get(response, "data.success");

        const rss = _get(response, "data.rss");
        rss.forEach(element => {
          element.items.forEach(el => {
            el.content = el.content.replace("<pre>", "<p>");
            el.content = el.content.replace("</pre>", "</p>");
          });
        });
        this.rss = rss;
        this.loading = false;
        if (!success) this.showImg = true;
      } catch (error) {
        this.loading = false;
        return this.$errorMessage.show(error);
      } finally {
        // this.$loading(false);
      }
    }
  },
  components: {}
};
</script>

<style lang="scss" >
.understrap-read-more-link {
  display: none !important;
}
.read-more-link {
  text-decoration: none;
  margin-bottom: 7px;
  margin-left: 8px;
  &:hover {
    text-decoration: none;
  }
}
.news-layout {
  padding: 0 65px 0 65px;
  @media screen and (max-width: 768px) {
    padding: 0 15px 0 15px;
  }
  @media screen and (max-width: 420px) {
    padding: 0;
  }
}
</style>
