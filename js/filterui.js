FilterUI = function  (_parentElement, _filters, _eventHandler) {

    var that = this;
    this.eventHandler = _eventHandler;
    this.filters = _filters;
    this.parentElement = _parentElement;

    this.dateFormatter = d3.time.format("%Y-%m-%d");

    this.initUI();
};

FilterUI.prototype.initUI = function() {
    this.addEventHandlers();

    //grabs any query string filters and sets global filters object
    this.initHashString();
    //sets a new hash string with all the filters
    this.setHashString(this.filters);


    this.specLabel = this.parentElement.select("#specLabel");
    this.wgLabel = this.parentElement.select("#wgLabel");

    this.timelineLabelStart = this.parentElement.select("#timeframeLabelStart");
    this.timelineLabelEnd = this.parentElement.select("#timeframeLabelEnd");
    this.whoLabel = this.parentElement.select("#whoLabel");
    this.categoryLabel = this.parentElement.select("#categoryLabel");
    this.statusLabel = this.parentElement.select("#statusLabel");

    //Initialize all the display fields to properties of the initial filters object
    this.timelineLabelStart.text(this.dateFormatter(new Date(this.filters.start_date)));
    this.timelineLabelEnd.text(this.dateFormatter(new Date(this.filters.end_date)));
    this.whoLabel.text(this.getAuthorText(this.filters.who));
    this.categoryLabel.text(this.getCategoryText(this.filters.category));
    this.statusLabel.text(this.getStatusText(this.filters.state));

};

//////
//Event handling code for the ui triggered filters
//////
FilterUI.prototype.addEventHandlers = function() {
    var that = this;
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
};

//Updates the hash query string with the current filters
FilterUI.prototype.setHashString = function(_filters) {
    jHash.val(_filters);
};

//Grabs any hash string query variables that are present and updates the global filters object accordingly
FilterUI.prototype.initHashString = function() {
    var hashFilters = jHash.val();

    if(hashFilters.start_date) {
        this.filters.start_date = hashFilters.start_date;
    }
    if(hashFilters.end_date) {
        this.filters.end_date = hashFilters.end_date;
    }
    if(hashFilters.who) {
        this.filters.who = hashFilters.who
    }
    if(hashFilters.state) {
        this.filters.state = hashFilters.state;
    }
    if(hashFilters.category) {
        this.filters.category = hashFilters.category.split(",");
    }
    if(hashFilters.who_sort) {
        this.filters.who_sort = hashFilters.who_sort;
    }
};

FilterUI.prototype.onAuthorChange = function(author) {
    this.whoLabel.text(this.getAuthorText(author));

    var queryHash = jHash.val();
    queryHash.who = author;
    jHash.val(queryHash);
};

FilterUI.prototype.onTimelineChange = function(startDate, endDate) {
    this.timelineLabelStart.text(this.dateFormatter(startDate));
    this.timelineLabelEnd.text(this.dateFormatter(endDate));

    var queryHash = jHash.val();
    queryHash.start_date = this.dateFormatter(startDate);
    queryHash.end_date = this.dateFormatter(endDate);
    jHash.val(queryHash);
};

FilterUI.prototype.onSelectionChange = function(sunburstSelection) {
    this.wgLabel.text(this.getWgText(sunburstSelection));
    this.specLabel.text(this.getSpecText(sunburstSelection));
};

FilterUI.prototype.onFilterChange = function(_filters) {
    this.categoryLabel.text(this.getCategoryText(_filters.category));
    this.statusLabel.text(this.getStatusText(_filters.state));

    var queryHash = jHash.val();
    queryHash.category = _filters.category;
    queryHash.state = _filters.state;
    queryHash.who_sort = _filters.who_sort;
    jHash.val(queryHash);
};

///////
///Formatting functions to output text for different filter states
///////
FilterUI.prototype.getAuthorText = function(author) {
    if(!author) {
        return "All"
    } else {
        return author;
    }
};

FilterUI.prototype.getCategoryText = function(category) {
    if(category.length === 2) {
        return "All Categories";
    } else if(category.indexOf("spec") != -1) {
        return "Spec Edits Only";
    } else if(category.indexOf("test") != -1) {
        return "Test Suite Work Only";
    }
};

FilterUI.prototype.getStatusText = function(status) {
    if(status === "all") {
        return "All Work Done";
    } else if(status === "open") {
        return "Unresolved Issues Only";
    }
};

FilterUI.prototype.getWgText = function(sunburstSelection) {
    switch(sunburstSelection.depth) {
        case 0:
        return "All";
        case 1:
            return sunburstSelection.name;
        case 2:
            return sunburstSelection.parent.name;
        case 3:
            return sunburstSelection.parent.parent.name;
        case 4:
            return sunburstSelection.parent.parent.parent.name;
    }
};

FilterUI.prototype.getSpecText = function(sunburstSelection) {
    switch(sunburstSelection.depth) {
        case 0: case 1:
            return "All";
        case 2:
            return sunburstSelection.name;
        case 3:
            return sunburstSelection.parent.name;
        case 4:
            return sunburstSelection.parent.parent.name;
    }
};