<template>
  <div class="text-xs-center preloader-holder">
    <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
  </div>
</template>

<script>
export default {
  name: "loading-indication",
  props: ["loading"]
};
</script>

<style lang="scss">
.preloader-holder {
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  width: 100%;
  height: 80%;
  z-index: 10000;
  background-color: rgba(255, 255, 255, 0.5);
}
.v-progress-circular {
  margin: 0 auto;
  margin-top: 15%;
}
</style>
