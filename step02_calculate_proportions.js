var Bioma_geral = ee.FeatureCollection("projects/mapbiomas-workspace/AUXILIAR/biomas_IBGE_250mil")
Map.addLayer(Bioma_geral);

var regioes = ['reg_01','reg_02','reg_03','reg_04','reg_05','reg_06']

var version = '1'
var bioma = "PANTANAL"

var dirasset = 'projects/mapbiomas-workspace/MOSAICOS/workspace-c3';
var dirsamples = 'projects/mapbiomas-workspace/AMOSTRAS/col4/MATA_ATLANTICA/samples_MATAATLANTICA_'
var dirout = 'projects/mapbiomas-workspace/AMOSTRAS/col4/MATA_ATLANTICA/class_col4/'
var regioesCollection = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/Pantanal_reg_col4')//.filterBounds(geometry)
Map.addLayer(regioesCollection)
var palettes = require('users/mapbiomas/modules:Palettes.js');

var RFtrees = 60

var ano = '2000';

var palettes = require('users/mapbiomas/modules:Palettes.js');
var vis = {
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};

var pixelArea = ee.Image.pixelArea().divide(1000000);

var colecao41 = ee.Image('projects/mapbiomas-workspace/public/collection4_1/mapbiomas_collection41_integration_v1').select('classification_'+ano).clip(regioesCollection);
colecao41 = colecao41.select('classification_'+ano).remap(
                [3, 4, 5,11,12,13,14,15,18,19,20,21,22,23,24,25,26,29,30,31,32,33],
                [3, 4, 3,11,12,13,21,21,21,21,21,21,22,23,22,22,33,29,30,31,32,33])
                
Map.addLayer(colecao41, vis, 'col41'+ano, false);


  var area03 = pixelArea.mask(colecao41.eq(3))
  var area04 = pixelArea.mask(colecao41.eq(4))
  var area12 = pixelArea.mask(colecao41.eq(12))
  var area11 = pixelArea.mask(colecao41.eq(11))
  var area21 = pixelArea.mask(colecao41.eq(21))
  var area33 = pixelArea.mask(colecao41.eq(33))

var processaReg = function(regiao) {
  regiao = regiao.set('floresta', ee.Number(area03.reduceRegion({reducer: ee.Reducer.sum(),geometry: regiao.geometry(), scale: 30,maxPixels: 1e13}).get('area')))
  regiao = regiao.set('savana', ee.Number(area04.reduceRegion({reducer: ee.Reducer.sum(),geometry: regiao.geometry(), scale: 30,maxPixels: 1e13}).get('area')))
  regiao = regiao.set('campo', ee.Number(area12.reduceRegion({reducer: ee.Reducer.sum(),geometry: regiao.geometry(), scale: 30,maxPixels: 1e13}).get('area')))
  regiao = regiao.set('umido', ee.Number(area11.reduceRegion({reducer: ee.Reducer.sum(),geometry: regiao.geometry(), scale: 30,maxPixels: 1e13}).get('area')))
  regiao = regiao.set('agro', ee.Number(area21.reduceRegion({reducer: ee.Reducer.sum(),geometry: regiao.geometry(), scale: 30,maxPixels: 1e13}).get('area')))
  regiao = regiao.set('agua', ee.Number(area33.reduceRegion({reducer: ee.Reducer.sum(),geometry: regiao.geometry(), scale: 30,maxPixels: 1e13}).get('area')))
  return regiao
}

var regiao2 = regioesCollection.map(processaReg)
print(regiao2)

Export.table.toAsset(regiao2, 'Pantanal_regions_col5_area2000', 'projects/mapbiomas-workspace/AUXILIAR/Pantanal_regions_col5_area2000')
