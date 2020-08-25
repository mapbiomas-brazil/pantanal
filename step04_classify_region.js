
var regiao = 'reg_01'
var version_out = 1
var RFtrees = 60

var limit_umd = 3000

var bioma = "PANTANAL"

var dirasset = 'projects/mapbiomas-workspace/MOSAICOS/workspace-c5';
var dirsamples = 'projects/mapbiomas-workspace/AMOSTRAS/col5/PANTANAL/samples_PANTANAL_'
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
  "blue_median",
  "evi2_median",
  "green_median",
  "red_median",
  "nir_median",
  "swir1_median",
  "swir1_median_wet",
  "swir1_median_dry",
  "swir2_median",
  'gcvi_median_wet',
  'gcvi_median',
  'gcvi_median_dry',
  'hallcover_median',
  "gv_median",
  "gvs_median",
  "npv_median",
  "soil_median",
  "shade_median",
  "ndfi_median",
  "ndfi_median_dry",
  "ndfi_median_wet",
  "ndvi_median",
  "ndvi_median_dry",
  "ndvi_median_wet",
  "ndwi_median",
  "ndwi_median_dry",
  "ndwi_median_wet",
  "savi_median",
  "sefi_median",
  "ndfi_stdDev",
  "fns_stdDev",
  "soil_stdDev",
  "gvs_stdDev",
  'nir_min',
  'soil_amp',
  'ndfi_amp'
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


var visParMedian = {'bands':['m_swir1','m_nir','m_red'], 'gain':[0.08, 0.06,0.2],'gamma':0.5 };
var visParMedian2 = {'bands':['swir1_median','nir_median','red_median'], 'gain':[0.08, 0.06,0.2],'gamma':0.5 };

var limite = regioesCollection.filterMetadata('reg_id', "equals", regiao);
limite = limite.map(function(feat) {return feat.buffer(2500)});
var blank = ee.Image(0).mask(0);
var outline = blank.paint(limite, 'AA0000', 2); 
var visPar = {'palette':'000000','opacity': 0.6};
Map.addLayer(outline, visPar, regiao, false);


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
                    .filterMetadata('region', 'equals', bioma)
                    .filterMetadata('year', 'equals', '1985')
                    .filterBounds(limite)
  var mosaico86 = ee.ImageCollection(dirasset)
                    .filterMetadata('region', 'equals', bioma)
                    .filterMetadata('year', 'equals', '1986')
                    .filterBounds(limite)

  var mosaicoTotal = ee.ImageCollection(dirasset)
                    .filterMetadata('region', 'equals', bioma)
                    .filterMetadata('year', 'equals',ano)
                    .filterBounds(limite)
                    .mosaic()

  if (ano == '2019'){
    var BDamostras = ee.FeatureCollection(dirsamples+'2018_v12_mos5').filterBounds(limite)
  } else {
    var BDamostras = ee.FeatureCollection(dirsamples+ano+'_v12_mos5').filterBounds(limite)
  }

  mosaicoTotal = mosaicoTotal//.clip(limite)
  mosaicoTotal = mosaicoTotal.addBands(slope.int8().clip(limite))
  var entropyG = mosaicoTotal.select('green_median').entropy(square);
  mosaicoTotal = mosaicoTotal.addBands(entropyG.select([0],['textG']).multiply(100).int16())
  mosaicoTotal = mosaicoTotal.select(bandNames,bandNamesCurto)

  var BDflo = BDamostras.filterMetadata("reference", "equals", 3)
  var BDsav = BDamostras.filterMetadata("reference", "equals", 4)
  var BDumida = BDamostras.filterMetadata("reference", "equals", 11)
  var BDcampo = BDamostras.filterMetadata("reference", "equals", 12)
  var BDagro = BDamostras.filterMetadata("reference", "equals", 21)
  var BDagua = BDamostras.filterMetadata("reference", "equals", 33)

  var training = BDflo.merge(BDumida).merge(BDcampo).merge(BDagua).merge(BDagro).merge(BDsav)

  var classifier = ee.Classifier.randomForest({numberOfTrees: RFtrees, variablesPerSplit:1}).train(training, 'reference', bandNamesCurto);
  var classified = mosaicoTotal.classify(classifier).mask(mosaicoTotal.select('m_blue'));
  classified = classified.select(['classification'],['classification_'+ano]).clip(limite.geometry()).toInt8()
  Map.addLayer(classified, vis, 'RF'+ano+"_"+regiao, true);

  if (i_ano == 0){ var classified85a18 = classified }  
  else {classified85a18 = classified85a18.addBands(classified); }
  
}

Export.image.toAsset({
  "image": classified85a18.toInt8(),
  "description": 'PANT_'+regiao+'-'+'RF85a19_v'+version_out+'_umd'+limit_umd,
  "assetId": dirout + 'PANT_'+regiao+'-'+'RF85a19_v'+version_out+'_umd'+limit_umd,
  "scale": 30,
  "pyramidingPolicy": {
      '.default': 'mode'
  },
  "maxPixels": 1e13,
  "region": limite
});    
