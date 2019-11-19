new Vue({
  // root node
  el: "#app",
  // the instance state
  data: function () {
    return {
      features: ["Animation", "Textures", "Low Poly"],
      selection: {
        member: "0",
        modeltype: "wearable-head",
        features: []
      },
      message: {
        text: ``,
        maxlength: 255
      },
      submitted: false
    };
  },
  methods: {
    // submit form handler
    submit: function () {
      this.submitted = true;
    },
    // check or uncheck all
    checkAll: function (event) {
      this.selection.features = event.target.checked ? this.features : [];
    }
  }
});
