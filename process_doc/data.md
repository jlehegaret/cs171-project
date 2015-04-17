# Section 2 - The Data

*return to [Section 1, Background, Motivation and Objectives](background.md)*

*proceed to [Section 3, What W3C Has So Far](existing.md)*

## What's Out There

### The Specs themselves

W3C has over 1000 Specifications that, combined, set the standards for web technologies.  These standards are worked on by a collection of about 50 Working Groups.  Each specification is an HTML document that moves through various stages – from Working Draft to Recommendation.  Much of this HTML code is hosted on GitHub.  For example, the latest HTML Spec is worked on here:  https://github.com/w3c/html.

Every single W3C spec that has a GitHub repository will be included in our dataset.  One example of a spec repository is here:

[https://github.com/w3c/webcomponents](https://github.com/w3c/webcomponents)

Luckily, our friends at the W3C will take care of conglomerating all of the interesting information from each repository into one JSON file for us.  Same as for each spec's test suite, for each spec itself we can see who committed a change when, how many lines of text were affected, and how many pull requests are still outstanding.  And this time, the number of issues is even easier to analyze, as the issues for the spec-specific repository are obviously for that particular spec:

[https://github.com/w3c/webcomponents/issues](https://github.com/w3c/webcomponents/issues)


### JavaScript tests

Many of these specifications also have an associated Test Suite of JavaScript code, also hosted on GitHub.  This Test Suite aims to provide a point-by-point test for every single detail within a given specification – like that, W3C, the browser developers, and other interested parties can analyze the current degree of real-world implementation of that specification.  Basically, it is CanIUse.com to the nth degree.  For example, the tests related to the latest HTML Spec are here:  https://github.com/w3c/web-platform-tests/tree/master/html

Loads of people are pitching in to write tests about each spec.  These tests help the browser vendors judge how well they have implemented each spec.  The tests are housed in GitHub here:

[https://github.com/w3c/web-platform-tests](https://github.com/w3c/web-platform-tests)

Every single folder in that list is a spec!

The exact scope of test coverage per spec, and whether the tests pass or fail on which browsers is currently out of the scope of this project (we will use caniuse.com to proxy that information).  However, thanks to the GitHub API, we can see who is committing how many lines of code for each spec and when.  We can also see how many pull requests are still outstanding.

### Issues with JavaScript tests

At the very top of this repository are issues that people have raised about the test-suite:

[https://github.com/w3c/web-platform-tests/issues](https://github.com/w3c/web-platform-tests/issues)

These have been tagged with information about
- to which spec does the issue pertain (the gray label(s))
- which working group needs to resolve the issue (the blue label that starts with a "wg")
- how hard is the issue to address - this helps testwriters know which are the low-hanging fruit they can easily take care of

Based on these tags and thanks to the GitHub API, we can determine how many open issues a given spec (or working group) has, who raised the issue, who closed the issue, how long it took to address the issue, and do all of that by difficulty level as well.

Just in case you are interested, here is [some very raw GitHub data about testsuite issues](sample_data/wpt-issues.json), but we will get a more tailored JSON.


### CanIUse Data

In addition, www.CanIUse.com reports how well-implemented various particular features within a web technology have been implemented across browsers.  We are able to tie their reporting back to a given W3C spec thanks to their Resources tab for a given feature.  However, sometimes they reference the WHATWG version of the spec instead.

[http://caniuse.com/](http://caniuse.com/) is a great resource for web developers to learn how long ago a spec's feature has been adopted so as to determine whether or not workarounds for older browsers will be necessary or not.

For example, if we look at [SVG fonts](http://caniuse.com/#feat=svg-fonts) and click on the Resources tab at the bottom of the screen, we see **Specification [w3.org]**, which links to the exact section of the appropriate spec detailing that feature.

The CanIUse API will let us access this data so that we can report, per spec, the status of any and all features that CanIUse has cataloged for that spec.


## Collecting the Data

Our data will be obtained via the GitHub API, the CanIUse API, and our friendly connection at the W3C, who will list out for us each Working Group, the Specs that Group works on, and the status of each of those Specs.  Our friendly connection will also remap CanIUse.com WHATWG Spec references to W3C Spec references.

Because we are focusing only on what data is available via GitHub for W3C work, our population of specs is reduced to about 70 specs, which are worked on by fewer than 20 Working Groups.  While this is a significant reduction in scope (for example, CSS is not represented, as the CSS Working Group does not use GitHub), W3C is still very motivated to view the status of even these 70 GitHub-hosted Specs on our dashboard, and we find this still a very worthy effort.

## Data Processing

We are very fortunate that W3C is quite motivated itself to help make this happen.  Our W3C connection dealt with working with the various APIs and assembling the W3C-specific data into JSON formats to our own specifications.  They are hosted here:  https://github.com/plehegar/cs171-data

We currently have:

https://github.com/plehegar/cs171-data/blob/master/caniuse.json - the mapping of CanIUse statuses to various elements across W3C Specs, judging implementation by latest browser versions only.  Each browser’s record provides its expected platform (desktop, mobile) and rates the known implementation on a scale of 4 (“yes”, “partial”, “no”, “unknown”).  The element overall also has a name, description, a link to the caniuse page, and a reference to the W3C spec within its record in addition to the browser results for that element’s implementation.

https://github.com/plehegar/cs171-data/blob/master/groups.json - a list of the Working Groups, with sublists of the specs each group works on, each spec’s current status, and each spec’s last publication date.
https://raw.githubusercontent.com/plehegar/cs171-data/master/tests.json - a list of all pull requests and issues for the test suite, with lots and lots of data about each one:  the author, the state, the date created, how many lines were added, how many lines were deleted, and many more fields.

https://raw.githubusercontent.com/plehegar/cs171-data/master/specs.json - this last is still a work in progess, but will provide the same GitHub information for all specs as we have for the test suite.

Data processing will thus be very straightforward for us, as we will read these JSON files directly into the JavaScript environment via our D3 library’s commands.


## Data Exploration

We expect to derive additional data as well, such as “Number of Days Elapsed” for timelines and a CanIUse “score” to summarize the overall implementation level of a Spec.  We will keep an open mind as we work with the data and will probably add more ideas to this list as we go.
