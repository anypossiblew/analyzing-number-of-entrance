var fs = require('fs');
var csv = require('csv');
var turf = require('turf');

fs.readFile('./number-of-entrance.csv', 'utf8', function (err, data) {
    if (err) {
        throw err;
    }
    csv.parse(data, {columns: true}, function(err, items){
        if (err) {
            throw err;
        }
        fs.readFile('china.geojson', 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            var china = JSON.parse(data);
            // 计算面积
            for(var i = 0; i < china.features.length; i++) {
                china.features[i].properties.area = (Math.round(turf.area(china.features[i].geometry) * 0.000621371)) / 100000;
            }
            // 计算密度
            items.map(function(item) {
                for(var i = 0; i < china.features.length; i++) {
                    if(china.features[i].properties.name == item['省'] ) {
                        china.features[i].properties.register_number = item['人数']*10000;
                        china.features[i].properties.register_density =
                            (china.features[i].properties.register_number)
                            / china.features[i].properties.area;
                    }
                }
            });

            // 计算样式style
            var min = 0, max = 0;
            for(var i = 0; i < china.features.length; i++) {
                var registerDensity = china.features[i].properties.register_density;
                if(registerDensity > max) {
                    max = registerDensity;
                }
                if(min == 0 || min > registerDensity) {
                    min = registerDensity;
                }
            }

            for(var i = 0; i < china.features.length; i++) {
                var opacity = Math.floor((china.features[i].properties.register_density - min) / (max - min) * 10 + 1) / 10;
                china.features[i].properties.style = {
                    fillOpacity: opacity
                };
            }

            fs.writeFileSync('number-of-china-entrance.geojson', JSON.stringify(china));
        });
    });

});