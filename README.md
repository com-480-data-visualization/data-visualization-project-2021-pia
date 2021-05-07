# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Alexander Apostolov | 271798 |
| Valentin Garnier | 258259 |
| Maina Orchampt-Mareschal | 244960 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (23rd April, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

> Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.
>
> Hint: some good pointers for finding quality publicly available datasets ([Google dataset search](https://datasetsearch.research.google.com/), [Kaggle](https://www.kaggle.com/datasets), [OpenSwissData](https://opendata.swiss/en/), [SNAP](https://snap.stanford.edu/data/) and [FiveThirtyEight](https://data.fivethirtyeight.com/)), you could use also the DataSets proposed by the ENAC (see the Announcements section on Zulip).

The dataset we are going to use consists of a [subset](https://github.com/kevinschaich/billboard) of the top 100 songs from 1950 to 2015. It comes from a github repository under the MIT license. The authors of the dataset have encountered some problems while scrapping the lyrics from [lyrics wikia](http://lyrics.wikia.com/wiki/Lyrics_Wiki) hence some entries are missing, especially for songs written before the 70's.      
We have information about the lyrics, artists, titles, tags, genres, sentiments, complexity of the text and repetition of the lyrics. In order to answer our problematic we will need to detect color words in the lyrics and find an appropriate context for each color to present in the visualization (eg. "the blue sky" instead of just "blue").

### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience.

The general topic of our project is to visualize the distribution of colors in the lyrics of popular songs according to time period, genre and artist. We aim at showing what are the most used colors in a nice manner and providing an interactive way for the user to manipulate and explore the colors in the songs of their favorite artist, genre or time period. 
For each song, we want to detect the colors it "contains" and for each song with at least one color, we would put that song in a color wheel with basic displays. The user would be able to see details about the song by clicking on it in the color wheel.
Also, we would try to add a functionality that allows the user to "unravel" the color wheel into a timeline. 
The project targets a wide audience as music is a universal and timeless interest. It would be a great way to visualize the music in an uncommon manner using colors which could be interepreted as sentiments for example. We think that the results could be aesthetically pleasing.

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data

We explored the data and we found that we have data over 66 years. We have 4028 songs and we have more than 15% of the top 100 titles per year for the first years and around 80% for the most recent years (an average of 60% per year across the whole dataset). We have 1308 artists and 966 tags that can be groupped in 15 different genres. 
Regarding the sentiments of the songs, we have on average 7% which are classify as "negative", 16% as "positive" and 77% as "neutral". 
We already tested the waters with two lists of colors: a small one containing 24 basic colors and a exhaustive one containing 229 more extensive colors.
Based on the first one, we have 780 songs containing colors inside lyrics and for the second one, we have 1741. This gives us a lot of information to display already.
After a small analysis it seems that the most frequent colors are blue, black, white, red, gold and green. 

### Related work


> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

We were inspired by a [paper poster](https://www.wearedorothy.com/products/the-colour-of-books-original-open-edition) showing colors of books. 
The autors from the repository that hosts the data tried to visualize how lyrics and associated data of popular songs have evolved since 1950. They made a project that shows how happy or sad a song is in the selected year / genre.
Our approach is original because we are analyzing songs through the prism of colors. 
Also, we are trying to bring a paper poster to life with much more details and functionalities.


## Milestone 2 (7th May, 5pm)

**10% of the final grade**

### Sketch of the visulization
> Include sketches of the visualization you want to make in your final product.

Below you can find a sketch of what we want our visualization to look like and below it there is a screenshot of what we have already achieved:

![sketch](https://github.com/com-480-data-visualization/data-visualization-project-2021-pia/blob/master/Sketch.jpeg?raw=true)

![sketch](https://github.com/com-480-data-visualization/data-visualization-project-2021-pia/blob/master/screenshot.jpg?raw=true)


### Lectures we will need
> List the tools that you will use for each visualization and which (past or future)
lectures you will need.

First we need the lectures between week 1 and 4 to be able to code the relevant things for our project, namely we need for the basic stuffs:
- Html, css, js
- d3 library
- Data with d3

To allow the user to interact with the data (hovers, clicks, filters), we need:
- Interactions with the data from week 5

Since we will be dealing a lot with colors and how to display them, we will need:
- the lecture about the perception of colors of week 6

To preprocess the data we will need:
- knowledge about Pandas and how to handle text (week 9)

Finally, to make sure our visualization is useful, beautiful and appealing to the user, we will use the guidelines stated in the lectures of week 7 (Designing visualizations and Do's and dont's of data visualization).

### Goals of the project
> Break down your goal into independent pieces to implement. Try to design a
core visualization (minimal viable product) that will be required at the end.
Then list extra ideas (more creative or challenging) that will enhance the
visualization but could be dropped without endangering the meaning of the
project.

There are 4 big parts needed to be completed for our projet:
1. Processing the songs and their colors.
2. Drawing the main visualization (the color wheel).
3. Making the filters about the year and genres work.
4. Displaying the information about the selected song.

Each one of these can be separated into subparts.

For the first one **processing the songs and their colors**, we need to:
- Choose which colors we want to detect and detect them in song lyrics.
- For every found color in the lyrics, add a small perturbation in order to make the color wheel more visually pleasing (in order to avoid big chunks with exactly the same color).
- Order the categories of colors, this is not trivial and we have to choose the most appropriate manner for our project and the desired outcome.

For the second point **drawing the main visualization (the color wheel)**, there are the following subparts:
- Draw for each song, a small colored tile on the color wheel whith the appropriate color and position (angle).
- Add a transition when the data is first shown (when the window is loaded).
- Find a way to handle cases when the number of datapoints is not a multiple of the number of songs we want to draw per circle, in order to maintain the overall circular shape.

For the third part **making the filters about the year and genres work**, we need the following:
- Add buttons to select filters for the genres of songs.
- Add an x-axis band to select the time range to display on the wheel.

For the last part **displaying the information about the selected song**:
- When the user clicks on a colored tile, we want to display a panel with detailed information about the song (title, artist, year...).
- We want to show the part of the lyrics where the color was detected, with the color word being highlighted in the right color and the rest of the lyrics being faded gradually away from the colored word.

Finally, regarding **additional features**, we were thinking of the following:
1. Add a Spotify play button to the song information panel to allow the user to listen to the selected music, this requires finding a way of automatic this process as we have roughly a thousand songs.
2. When a user hovers a song for more than a few seconds, we want to display a small popup bubble above the mouse with just the basic information about the song (title, artist, year).
3. We want to highlight songs of the same artist if the user clicks on the artist name in the song info panel.
4. We want to highlight multiple occurances of the same song (the song included more than one color in its lyrics) when the user clicks on one of the song tiles.
5. When filters are selected (genre or year range), instead of just hiding some color tiles, we can make the current wheel disappear and add a new one with just the filterd data.
6. By clicking on a button, we would like to try to make a bar plot with the same colored tiles and the year as an x axis.

### Functional project prototype review.
> You should have an initial website running with the basic skeleton of the
visualization/widgets.

We have already worked on some parts of the project and you can see the results [here](https://com-480-data-visualization.github.io/data-visualization-project-2021-pia/).


## Milestone 3 (4th June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

