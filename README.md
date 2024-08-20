<<div class="fluid-row" id="header">
    <img src='./misc/arcplan-logo.jpeg' height='70' width='auto' align='right'>
    <h1 class="title toc-ignore">Pantanal</h1>
    <h4 class="author"><em>Developed by  ArcPlan team - mariana@arcplan.com.br</em></h4>
</div>

# About
This folder contains the scripts to classify and post-process the Pantanal Biome.

We recommend that you read the Pantanal Biome Appendix of the Algorithm Theoretical Basis Document (ATBD).

[Link ATBD](https://mapbiomas-br-site.s3.amazonaws.com/Metodologia/Pantanal_Appendix_-_ATBD_Col7_v7_v1.pdf)

# How to use
First, you need to copy these scripts to your Google Earth Engine (GEE) account.

# 01 Annual Land Use Land Cover classification

### Pre-processing:

Step01: build stable pixels from Collecitons 6, 7.1 and 8 and save a new asset

Step02: exports stable samples filtered by GEDI data

Step03: training and exporting stable samples for each year

### Classification:

Step04a: classify and export classification for each region

Step04b: blend regions classification

### Post-processing:

Step05: Gap Fill filter to remove 'non observed data'

# 02 Monthly Water and Wetland classification

### Pre-processing:

Step01: monthly sampling of Pantanal flooding

Step02: monthly samples training

### Classification:

Step03: monthly 'water' and 'wetland' classification using random forest classifier and NDDI Index

### Post-processing:

Step04: fill the pixels without Landsat image with the soon driest month pixel

Step05: creates and exports annual frequency data based on monthly data

# 03 Post-classification

Step01: apply temporal and trajectory filters

Step02: apply deforestation and grasslands masks

Step03: final adjustments before map integration
