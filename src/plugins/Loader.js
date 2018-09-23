export default {
  install (Vue, options = {}) {
    Vue.prototype.$loading = function (loading) {
      this.$store.commit({type: 'loading', loading});
    };
  }
};
