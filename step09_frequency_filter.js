var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-57.50608776700294, -22.551221464368673],
          [-54.89134167325294, -20.63083251504771],
          [-53.70481823575294, -15.536366648358765],
          [-59.52757214200294, -14.730369144110306],
          [-58.34104870450294, -22.409100529486615]]]);

var version_out = '4e'
var bioma = "PANTANAL"

var dirasset = 'projects/mapbiomas-workspace/MOSAICOS/workspace-c3';
var dirsamples = 'projects/mapbiomas-workspace/AMOSTRAS/col4/PANTANAL/samples_MATAATLANTICA_'
var dircol4 = 'projects/mapbiomas-workspace/AMOSTRAS/col4/PANTANAL/class_col4'
var dirout = 'projects/mapbiomas-workspace/AMOSTRAS/col4/PANTANAL/class_col4_bioma/'
var regioesCollection = ee.FeatureCollection('projects/mapbiomas-workspace/AUXILIAR/Pantanal_regions_col4_area2000')//.filterBounds(geometry)
var palettes = require('users/mapbiomas/modules:Palettes.js');

var bioma = "PANTANAL"
var mapbioDir = 'projects/mapbiomas-workspace/COLECAO3_1/classificacao-ft-dev';
var Dirout = 'projects/mapbiomas-workspace/COLECAO5/classificacao-test/';
var conta = 1


var class4 = ee.Image('projects/mapbiomas-workspace/COLECAO5/classificacao-test/PANT-RF85a19v3h')
var palettes = require('users/mapbiomas/modules:Palettes.js');
var pal = palettes.get('classification2');
var vis = {
      bands: 'classification_2017',
      min:0,
      max:34,
      palette: pal,
      format: 'png'
    };

var filtrofreq = function(mapbiomas){
  ////////Calculando frequencias
  //////////////////////
  ////////////////////
  // General rule
  var exp = '100*((b(0)+b(1)+b(2)+b(3)+b(4)+b(5)+b(6)+b(7)+b(8)+b(9)+b(10)+b(11)+b(12)+b(13)+b(14)+b(15)' +
      '+b(16)+b(17)+b(18)+b(19)+b(20)+b(21)+b(22)+b(23)+b(24)+b(25)+b(26)+b(27)+b(28)+b(29)+b(30)+b(31)+b(32)+b(33)+b(34))/35 )';
  
  // get frequency
  var floFreq = mapbiomas.eq(3).expression(exp);
  var savFreq = mapbiomas.eq(4).expression(exp);
  var graFreq = mapbiomas.eq(12).expression(exp);
  var aguFreq = mapbiomas.eq(33).expression(exp);
  //var agro = mapbiomas.eq(21).expression(exp);

  //////Máscara de vegetacao nativa e agua (freq >95%)
  var vegMask = ee.Image(0).where((floFreq.add(savFreq).add(graFreq).add(aguFreq)).gt(99), 1)
  
  //var NaovegMask = ee.Image(0)
  //                         .where(agro.gt(95), 21)
  /////Mapa base: 
  var  vegMap = ee.Image(0)
                          .where(vegMask.eq(1).and(savFreq.gt(70)), 4)
                          .where(vegMask.eq(1).and(floFreq.gt(70)), 3)
                          .where(vegMask.eq(1).and(graFreq.gt(70)), 12)
                          .where(vegMask.eq(1).and(aguFreq.gt(40)), 33)

  vegMap = vegMap.updateMask(vegMap.neq(0))//.clip(BiomaPA)
  //NaovegMask = NaovegMask.updateMask(NaovegMask.neq(0))//.clip(BiomaPA)
  //Map.addLayer(vegMap, vis, 'vegetacao estavel', true);
  //Map.addLayer(NaovegMask, vis, 'Não vegetacao estavel', true);


  var saida = mapbiomas.where(vegMap, vegMap)
  //saida = saida.where(NaovegMask, NaovegMask)
  
  return saida;
}


  
  var saida = filtrofreq(class4)

print(class4)
print(saida)

Map.addLayer(class4, vis, 'image');

Map.addLayer(saida, vis, 'filtered');


Export.image.toAsset({
    'image': saida,
    'description': 'PANT-RF85a19v3j_rev',
    'assetId': dirout+'PANT-RF85a19v3j_rev',
    'pyramidingPolicy': {
        '.default': 'mode'
    },
    'region': geometry,
    'scale': 30,
    'maxPixels': 1e13
});
