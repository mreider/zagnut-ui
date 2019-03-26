<template>
  <v-container grid-list-xs>
    <v-layout row wrap v-for="element in rss" v-bind:key="element.name" pl-4 pr-4>
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
            <a :href="item.link" class="read-more-link">
              <v-btn flat outline color="blue darken-3">Read more</v-btn>
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
      showImg: false
    };
  },

  computed: {},
  async mounted() {
    await this.loadFeed();
  },
  methods: {
    async loadFeed() {
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
        console.log(this.rss);
        if (!success) this.showImg = true;
      } catch (error) {
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
  &:hover {
    text-decoration: none;
  }
}
</style>
