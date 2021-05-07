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
We have information about the lyrics, artists, titles, tags, genres, sentiments, complexity of the text and repetition of the lyrics. In order to answer our problematic we will need to detect color words in the lyrics and find an appropriate context for each color to present in the vizualization (eg. "the blue sky" instead of just "blue").

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


## Milestone 3 (4th June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

