FilterUI = function  (_filters, _eventHandler) {

    var that = this;
    this.eventHandler = _eventHandler;
    this.filters = _filters;

    document.getElementById("state_open").addEventListener("click", function(d) {
        that.filters.state = "open";
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });
    document.getElementById("state_all").addEventListener("click", function(d) {
        that.filters.state = "all";
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });

    document.getElementById("cat_all").addEventListener("click", function(d) {
        that.filters.category = ["test", "spec"];
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });
    document.getElementById("cat_spec").addEventListener("click", function(d) {
        that.filters.category = ["spec"];
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });
    document.getElementById("cat_test").addEventListener("click", function(d) {
        that.filters.category = ["test"];
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });

    document.getElementById("sort_code").addEventListener("click", function(d) {
        that.filters.who_sort = "code";
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });
    document.getElementById("sort_issue").addEventListener("click", function(d) {
        that.filters.who_sort = "issues";
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });

    document.getElementById("caniuse_true").addEventListener("click", function(d) {
        that.filters.caniuse = "true";
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });
    document.getElementById("caniuse_false").addEventListener("click", function(d) {
        that.filters.caniuse = "false";
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });

};

