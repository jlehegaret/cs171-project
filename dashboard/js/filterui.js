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
    })




};

