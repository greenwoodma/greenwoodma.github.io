/**
 * KML Map Loader v1
 * Copyright (c) Mark A. Greenwood, 2008
 * For usage instructions and updates see
 * http://www.dcs.shef.ac.uk/~mark/blog/labels/KMLMapLoader.html
 **/

KMLMapLoader = 
{    
    maps: [],
    
    load: function()
    {
        var divs = document.getElementsByTagName("div");
        
        for (var i = 0 ; i < divs.length ; ++i)
        {
            if (divs[i].getAttribute("kml") != null)
            {                
                var map = new GMap2(divs[i]);
                KMLMapLoader.maps[KMLMapLoader.maps.length] = map;

                var zoom = map.getContainer().getAttribute("zoom");
                var latitude = map.getContainer().getAttribute("latitude");
                var longitude = map.getContainer().getAttribute("longitude");

                if (latitude != null && longitude != null && zoom != null)
                {
                    map.setCenter(new GLatLng(parseFloat(latitude), parseFloat(longitude)), parseInt(zoom));
                }
                else
                {
                    map.setCenter(new GLatLng(53.800651,-4.064941), 5);
                }

                var config = map.getContainer().getAttribute("config");
                if (config != null)
                {
                    eval(config);
                }
                else
                {
                    map.addControl(new GSmallMapControl());
                }

                var mapType = map.getContainer().getAttribute("mapType");
                if (mapType != null)
                {
                    eval("map.setMapType("+mapType+");");

                    if (mapType.indexOf("3D") != -1)
                    {
                        eval("map.getEarthInstance(function(ge){"+
                            "   if (ge == null) {" +
                            "      KMLMapLoader.maps["+(KMLMapLoader.maps.length-1)+"].setMapType(G_SATELLITE_MAP);" +
                            "   }" +
                            "});");
                    }
                }

                var geoXml = new GGeoXml(map.getContainer().getAttribute("kml"));

                map.addOverlay(geoXml);

                GEvent.addListener(map, "infowindowopen", KMLMapLoader.fix);
            }
        }
    },
    
    fix: function()
    {
        for (var t = 0 ; t < KMLMapLoader.maps.length ; ++t)
        {
            if (KMLMapLoader.maps[t] == this)
            {
                var divs = KMLMapLoader.maps[t].getContainer().getElementsByTagName("div");

                for (var n = 0 ; n < divs.length ; ++n)
                {
                    if (divs[n].id == "iw_kml")
                    {
                        var imgs = divs[n].getElementsByTagName("img");

                        for (var j = 0 ; j < imgs.length ; ++j)
                        {
                            var index = imgs[j].src.indexOf("/mapsatt");

                            if (index != -1) imgs[j].src = "http://maps.google.com" + imgs[j].src.substr(index);
                        }

                        KMLMapLoader.maps[t].updateCurrentTab(function(tab){});
                    }
                }
            }
            else
            {
                KMLMapLoader.maps[t].closeInfoWindow();
            }
        }
    }
};

//google.setOnLoadCallback(KMLMapLoader.load);
