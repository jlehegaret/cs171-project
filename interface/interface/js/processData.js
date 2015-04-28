var dateFormatter = d3.time.format("%Y-%m-%d");
var stripTime = function (dateTime) {
    return dateFormatter(new Date(dateTime))
};

var processData = function( _caniuse, _groups, _specs, _tests) {
    var allData = {caniuse: [], groups: [], specs: [], tests: []};

    caniuse = _caniuse;
    groups = _groups;
    specs = _specs
        .map(function (d) {
            if(d["last_pub"]) {
                d.last_pub = stripTime(d["last_pub"]);
            }
            if (d.issues) {
                d.issues = d.issues.map(function (dd) {
                    if(dd.created_at) {
                        dd.created_at = stripTime(dd.created_at);
                    } else if(dd["created at"]) {
                        console.log("Warning: JSON with irregular field \"created at\"");
                        console.log(dd);
                        dd.created_at = stripTime(dd["created at"]);
                    } else {
                        console.log("Error: JSON missing created_at field");
                        console.log(dd);
                    }
                    if (dd.closed_at) {
                        dd.closed_at = stripTime(dd.closed_at);
                    } else if (dd["closed at"]) {
                        console.log("Warning: JSON with irregular field \"closed at\"");
                        console.log(dd);
                        dd.closed_at = stripTime(dd["closed at"]);
                    }
                    if (dd.merged_at) {
                        dd.merged_at = stripTime(dd.merged_at);
                    } else if (dd["merged at"]) {
                        console.log("Warning: JSON with irregular field \"merged at\"");
                        console.log(dd);
                        dd.merged_at = stripTime(dd["merged at"]);
                    }
                    if(dd.closed_at && !dd.closed_by) {
                        dd.closed_by = "unknown";
                    }
                    return dd;
                });
            }
            if(d.commits) {
                d.commits = d.commits.map(function(dd) {
                    dd.date = stripTime(dd.date);
                    return dd;
                });
            }
            // also calculate CanIUse score
            //  THE RATIONAL:
            //  The CanIUse score of a spec
            //          = ( the sum of all the CanIUse
            //              scores of the elements )
            //            divided by
            //            ( the number of elements
            //              evaluated )
            //  The CanIUse score of an element
            //          = the average score across
            //              all browsers
            //  Score per Browser:  0 unknown
            //                      0 not
            //                      1 partial
            //                      2 yes
            var elements = caniuse.filter(function(e) {
                return e.spec == d.url;
            });
            if(elements.length == 0) {
                d.score = 0;
            }
            else {
                elements.forEach(function(e) {
                    e.CIUresult = 0;
                    e.stats.forEach(function(browser) {
                        if(browser.support === "yes") {
                            e.CIUresult += 2;
                        }
                        else if(browser.support === "partial") {
                            e.CIUresult += 1;
                        } // else nothing
                    });
                    e.CIUresult = e.CIUresult / e.stats.length;
                });
                // we have now stored element-by-element
                //  results in our spec-specific array
                // average this
                d.score = d3.sum(elements, function(e)
                { return e.CIUresult; })/elements.length;
            }
            return d;
        });
    //coerce date strings into date objects
    tests = _tests.map(function (d) {
        if(d.created_at) {
            d.created_at = stripTime(d.created_at);
        } else if(dd["created at"]) {
            d.created_at = stripTime(d["created at"]);
        } else {
            console.log("missing created_at");
            console.log(d);
        }
        if ("closed_at" in d) {
            d.closed_at = stripTime(d.closed_at);
        } else if ("closed at" in d) {
            d.closed_at = stripTime(d["closed at"]);
        }
        if(d.closed_at && d.closed_by === undefined) {
            d.closed_by = "unknown";
        }
        return d;
    });
    allData.caniuse = caniuse;
    allData.groups = groups;
    allData.specs = specs;
    allData.tests = tests;


    return allData;
};

//debugging method to log all the data structures
var logData = function () {
    console.log("Can I Use: ");
    console.log(caniuse);
    console.log("Groups: ");
    console.log(groups);
    console.log("Specs: ");
    console.log(specs);
    console.log("Tests: ");
    console.log(tests);
};
