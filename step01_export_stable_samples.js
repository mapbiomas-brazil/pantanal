var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[-57.50608776700294, -22.551221464368673],
          [-54.89134167325294, -20.63083251504771],
          [-53.70481823575294, -15.536366648358765],
          [-59.52757214200294, -14.730369144110306],
          [-58.34104870450294, -22.409100529486615]]]);

var year = 2017
var assetMosaics = 'projects/mapbiomas-workspace/MOSAICOS/workspace-c3';
var assetBiomes = 'projects/mapbiomas-workspace/AUXILIAR/biomas-raster';
var dirout = 'projects/mapbiomas-workspace/AMOSTRAS/col4/PANTANAL/'
var palettes = require('users/mapbiomas/modules:Palettes.js');
var biomes = ee.Image(assetBiomes);

var vis = {
    'bands': ['reference'],
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};


var colecao41 = ee.Image('projects/mapbiomas-workspace/public/collection4_1/mapbiomas_collection41_integration_v1');

var vis = {
    'bands': ['classification_' + String(year)],
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};

var colList = ee.List([])
var col41remap = colecao41.select('classification_1985').remap(
                  [3, 4, 11,12,15,33],
                  [3, 4, 11,12,21,33])

colList = colList.add(col41remap.int8())

var anos = ['1986','1987','1988','1989','1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017', '2018'];
for (var i_ano=0;i_ano<anos.length; i_ano++){
  var ano = anos[i_ano];

  var col4flor = colecao41.select('classification_'+ano).remap(
                  [3, 4, 11,12,15,33],
                  [3, 4, 11,12,21,33])
  colList = colList.add(col4flor.int8())
};


var collection = ee.ImageCollection(colList)

var unique = function(arr) {
    var u = {},
        a = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
};

/**
 * REFERENCE MAP
 */


var getFrenquencyMask = function(collection, classId) {

    var classIdInt = parseInt(classId, 10);

    var maskCollection = collection.map(function(image) {
        return image.eq(classIdInt);
    });

    var frequency = maskCollection.reduce(ee.Reducer.sum());

    var frequencyMask = frequency.gte(classFrequency[classId])
        .multiply(classIdInt)
        .toByte();

    frequencyMask = frequencyMask.mask(frequencyMask.eq(classIdInt));

    return frequencyMask.rename('frequency').set('class_id', classId);
};
///////////////////////////
//FUNCTION: LOOP for each carta

var lista_image = ee.List([]);

var classFrequency = {"3": 34, "4": 34, "11": 34, "12": 34, "21": 34, "33": 34}
  

var frequencyMasks = Object.keys(classFrequency).map(function(classId) {
    return getFrenquencyMask(collection, classId);
});

frequencyMasks = ee.ImageCollection.fromImages(frequencyMasks);

var referenceMap = frequencyMasks.reduce(ee.Reducer.firstNonNull()).clip(geometry);

referenceMap = referenceMap.mask(referenceMap.neq(27)).rename("reference");

var vis = {
    'bands': ['reference'],
    'min': 0,
    'max': 34,
    'palette': palettes.get('classification2')
};


Map.addLayer(referenceMap, vis, 'Classes persistentes 85 a 18', true);

Export.image.toAsset({
    "image": referenceMap.toInt8(),
    "description": 'Pantanal_amostras_estaveis85a18_col41',
    "assetId": dirout + 'Pantanal_amostras_estaveis85a18_col41',
    "scale": 30,
    "pyramidingPolicy": {
        '.default': 'mode'
    },
    "maxPixels": 1e13,
    "region": geometry
});  
