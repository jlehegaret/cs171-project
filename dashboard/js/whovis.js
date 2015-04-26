WhoVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options ||
                  {  "start_date"  : "2014-01-01",
                      "end_date"    : "2015-05-05",
                      "categories"  : ["spec", "test"],
                      "actions"     : ["ISS_O", "ISS_C",
                                       "PR_O", "PR_C",
                                       "COM", "PUB"],
                      "specs"       : [],
                      "who"         : [],
                      "number_who"  : 20,
                      "width"       : 300,
                      "height"      : 900,
                      "who_sort"    : "issues"
                    };
    this.displayData = [];

    // defines constants
    this.margin = {top: 20, right: 10, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    this.height = this.options.height - this.margin.top - this.margin.bottom;

    this.initVis();
};

WhoVis.prototype.initVis = function() {
    var that = this;

    this.dateFormatter = d3.time.format("%Y-%m-%d");

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate("
              + (this.margin.left + this.margin.right + this.width)/2
              + ","
              + this.margin.top + ")");

     this.x_code = d3.scale.linear()
                      .range([0, this.width/2]);
     this.x_issues = d3.scale.linear()
                      .range([0, this.width/2]);
     this.y = d3.scale.ordinal()
                      .rangeRoundBands([0, this.height], .2, 0);

    this.color = d3.scale.ordinal()
    .range(["#062B59", "#09458F", "#073874", "#09458F", "#0B52AA", "#0C5FC5"]);

    // this.xAxis = d3.svg.axis()
    // .scale(this.x)
    // .ticks(5)
    // .orient("top");

    this.svg.append("g")
            .attr("class", "bars");

    // this.svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0," + -10 + ")");

    // filter, aggregate, modify data
    this.wrangleData();
    // call the update method
    this.updateVis();
};


WhoVis.prototype.updateVis = function()
{
console.log("WhoVis:");
console.log(this.displayData);

    var that = this;

    // for lines of code
    this.max = d3.max(this.displayData, function(d)
                        { return d.total_code; } );
    this.x_code.domain([0, this.max]);

    // for number of issues
    this.max = d3.max(this.displayData, function(d)
                        { return d.total_issues; } );
    this.x_issues.domain([0, this.max]);

    this.y.domain(this.displayData.map(function(d)
                        { return d.who; }));

    // this.svg.select(".x.axis")
    //     .call(this.xAxis)
    //     .selectAll("text");

console.log("this.displayData");
console.log(this.displayData);

    var bar = this.svg.selectAll("g.bars")
                      .selectAll("g.who")
                      .data(this.displayData, function(d)
                        { return d.who;
                        });

    var bar_enter = bar.enter()
                       .append("g")
                       .attr("class", "who");

    bar_enter.append("text");

    bar_enter.append("rect")
              .data(this.displayData.map(function(d)
                    { return { "who" : d.who,
                               "total" : d.total_code,
                               "type" : "code" };
                    }))
              .attr("class", "bar code");

    bar_enter.append("rect")
              .data(this.displayData.map(function(d)
                    { return { "who" : d.who,
                               "total" : d.total_issues,
                               "type" : "issues" };
                    }))
              .attr("class", "bar issues");

    // update all bars showing data
    bar.attr("transform", function(d)
    {
      return "translate(0," + that.y(d.who) + ")";
    });

    bar.selectAll("rect.bar")
        .attr("height", 10)
        .attr("x", 0)
        .attr("y", function(d)
                    {
                      if(d.type === "issues")
                      {
                        return 12; // move it down by bar_height
                      }
                      return 0;
                    })
        .style("fill", function(d)
        {
          if(d.type === "code")
          {
            return that.color(d.who)
          }
          else
          {
            return "crimson";
          }
        })
        .transition()
        .delay(function(d, i) { return i * 10; })
        .attr("width", function(d)
        {
          if(d.type === "code")
          {
            return that.x_code(d.total);
          }
          else
          {
            return that.x_issues(d.total);
          }
        });


    bar.selectAll("text")
            .text(function(d){return d.who})
            .style("font-size", "9px")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "0.8em")
            .style("font-family", "sans-serif");

    bar.exit()
        .remove();

    };

WhoVis.prototype.onTimelineChange = function(selectionStart, selectionEnd) {
    this.wrangleData();
    this.updateVis();
};



WhoVis.prototype.wrangleData = function()
{
  var that = this;

  function findWho(name, type)
  {
    var found = false;
    for(var i = 0; i < that.displayData.length; i++)
    {
      if(that.displayData[i].who == name)
      {
        return i;
      }
    }

    // if we're here, we need to create a new element
    //  PERHAPS WE WOULD GET RID OF DETAILS FOR PRODUCTION
    that.displayData.push(
      { "who"          : name,
        "total_code"   : 0,
        "total_issues" : 0,
        "work"         : [ { "cat"   : "spec",
                              "type"  : "COM",
                              "scale" : "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "spec",
                              "type" : "PR_O",
                              "scale": "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "spec",
                              "type" : "PR_C",
                              "scale": "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "spec",
                              "type" : "ISS_O",
                              "scale": "count",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "spec",
                              "type" : "ISS_C",
                              "scale": "count",
                              "details" : [],
                              "total" : 0 },
                            { "cat"   : "test",
                              "type"  : "COM",
                              "scale" : "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "test",
                              "type" : "PR_O",
                              "scale": "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "test",
                              "type" : "PR_C",
                              "scale": "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "test",
                              "type" : "ISS_O",
                              "scale": "count",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "test",
                              "type" : "ISS_C",
                              "scale": "count",
                              "details" : [],
                              "total" : 0 } ]
      });

    return (that.displayData.length - 1);
  }

  function processData(d, category)
  {
    var who;
    var index;
    var plus;  // need to change element number depending
              // on category being processed
    (category === "spec")
    ? plus = 0
    : plus = 5;

    // TAKING OUT COMMIT FUNCTIONALITY FOR NOW
    // if(d.commits && that.options.actions.indexOf("COM") !== -1)
    // {
    //   d.commits.forEach(function(c)
    //   {
    //       who = that.displayData[findWho(c.author)];
    //       who.total_code += (c.line_added + c.line_deleted);
    //       who.work[0 + plus].total += (c.line_added + c.line_deleted);
    //       who.work[0 + plus].details.push(c);
    //   });
    // }

    if( (category == "spec" && d.issues)
        || category == "test")
    {
      var process;

      (d.issues)
      ? process = d.issues
      : process = [d];
      process.forEach(function(c)
      {
        // is it a PR or an issue
        if(c.type === "pull" || c.type === "test")
        {
          // First, check data
          if(c.line_added == undefined)
          {
            if(c["line added"])
            {
              console.log("Have line added instead of line_added");
              c.line_added = c["line added"];
            }
            else
            {
              c.line_added = 0;
            }

          }

          if(c.line_deleted == undefined)
          {
            if(c["line deleted"])
            {
              console.log("Have line deleted instead of line_deleted");
              c.line_deleted = c["line deleted"];
            }
            else
            {
              c.line_deleted = 0;
            }

          }

          // Now, see if we want to see the data
          if( that.options.actions.indexOf("PR_O") !== -1
              && c.created_at >= that.options.start_date)
          {
            // who created it
            who = that.displayData[findWho(c.author.login)];
            who.total_code += (c.line_added + c.line_deleted);
            who.work[1 + plus].total += (c.line_added + c.line_deleted);
            who.work[1 + plus].details.push(c);
          }

          if(c.closed_at)
          {
            //  OUR DATA IS NOT PERFECT.  IF A PR IS NOT MERGED
            //    WE ACTUALLY DON'T KNOW WHO CLOSED IT
            if(c.merged_by || c.closed_by)
            {
              // who possibly closed it
              if( that.options.actions.indexOf("PR_C") !== -1
                && c.closed_at <= that.options.end_date)
              {
                if(c.merged_by)
                {
                  who = that.displayData[findWho(c.merged_by.login)];
                }
                else
                {
                  who = that.displayData[findWho(c.closed_by.login)];
                }
                who.total_code += (c.line_added + c.line_deleted);
                who.work[2 + plus].total += (c.line_added + c.line_deleted);
                who.work[1 + plus].details.push(c);
              }
            }
            else
            {
              console.log("Need closed_by name");
              console.log(c);
            }
          }
        }
        else if(c.type === "issue")
        // CURRENTLY, ONLY HAVE OPENING DATA
        {
          // how hard is it
          var value;
          if(c.difficulty)
          {
            (c.difficulty === "easy")
            ? value = 1
            : value = 2
          }
          else // not flagged, flag it this way
          {
            value = 3;
          }

          if(that.options.actions.indexOf("ISS_O") !== -1
              && c.created_at >= that.options.start_date)
          {
            // when was it created
            who = that.displayData[findWho(c.author.login)];
            who.total_issues += value;
            who.work[3 + plus].total += value;
            who.work[3 + plus].details.push(c);
          }
          // if(c.closed_at
          //    && c.??? <= that.options.end_date)
          // {
          // when was it possibly closed
          // if(that.options.actions.indexOf("ISS_C") !== -1)
          // {
             // NEED DATA FOR THIS TO CODE FOR IT
          // }
          // }
        }
        else { console.log("What is this?"); console.log(c); }
      });
    } // end of d.issues work
  }

  // CALL HELPER FUNCTIONS
  that.displayData = [];
  if(that.options.categories.indexOf("spec") !== -1)
  {
    that.data.specs.forEach(function(d)
    {
      if(that.options.specs.length == 0
         || that.options.specs.indexOf(d.url) != -1)
      {
        processData(d, "spec");
      }
    });
  }
  if(that.options.categories.indexOf("test") !== -1)
  {
    that.data.tests.forEach(function(d)
    {
      if(that.options.specs.length == 0)
      {
// console.log("processing test data for ");
// console.log(d);
         processData(d, "test");
      }
      else // we need to check that a spec we care about is concerned
      {
        var found = false;
        var i = 0;
        while(!found && i < this.options.specs.length)
        {
          if(that.options.specs.indexOf(d.specs[i]) !== -1)
          {
            found = true;
          }
          else
          {
            i++; // keep looking
          }
        }
        if(found) { processData(d, "test"); }
      }
    });
  }

if(this.options.who_sort === "code")
{
  this.displayData.sort(function(a, b)
                  { return b.total_code - a.total_code; });
}
else // sort by issues
{
    this.displayData.sort(function(a, b)
                  { return b.total_issues - a.total_issues; });
}
  // we exclude some people from this display
  var except = [ "Robin Berjon", "rberjon", "plehegar","darobin",
                "unknown", undefined];

  // take enough elements to cover exceptions list, just in case
  this.displayData = this.displayData.slice(0,
                      (this.options.number_who + except.length));

  // filter out exceptions
  this.displayData = this.displayData.filter(function(d)
                      { return except.indexOf(d.who) === -1; });

  // make sure it's the right length
  this.displayData = this.displayData.slice(0,
                      (this.options.number_who));

}

