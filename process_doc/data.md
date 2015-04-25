# Section 2 - The Data

* *return to [Section 1, Background, Motivation and Objectives](background.md)*
* *proceed to [Section 3, What W3C Has So Far](existing.md)*

## What's Out There

### The Specs themselves

W3C has over 1000 Specifications that, combined, set the standards for web technologies.  These standards are worked on by a collection of about 50 Working Groups.  Each specification is an HTML document that moves through various stages – from Working Draft to Recommendation.  Much of this HTML code is hosted on GitHub.  For example, the Web Components Spec is worked on here:  [https://github.com/w3c/webcomponents]( https://github.com/w3c/webcomponents).

Every single W3C spec that has a GitHub repository will be included in our dataset.  There are three ways the spec is worked on within GitHub:
* **Commits**.  Some people are allowed to merge in code directly, without review.  GitHub keeps track of who, when, and how many lines of code were affected.  Here is the list of commits for W3's Web Components Spec:  [https://github.com/w3c/webcomponents/commits/gh-pages] (https://github.com/w3c/webcomponents/commits/gh-pages)
* **Pull Requests**.  Other people need to request that their changes are merged in.  Those people will open a pull request, and then someone with authorization needs to review that pull request, and then either merge it and close it, if the changes are desired, or just close it, if in fact the spec should not be updated in that way.  Again, GitHub keeps track of who, when, and how many lines of code were affected.  Here is the list of pull requests for W3's Web Components Spec:  [https://github.com/w3c/webcomponents/pulls] (https://github.com/w3c/webcomponents/pulls)
* **Issues**.  As questions and ideas come up, people raise issues about the spec.  Others can comment, and then, once a consensus has been reached and the appropriate updates to the spec are made, the issue can be closed.  GitHub keeps track of everyone who participated in that discussion, and the dates of each comment and action.  Here are past issues for W3's Web Componets Spec:  [https://github.com/w3c/webcomponents/issues](https://github.com/w3c/webcomponents/issues)


### JavaScript tests

Many of W3's specifications also have an associated Test Suite of JavaScript code hosted on GitHub.  This Test Suite aims to provide a point-by-point test for every single detail within a given specification – like that, W3C, the browser developers, and other interested parties can analyze the current degree of real-world implementation of that specification.  Basically, it is CanIUse.com to the nth degree.

Many people pitch in to write tests about each spec, and the tests are housed in GitHub at [https://github.com/w3c/web-platform-tests](https://github.com/w3c/web-platform-tests)

There is a very long directory listing in that repo, and every single folder in that list represents a test suite for one specific spec!

The exact scope of test coverage per spec, and whether the tests pass or fail on which browsers is currently out of the scope of this project (we will use caniuse.com to proxy that information).  However, thanks to the GitHub API, we can see who contributes how many lines of code for each spec and when, either via commit or via pull request.

### Issues with JavaScript tests

At the very top of this repository are issues that people have raised about the test-suite overall:

[https://github.com/w3c/web-platform-tests/issues](https://github.com/w3c/web-platform-tests/issues)

These have been tagged with information about
- to which spec does the issue pertain (the gray label(s))
- which working group needs to resolve the issue (the blue label that starts with a "wg")
- how hard is the issue to address - this helps testwriters know which are the low-hanging fruit they can easily take care of

As these tags are also available for download via the GitHub API, we are again able to categorize the overall test suite issues into issues per spec, and also to obtain "difficulty level" for these issues.


### CanIUse Data

In addition, www.CanIUse.com reports how well-implemented various particular features within a web technology have been implemented across browsers.  We are able to tie their reporting back to a given W3C spec thanks to their Resources tab for a given feature.  However, sometimes they reference the WHATWG version of the spec instead.

[http://caniuse.com/](http://caniuse.com/) is a great resource for web developers to learn how long ago a spec's feature has been adopted so as to determine whether or not workarounds for older browsers will be necessary or not.

For example, if we look at [SVG fonts](http://caniuse.com/#feat=svg-fonts) and click on the Resources tab at the bottom of the screen, we see **Specification [w3.org]**, which links to the exact section of the appropriate spec detailing that feature.

The CanIUse API will let us access this data so that we can report, per spec, the status of any and all features that CanIUse has cataloged for that spec.


## Collecting the Data

Our data was obtained via the GitHub API, the CanIUse API, and our friendly connection at the W3C, who listed out for us each Working Group, the Specs that Group works on, and the status of each of those Specs.  Our friendly connection also remapped all CanIUse.com WHATWG Spec references to W3C Spec references.

Because we focus only on what data is available via GitHub for W3C work, our population of specs is reduced to about 70 specs, which are worked on by fewer than 20 Working Groups.  While this is a significant reduction in scope (for example, CSS is not represented, as the CSS Working Group does not use GitHub), W3C is still very motivated to view the status of these 70 GitHub-hosted Specs on our dashboard, and we find this still a very worthy effort.

## Data Processing

We are very fortunate that W3C is quite motivated itself to help make this happen.  Our W3C connection dealt with working with the various APIs and assembling the W3C-specific data into JSON formats to our own specifications.  The source data is hosted at [https://github.com/plehegar/cs171-data](https://github.com/plehegar/cs171-data) and is composed of these files:

[https://github.com/plehegar/cs171-data/blob/master/groups.json](https://github.com/plehegar/cs171-data/blob/master/groups.json) - This is the master list of the Working Groups, with sublists of the specs each group works on, each spec’s current status, and each spec’s last publication date.

[https://github.com/plehegar/cs171-data/blob/master/specs.json](https://github.com/plehegar/cs171-data/blob/master/specs.json) - This is the essential data about the various specs hosted in GitHub.  It provides, per spec, information about the commits, pull requests, and issues related to that spec.  We have opening and closing dates, names of those who opened and closed the item, and the number of lines of code affected (when applicable).

[https://github.com/plehegar/cs171-data/blob/master/tests.json](https://github.com/plehegar/cs171-data/blob/master/tests.json) - This is the supplementary list of all pull requests and issues for the test suite, categorized by spec.  For these, we have the author, the state, the date created, how many lines were added, how many lines were deleted, and many more fields. However, due to the more complicated structure of the test suite, and GitHub's limitation on API requests, we do not have commit data for the test suite.

[https://github.com/plehegar/cs171-data/blob/master/caniuse.json](https://github.com/plehegar/cs171-data/blob/master/caniuse.json) - the mapping of CanIUse statuses to various elements across W3C Specs, judging implementation by latest browser versions only.  Each browser’s record provides its expected platform (desktop, mobile) and rates the known implementation on a scale of 4 (“yes”, “partial”, “no”, “unknown”).  The element overall also has a name, description, a link to the caniuse page, and a reference to the W3C spec within its record in addition to the browser results for that element’s implementation.

## Data Derivation

The first items of derived data we created were simple sums.  How many issues total were there per spec?  How many pull requests?  How many lines of code did each pull request or commit affect?

While composing these various sums, we also created a scoring system for issues opened and closed - for some graphs, we did not want to represent only a simple sum of issues opened and closed, but a weighted sum based on perceived difficulty.

Next, we created was a "CanIUse" score for each spec.  For our first pass, we simply calculated an average implementation rate across all browsers for any given element, and then averaged the relevant elements' averages for every given spec.  This provided our first "CanIUse" score, which was fixed.


## Data Complications

As we worked with the data, we found some missing pieces of information.  While some of these were corrected, others were either discovered too late (after GitHub shut off our API requests) or too complicated to correct.

* **spec commits missing number of lines added and deleted** - fixed
* **spec issues missing date closed** - fixed
* **spec closed issues missing closed by name** - fixed
* **spec issues missing difficulty level** - actually, spec issues are not assigned a difficulty level.  Decided to treat them all as "easy" in that case.
* **test data missing commit info** - outstanding - too many different API requests needed to generate to obtain this information (ie, too complicated even if GitHub was still allowing access).  As a result, we decided to drop commits altogether, rather than displaying half of them, although we hoped to revisit this decision before the end of the project.
* **missing "closed by" name when pull requests closed without being merged** - outstanding - too late to download additional field of information.  As a result, we include all we can, but we are careful to filter out "unknown" and "undefined" from our graph of the top contributors.
* **duplicate name information** - people may be listed by their full name (in the case of commits) or by their login name (in the case of pull requests).  Resolution of this data problem was a byproduct of our decision to drop commits given the incomplete nature of the commits data.  If we do add back commits, we would have to live with this fragmentation in the short-term - it would require perhaps an additional hash lookup or somesuch truly to resolve the matter.

## Further Data Exploration

There are many trend variables it might be interesting to derive and incorporate into our Working Group-specific and Spec-specific views:

* Average days required to close issues and/or to merge pull requests would be an interesting metric of a group's efficiency and backlog.
* Percentage change of contributions would also be a good flag as to which specs may be losing momentum or which people are beginning to step up.
* The CanIUse data could be recalculated in more interesting ways as well depending on user choice, such as calculating implementation rate for mobile-only or desktop-only browsers, and not just all of them together.

However, we are tabling these in favor of first implementing the basics in a robust manner.

