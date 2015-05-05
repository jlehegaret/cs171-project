Section 4 cont. - Our Design Process, the Timeline

* *return to [The Design Process - Sunburst](design_sunburst.md)*
* *proceed to [The Design Process - Who](design_who.md)*

## The TimeLine

<p align="center">
    <img src="images/main1.jpg" width="600"/>
</p>

The timeline shows all of the work represented by the sunburst graph, but across time.

As issues and pull requests are opened, they show up as "negative" amounts, and the height of their bar depends on the difficulty (issues) or number of lines of code affected (pull requests).

As issues and pull requests are closed, they show up as "positive" amounts.

We planned that issues would be red, while pull requests would be blue.

### Development

First, we needed something as a fast placeholder which could also interact with the sunburst.  Here, we see one simple path element, all in black, showing the overall amount of work done over time as measured in issues.

<p align="center">
    <img src="images/Timeline1.png" width="600"/>
</p>

However, we wanted our color-coding by contribution type.  Also, given that every day presents a SUM of the work done by type on that day, it was hard to present the number of issues on the same scale as lines of code.  Our first attempt to create two x axes, one for each scale, showed us quite quickly that there was too much data to fit in 5 bars per day for the entire time frame.  As you can see, there is so much work done in recent times that the bars overlap, making purely saturated color.


<p align="center">
    <img src="images/Timeline2.png" width="600"/>
</p>

Due to the crowdedness of the data, we broke up the types of work into yet more axes, so that that every day could be just 1-2 pixels wide rather than 5.  The top two lines represent code and issues for the specs themselves, while the bottom two lines represent code and issues for the test suite.

Even so, the complete history of data seemed too much for the graph.  We turned to pre-emptive filtering to show data for the most recent year and a half.  This seemed reasonable, given that W3C seems most interested in trends over the last few months.

However, we also added informational elements:

Gray lines represent "last published" dates of non-Recommendation-status specs, while black lines represent "last published" dates of Recommendation-status specs.  W3C hopes that all of its non-Recommendation specs are updated everything three months, so we can already see that a lot is falling through the cracks - many specs are older than three months.

Tooltips list all of the pieces that went into forming each bar help identify what happened when, and which specs were published when.

As there are some huge outliers of code movement when repos were at times moved, we use a power scale to allow us still to see the "normal" range of activity even while representing those huge outliers on the same axis.  (Thank you, Homework 3!)

<p align="center">
    <img src="images/Timeline3.png" width="600"/>
</p>

Anticipating rendering help from the "focus and context" axis, we reconsolidated the data onto one axis.  Specification work generally points up while test suite work points down -- however, if the user chooses to see only test suite work, then that points up as well.

At this point, the timeline also reacts to other events on the page.  It can be filtered to show only work done by a particular Working Group, on a particular spec, by a particular person, only still-unresolved issues or all issues, and particular branches of work - only spec edits, only test suite development, or both.

However, at this point, the timeline has had its tooltips deactivated, as they do not work well with the brushing in the current iteration, and we want first to change to the "focus and context" axis format before revisiting this issue.

<p align="center">
    <img src="images/Timeline4.png" width="600"/>
</p>

Unfortunately, the focus and context axis proved actually quite difficult to implement, and days passed without progress.  Luckily, as the deadline approached and things on that front looked grim, Jennifer had the idea just to harness our existing timeline vis code twice in order to create the same effect ourselves - one above to provide the focus, and one below to provide the overview.  The top graph could offer tooltips while the bottom one offered the brushing.  (Thank you, Section 3!)

<p align="center">
    <img src="images/Timeline5.png" width="600"/>
</p>

IN THE END - what tooltips are there.

<p align="center">
    <img src="images/FINAL_Timeline.png" width="600"/>
</p>
