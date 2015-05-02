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
        that.category = "all";
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });
    document.getElementById("cat_spec").addEventListener("click", function(d) {
        that.category = "spec";
        $(that.eventHandler).trigger("filterChanged", that.filters);
    });
    document.getElementById("cat_test").addEventListener("click", function(d) {
        that.category = "test";
        $(that.eventHandler).trigger("filterChanged", that.filters);
    })



};

