var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-57.50608776700294, -22.551221464368673],
          [-54.89134167325294, -20.63083251504771],
          [-53.70481823575294, -15.536366648358765],
          [-59.52757214200294, -14.730369144110306],
          [-58.34104870450294, -22.409100529486615]]]);

var version_out = 3
var RFtrees = 100
var classe = 'sav'

var limit_umd = 3000

var bioma = "PANTANAL"

var dirasset = 'projects/mapbiomas-workspace/MOSAICOS/workspace-c3';
var dirsamples = 'projects/mapbiomas-workspace/AMOSTRAS/col4/PANTANAL/samples_PANTANAL_'
var dirout = 'projects/mapbiomas-workspace/COLECAO5/classificacao-test/'
var regioesCollection = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/Pantanal_regions_col5_area2000')//.filterBounds(geometry)
var palettes = require('users/mapbiomas/modules:Palettes.js');

var amostras_complementares = ee.FeatureCollection('projects/mapbiomas-workspace/AMOSTRAS/col4/PANTANAL/Pantanal_amostras_complementares_col4')

var anos = ['1985','1986','1987','1988','1989','1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019'];

var Bioma_geral = ee.FeatureCollection("projects/mapbiomas-workspace/AUXILIAR/biomas_IBGE_250mil")
var Bioma_Pant = Bioma_geral.filterMetadata("Bioma",'equals','Pantanal')


var options = {
  'classes': [3, 4, 11, 12, 21, 33],
  'classNames': ['forest', 'savana','umida', 'campo', 'agro', 'agua']
};

var vis = {
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};

var terrain = ee.Image("JAXA/ALOS/AW3D30_V1_1").select("AVE");
var slope = ee.Terrain.slope(terrain)
var square = ee.Kernel.square({radius: 5});

var bandNames = ee.List([
  'slope',
  'textG',
  "median_blue",
  "median_evi2",
  "median_green",
  "median_red",
  "median_nir",
  "median_swir1",
  "median_swir1_wet",
  "median_swir1_dry",
  "median_swir2",
  'median_gcvi_wet',
  'median_gcvi',
  'median_gcvi_dry',
  'median_hallcover',
  "median_gv",
  "median_gvs",
  "median_npv",
  "median_soil",
  "median_shade",
  "median_ndfi",
  "median_ndfi_dry",
  "median_ndfi_wet",
  "median_ndvi",
  "median_ndvi_dry",
  "median_ndvi_wet",
  "median_ndwi",
  "median_ndwi_dry",
  "median_ndwi_wet",
  "median_savi",
  "median_sefi",
  "stdDev_ndfi",
  "stdDev_fns",
  "stdDev_soil",
  "stdDev_gvs",
  'min_nir',
  'amp_soil',
  'amp_ndfi'
  ]);
  
var bandNamesCurto = ee.List([
  'slope',
  'textG',
  "m_blue",
  "m_evi2",
  "m_green",
  "m_red",
  "m_nir",
  "m_swir1",
  "m_swir1_wet",
  "m_swir1_dry",
  "m_swir2",
  'm_gcvi_wet',
  'm_gcvi',
  'm_gcvi_dry',
  'm_hallcover',
  "m_gv",
  "m_gvs",
  "m_npv",
  "m_soil",
  "m_shade",
  "m_ndfi",
  "m_ndfi_dry",
  "m_ndfi_wet",
  "m_ndvi",
  "m_ndvi_dry",
  "m_ndvi_wet",
  "m_ndwi",
  "m_ndwi_dry",
  "m_ndwi_wet",
  "m_savi",
  "m_sefi",
  "sD_ndfi",
  "sD_fns",
  "sD_soil",
  "sD_gvs",
  'min_nir',
  'amp_soil',
  'amp_ndfi'
  ]);
var shuffle = function (collection, seed) {
    // Adds a column of deterministic pseudorandom numbers to a collection.
    // The range 0 (inclusive) to 1000000000 (exclusive).
    collection = collection.randomColumn('random', seed || 1)
        .sort('random', true)
        .map(
            function (feature) {
                var rescaled = ee.Number(feature.get('random'))
                    .multiply(1000000000)
                    .round();
                return feature.set('new_id', rescaled);
            }
        );

    // list of random ids
    var randomIdList = ee.List(
        collection.reduceColumns(ee.Reducer.toList(), ['new_id'])
        .get('list'));

    // list of sequential ids
    var sequentialIdList = ee.List.sequence(1, collection.size());

    // set new ids
    var shuffled = collection.remap(randomIdList, sequentialIdList, 'new_id');

    return shuffled;
};

var visParMedian = {'bands':['m_swir1','m_nir','m_red'], 'gain':[0.08, 0.06,0.2],'gamma':0.5 };
var visParMedian2 = {'bands':['swir1_median','nir_median','red_median'], 'gain':[0.08, 0.06,0.2],'gamma':0.5 };



var limite = geometry;

var estaves = ee.Image('projects/mapbiomas-workspace/AMOSTRAS/col4/PANTANAL/Pantanal_amostras_estaveis85a17a_col4b')
Map.addLayer(estaves, vis, 'Amostras Estaveis', true);

for (var i_ano=0;i_ano<anos.length; i_ano++){
  var ano = anos[i_ano];

if (ano == '2019'){
    var colecao41 = ee.Image('projects/mapbiomas-workspace/public/collection4_1/mapbiomas_collection41_integration_v1').select('classification_2018').clip(limite);
    colecao41 = colecao41.select('classification_2018').remap(
                    [3, 4, 5,11,12,13,14,15,18,19,20,21,22,23,24,25,26,29,30,31,32,33],
                    [3, 4, 3,11,12,13,21,21,21,21,21,21,22,23,22,22,33,29,30,31,32,33])
} else {
    var colecao41 = ee.Image('projects/mapbiomas-workspace/public/collection4_1/mapbiomas_collection41_integration_v1').select('classification_'+ano).clip(limite);
    colecao41 = colecao41.select('classification_'+ano).remap(
                    [3, 4, 5,11,12,13,14,15,18,19,20,21,22,23,24,25,26,29,30,31,32,33],
                    [3, 4, 3,11,12,13,21,21,21,21,21,21,22,23,22,22,33,29,30,31,32,33])
}

    var mosaico85 = ee.ImageCollection(dirasset)
                      .filterMetadata('biome', 'equals', bioma)
                      .filterMetadata('year', 'equals', 1985)
                      .filterBounds(limite)
    var mosaico86 = ee.ImageCollection(dirasset)
                      .filterMetadata('biome', 'equals', bioma)
                      .filterMetadata('year', 'equals', 1986)
                      .filterBounds(limite)

  var mosaicoTotal = ee.ImageCollection(dirasset)
                    .filterMetadata('biome', 'equals', bioma)
                    .filterMetadata('year', 'equals',parseInt(ano))
                    .filterBounds(limite)
                    .mosaic()

if (ano == '2019'){
  var BDamostras = ee.FeatureCollection(dirsamples+'2018_v11').filterBounds(limite)
} else {
  var BDamostras = ee.FeatureCollection(dirsamples+ano+'_v11').filterBounds(limite)
}

  mosaicoTotal = mosaicoTotal
  mosaicoTotal = mosaicoTotal.addBands(slope.int8().clip(limite))
  var entropyG = mosaicoTotal.select('median_green').entropy(square);
  mosaicoTotal = mosaicoTotal.addBands(entropyG.select([0],['textG']).multiply(100).int16())
  mosaicoTotal = mosaicoTotal.select(bandNames,bandNamesCurto)

  // Map.addLayer(mosaicoTotal, visParMedian, 'Img_Year_'+ano, false);
  var BDflo = BDamostras.filterMetadata("reference", "equals", 3).map(function(feat) {return feat.set({'reference': 0})});
  var BDsav = BDamostras.filterMetadata("reference", "equals", 4).map(function(feat) {return feat.set({'reference': 0})});
  var BDumida = BDamostras.filterMetadata("reference", "equals", 11).map(function(feat) {return feat.set({'reference': 1})});
  var BDcampo = BDamostras.filterMetadata("reference", "equals", 12).map(function(feat) {return feat.set({'reference': 0})});
  var BDagro = BDamostras.filterMetadata("reference", "equals", 21).map(function(feat) {return feat.set({'reference': 0})});
  var BDagua = BDamostras.filterMetadata("reference", "equals", 33).map(function(feat) {return feat.set({'reference': 0})});

  BDflo = shuffle(BDflo, 2).limit(300)
  BDsav = shuffle(BDsav, 2).limit(300)
  // BDumida = shuffle(BDumida, 2).limit(300)
  BDcampo = shuffle(BDcampo, 2).limit(300)
  BDagro = shuffle(BDagro, 2).limit(300)
  BDagua = shuffle(BDagua, 2).limit(300)

  var training = BDflo.merge(BDumida).merge(BDcampo).merge(BDagua).merge(BDagro).merge(BDsav)

       
  var classifier = ee.Classifier.smileRandomForest({numberOfTrees: RFtrees, variablesPerSplit:1})
  
  classifier = classifier.setOutputMode('PROBABILITY')
  classifier = classifier.train(training, 'reference', bandNamesCurto);

  var classified = mosaicoTotal.classify(classifier).mask(mosaicoTotal.select('m_blue'));
  classified = classified.select(['classification'],['classification_'+ano]).clip(limite)//.toInt8()
  Map.addLayer(classified, vis, 'RF'+ano, false);

  if (i_ano == 0){ var classified85a18 = classified }  
  else {classified85a18 = classified85a18.addBands(classified); }
  
}

print(classified85a18)

Export.image.toAsset({
  "image": classified85a18,
  "description": 'PANT_'+classe+'-'+'RF85a19_v'+version_out+'_col3',
  "assetId": dirout + 'PANT_'+classe+'-'+'RF85a19_v'+version_out+'_col3',
  "scale": 30,
  "pyramidingPolicy": {
      '.default': 'mode'
  },
  "maxPixels": 1e13,
  "region": limite
});    

