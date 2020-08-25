////////////////////////////////////////////////////////
//////////////User parameters//////////////////////////
var anos =     [
  '1985','1986','1987',
  '1988','1989','1990',
  '1991','1992','1993',
  '1994','1995','1996',
  '1997','1998','1999',
  '2000','2001','2002',
  '2003','2004','2005',
  '2006','2007','2008',
  '2009','2010','2011',
  '2012','2013','2014',
  '2015','2016',
  '2017','2018','2019'
];

var options = {
  'classes': [3, 4, 11, 12, 21, 33],
  'classNames': ['forest', 'savana','umido', 'campo', 'pasto','agua']
};

var bioma = "PANTANAL";
var versao = '12_mos5'
var sampleSize = 2000;
var nSamplesMin = 600

//var regioes = ['reg_19']

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


//Kernel used to compute entropy  
var square = ee.Kernel.square({radius: 5}); 
  
var terrain = ee.Image("JAXA/ALOS/AW3D30_V1_1").select("AVE");
var dirasset = 'projects/mapbiomas-workspace/MOSAICOS/workspace-c5';
var dirsamples2 = 'projects/mapbiomas-workspace/AMOSTRAS/col4/PANTANAL/Pantanal_amostras_estaveis85a18_col41';
var dirout = 'projects/mapbiomas-workspace/AMOSTRAS/col5/PANTANAL';
var regioesCollection = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/Pantanal_regions_col5_area2000')//.filterBounds(geometry)
Map.addLayer(regioesCollection)
print(regioesCollection)
var slope = ee.Terrain.slope(terrain)

var palettes = require('users/mapbiomas/modules:Palettes.js');

var vis = {
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};
Map.addLayer(ee.Image(dirsamples2), vis, 'Classes persistentes 85 a 17 - Col 4', true);




var amostras_complementares = ee.FeatureCollection('projects/mapbiomas-workspace/AMOSTRAS/col4/PANTANAL/Pantanal_amostras_complementares_col4')


var estaveis1 = ee.Image(dirsamples2)
var amostraTotal = amostras_complementares
var amostraTotalimg = amostraTotal.reduceToImage({properties: ['reference'],reducer: ee.Reducer.first()})
amostraTotalimg = amostraTotalimg.select([0],['reference'])

var estaveis2 = estaveis1.blend(amostraTotalimg)


Map.addLayer(estaveis2, vis, 'Amostras Estaveis2', true);


////////////////////////////////////////////////////////
var getTrainingSamples = function (feature) {
  
  var regiao = feature.get('reg_id');
  var floresta = ee.Number(feature.get('floresta'));
  var savana = ee.Number(feature.get('savana'));
  var campo = ee.Number(feature.get('campo'));
  var umido = ee.Number(feature.get('umido'));
  var agro = ee.Number(feature.get('agro'));
  var agua = ee.Number(feature.get('agua'));
  
  var total = floresta.add(savana).add(campo).add(umido).add(agro).add(agua)

  var sampleFloSize = ee.Number(floresta).divide(total).multiply(sampleSize).round().int16().max(nSamplesMin)
  var sampleSavSize = ee.Number(savana).divide(total).multiply(sampleSize).round().int16().max(nSamplesMin)
  var sampleCamSize = ee.Number(campo).divide(total).multiply(sampleSize).round().int16().max(nSamplesMin)
  var sampleUmiSize = ee.Number(umido).divide(total).multiply(sampleSize).round().int16().max(nSamplesMin)
  var sampleAgrSize = ee.Number(agro).divide(total).multiply(sampleSize).round().int16().max(nSamplesMin)
  var sampleAguSize = ee.Number(agua).divide(total).multiply(sampleSize).round().int16().max(nSamplesMin)

  var clippedGrid = ee.Feature(feature).geometry()

  var referenceMap = estaveis2//.clip(clippedGrid);
                      
  var mosaico = ee.ImageCollection(dirasset)
                      .filterMetadata('region', 'equals', bioma)
                      .filterMetadata('year', 'equals', ano)
//                      .filterBounds(clippedGrid)
                      .mosaic()

    var slopeclip = slope.clip(clippedGrid)
    mosaico = mosaico.addBands(slopeclip)
    var entropyG = mosaico.select('green_median').entropy(square);
    mosaico = mosaico.addBands(entropyG.select([0],['textG']).multiply(100).int16())
    mosaico = mosaico.select(bandNames,bandNamesCurto)
    mosaico = mosaico.addBands(referenceMap.select([0],['reference']))
//    mosaic = mosaic.addBands(ee.Image.pixelLonLat())
  

  var training = mosaico.stratifiedSample({scale:30, classBand: 'reference', numPoints: 0, region: feature.geometry(), seed: 1, geometries: true,
           classValues: [3,4,12,11,21,33], 
           classPoints: [sampleFloSize,sampleSavSize,sampleCamSize,sampleUmiSize,sampleAgrSize,sampleAguSize]
  });

      training = training.map(function(feat) {return feat.set({'year': ano})});
      training = training.map(function(feat) {return feat.set({'region': regiao})});
      
    return training;
 };

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//// Get samples for each year and export using for-loop///
for (var Year in anos){
  var year = anos[Year];
  var ano = ee.String(year);
  var mySamples = regioesCollection.map(getTrainingSamples).flatten();

  Export.table.toAsset(mySamples,
  'samples_'+bioma+'_'+year+'_v'+versao,
  dirout+'/samples_'+bioma+'_'+year+'_v'+versao
);
}

