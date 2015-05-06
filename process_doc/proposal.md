# Section 5 - Our Proposed Feature Set

* *return to [Section 4, The Design Process](design.md)*
* *proceed to [Section 6, Discoveries](discoveries.md)*

## Proposal

As we imagined our Visualization, these are the goals that we set ourselves:

### Must-Have Features

At a minimum, we wanted to present the same information that is currently presented at [www.testthewebforward.org/dashboard](www.testthewebforward.org/dashboard), but including Specification information and a sense of the CanIUse data as well as the Test Suite information which is already there.

Also, we wanted to provide easier navigation between views of the different levels (work done overall, by working group, and by spec within working group).  At the current website, there is just a very long, esoteric and jumbled pull-down menu to switch between different specs and groups.

### Optional Features

We very much wanted to provide a lot of interaction, so that the navigation between views is a matter of clicking and zooming, all the way to specific GitHub issues or CanIUse pages if desired, even while we provide a sleek overview of the current amount of work to be done.

We also aimed to provide a sense of overall timelines about which issues have been outstanding for how long, or how long it has been since a spec’s last published date as compared to its last GitHub update, etc.

Also, we hoped to offer a view about “who” is doing what over time, given that this data is also available and interesting.

## Reality

Of the Must-Have Features, we successfully implemented all of them.  We implemented:

- All hoped-for data:  the test suite work, plus specification work, plus a sense of the CanIUse status of a spec.
- Improved navigation.  Rather than scroll through a very long dropdown list, guessing at what is a spec and what is a working group, the user can click on a section of our sunburst graph while viewing a more informative name for what they are choosing.

Of the Optional Features, we successfully implemented all of them:

- all of our views of the data interact with each other via straightforward clicking and brushing
- our tooltips on the outer ring of the sunburst allow the user to visit the relevant GitHub page for any specific piece of work
- our dual timelines allow the user to see the oldest "last published" specs at the same time as viewing the details of the last two weeks.  It is indeed possible to see what work has been done on a spec since its last published date.
- and our "who" graph allows us to see who is doing what, and, in conjunction with our timeline brushing, to watch the evolution of the rankings over time.


In addition to the items we had first imagined, we also managed to:

- come very close to providing "pointing" capability by reading from the URL as we load our initial data, and updating the URL as we apply filters.  However, it is uncertain whether this feature will appear in our delivered version, as it and the sunburst view currently do not seem to work well together.

