var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-57.50608776700294, -22.551221464368673],
          [-54.89134167325294, -20.63083251504771],
          [-53.70481823575294, -15.536366648358765],
          [-59.52757214200294, -14.730369144110306],
          [-58.34104870450294, -22.409100529486615]]]);

var bioma = "PANTANAL"

var vesion_in = 'v3g2'
var version_out = 'i3_rev'
var min_connect_pixel = 6
var prefixo_out = 'PANT-RF85a19'
var dirout = 'projects/mapbiomas-workspace/COLECAO5/classificacao-test/'
ee.Image('projects/mapbiomas-workspace/COLECAO5/classificacao-test/PANT-RF85a19v3g2')

////*************************************************************
// Do not Change from these lines
////*************************************************************


var palettes = require('users/mapbiomas/modules:Palettes.js');

var class4GAP = ee.Image('projects/mapbiomas-workspace/COLECAO5/classificacao-test/PANT-RF85a19v3h3_rev')
var palettes = require('users/mapbiomas/modules:Palettes.js');
var pal = palettes.get('classification2');
var vis = {
      bands: 'classification_1985',
      min:0,
      max:34,
      palette: pal,
      format: 'png'
    };
var vis2 = {
      min:0,
      max:34,
      palette: pal,
      format: 'png'
    };
Map.addLayer(class4GAP, vis, 'class4GAP');


var anos = ['1985','1986','1987','1988','1989','1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019'];
for (var i_ano=0;i_ano<anos.length; i_ano++){  
  var ano = anos[i_ano]; 
  var moda = class4GAP.select('classification_'+ano).focal_mode(2, 'square', 'pixels')
  moda = moda.mask(class4GAP.select('classification_'+ano+'_conn').lte(min_connect_pixel))
  var class_out = class4GAP.select('classification_'+ano).blend(moda)
  if (i_ano == 0){ var class_outTotal = class_out }  
  else {class_outTotal = class_outTotal.addBands(class_out); }

}
print(class_outTotal)
Map.addLayer(class_outTotal, vis, 'class_outTotal');

Export.image.toAsset({
    'image': class_outTotal,
    'description': prefixo_out+version_out,
    'assetId': dirout+prefixo_out+version_out,
    'pyramidingPolicy': {
        '.default': 'mode'
    },
    'region': geometry,
    'scale': 30,
    'maxPixels': 1e13
});
