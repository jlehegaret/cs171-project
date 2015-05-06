# Section 6- Discoveries

* *return to [Section 5, Our Proposed Feature Set](proposal.md)*
* *proceed to [Section 7, Self-Evaluation](evaluation.md)*

<p align="center">
    <img src="images/FINAL_Dashboard.png" width="600"/>
</p>

Now that we have built this tool, let's imagine what people might want to learn from it.  While using it, let's keep our eyes open for any interesting patterns, too.

### What Does a Working Group Work On?

Our mandate from W3C was to develop something to allow users to see what a Working Group has been working on.

Both the timeline view and the proportion of blue in the spec edits / test suite ring within the sunburst graph tell us that working groups focus much more on their specs than on their test suites, and that the test suites are a relatively recent development (starting only in 2013).

If we view only test suite work for 2013 on, we see that quite a few working groups have done some test suite work.  However, if we view for only 2015, many of the test suites seem to have stopped getting attention.  And unfortunately, looking at the spec color for those areas of blankness, it is not because the spec is well-implemented.  In general, the less test work done recently, the more likely that spec has a very low Can I Use score.

The exceptions to this rule are the Web IDL, URL, UI Events, and Service Workers specs, all within the Web Applications Working Group.  These specs are getting a lot of test effort but have not yet been flagged as well-implemented by Can I Use.  Perhaps these are newer specs, and they are doing exactly what they need to be doing to move forward.

I would imagine, from W3C's point of view, that they would want to investigate why the other "gray" specs are NOT getting test efforts at the moment.

### Who's Ready to Step Up?

Within our feedback from W3C, we learned that W3C is also interested to identify contributors who are changing their contribution level.  Ones who increase their contributions may be likely candidates to chair a Working Group.  W3C may also want to reach out to those who have been active but who are now contributing less, to make sure not to lose them.

While it is possible to look at the W3C Contributors List at an overall level, it might be more effective to look at it at the level of a Working Group.  If we choose the HTML Working Group, for example, we can identify who is contributing more recently by first selecting a wide timebrush (say, 2014 on) and then narrowing it.

As we do this, we see that, while Erica Doyle was the hugest overall contributor over all time, she seems to have stopped working for the Group.  Instead, David Dworkin,Ms2ger, and Aaron Colwell rise to the top of the list.  Continuing to narrow the focus to the even more "here and now", though, we see Aaron Colwell again subside, but David Dorwin and Ms2ger stay in spots 1 and 2.  These two are clearly energetic in the present moment as well as having a strong history with the group.

The HTML Working Group always has a very long and healthy list of contributors, no matter what the timeframe.  However, the Web Performance Working Group does not.  If we select 2014 on for that group, we see only several people actually work with the code and a whole lot of people raise issues.  As we narrow the timeframe into 2015 and on, we see that we have lost about half of our contributors, including some of the previously highest contributors.  This working group seems to have just one core person left in it in recent months to touch the code, and only a handful of others raising issues.  Is this because the spec is quite mature?  It doesn't seem so, as its Can I Use score seems quite low.  Perhaps there are other factors at play.

### Can I Use It?

The Can I Use data, as derived, seems less interesting than I had hoped.  A spec seems either to be in very good shape or not even on the map.  But then, even this is information that may not have been previously known.


### Talk To Me!  Differences Between Specs and Tests

One thing that I found quite interesting is just how much more the specs are worked on than the test suites.  Editing the spec texts requires even more lines of code than the thousands of JavaScript tests under development -- impressive.

We see that spec writers use GitHub's Issues feature in GitHub quite extensively, and that issues get closed just as often as they get opened, which is good.

On the other hand, in the test suite development world, very very few issues are raised, and those that are raised are not often closed.

Using our menu option to view currently unresolved items only, we see a surprising number of them, dating back to Fall of 2013.  Is this when W3C first started to work on GitHub?  Why are so many of these pull requests still waiting to be merged?  Why are these issues still open?  Unfortunately, the multitude begs us to expand the data and the visualization in order to identify patterns that may answer these questions.




