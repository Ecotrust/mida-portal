/**
  * clickOnUTFGridLayerEvent - attempt to pull ID data from UTF grid and populate attribute report
  * @param {object} layer - the clicked OpenLayers UTF-enabled layer object.
  * @param {object} evt - the OpenLayers click event
  */
app.wrapper.events.clickOnUTFGridLayerEvent = function(layer, evt){
  // TODO: Don't report if layer is not visible!
  var mp_layer = layer.get('mp_layer');
  var utfgrid = mp_layer.utfgrid;
  var gridSource = utfgrid.getSource();
  var viewResolution = /** @type {number} */ (app.map.getView().getResolution());
  var coordinate = evt.coordinate;
  gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
    function(data) {
      //
      // var title = mp_layer.featureAttributionName,
      //     text = attribute_objs;
      if ( mp_layer.name === 'OCS Lease Blocks' ) {
          data = app.legacy.getOCSAttributes(data);
      } else if ( mp_layer.name === 'Sea Turtles' ) {
          data = app.legacy.getSeaTurtleAttributes(data);
      } else if ( mp_layer.name === 'Toothed Mammals (All Seasons)' ) {
          data = app.legacy.getToothedMammalAttributes(data);
      } else if ( mp_layer.name === 'Wind Speed' ) {
          data = app.legacy.getWindSpeedAttributes(data);
      } else if ( mp_layer.name === 'BOEM Wind Planning Areas' ) {
          data = app.legacy.getWindPlanningAreaAttributes(data);
      } else if ( mp_layer.name === 'Party & Charter Boat' ) {
          data = app.legacy.adjustPartyCharterAttributes(data);
      } else if ( mp_layer.name === 'Port Commodity (Points)' ) {
          data = app.legacy.getPortCommodityAttributes(data);
      } else if ( mp_layer.name === 'Port Commodity' ) {
          data = app.legacy.getPortCommodityAttributes(data);
      } else if ( mp_layer.name === 'Port Ownership (Points)' ) {
          data = app.legacy.getPortOwnershipAttributes(data);
      } else if ( mp_layer.name === 'Port Ownership' ) {
          data = app.legacy.getPortOwnershipAttributes(data);
      } else if ( mp_layer.name === 'Maintained Channels') {
          data = app.legacy.getChannelAttributes(data);
      } else if ( mp_layer.name === 'Essential Fish Habitats') {
          data = app.legacy.getEFHAttributes(data);
      }
      // } else if ( title === 'Benthic Habitats (North)' || title === 'Benthic Habitats (South)' ) {
      //     title = 'Benthic Habitats';
      // }
      // clickAttributes[title] = [{
      //     'name': 'Feature',
      //     'id': mp_layer.featureAttributionName + '-0',
      //     'attributes': text
      // }];
      // if (Object.keys(data[0]).indexOf('display') >= 0) {
      //   data = app.legacy.reformatGridAttributeData(data);
      // }
      if ((Array.isArray(data) && data.length > 0) || !Array.isArray(data)) {
        app.wrapper.events.generateAttributeReport(mp_layer, [data]);
      }
    });
};

app.legacy = {};

app.legacy.reformatGridAttributeData = function(data) {
  return_json = {};
  for (var i = 0; i < data.length; i++) {
    return_json[data[i].display] = data[i].data;
  }
  return return_json;
}

app.legacy.getOCSAttributes = function (data) {
    attrs = [];
    if ('BLOCK_LAB' in data) {
        attrs.push({'display': 'OCS Block Number', 'data': data['BLOCK_LAB']});
    } else if ('PROT_NUMB' in data) {
        var blockLab = data['PROT_NUMB'].substring(data['PROT_NUMB'].indexOf('_')+1);
        attrs.push({'display': 'OCS Block Number', 'data': blockLab});
    }
    if ('PROT_NUMBE' in data) {
        attrs.push({'display': 'Protraction Number', 'data': data['PROT_NUMBE']});
    }else if ('PROT_NUMB' in data) {
        var protNumbe = data['PROT_NUMB'].substring(0,data['PROT_NUMB'].indexOf('_'));
        attrs.push({'display': 'Protraction Number', 'data': protNumbe});
    }
    if ('PROT_NUMB' in data) {
        if (app.viewModel.scenarios &&
            app.viewModel.scenarios.selectionFormModel &&
            app.viewModel.scenarios.selectionFormModel.IE &&
            app.viewModel.scenarios.selectionFormModel.selectingLeaseBlocks()) {
            var blockID = data['PROT_NUMB'],
                index = app.viewModel.scenarios.selectionFormModel.selectedLeaseBlocks.indexOf(blockID);
            if ( index === -1) {
                //add that lease block to the list of selected leaseblocks
                app.viewModel.scenarios.selectionFormModel.selectedLeaseBlocks.push(blockID);
            } else {
                //remove that lease block from the list of selected leaseblocks
                app.viewModel.scenarios.selectionFormModel.selectedLeaseBlocks.splice(index, 1);
            }
        }
    }

    //Wind Speed
    if ('WINDREV_MI' in data && 'WINDREV_MA' in data) {
        if ( data['WINDREV_MI'] ) {
            var min_speed = data['WINDREV_MI'].toFixed(3),
                max_speed = data['WINDREV_MA'].toFixed(3),
                min_range = (parseFloat(min_speed)-.125).toPrecision(3),
                max_range = (parseFloat(max_speed)+.125).toPrecision(3);
            /*if ( min_speed === max_speed ) {
                attrs.push({'display': 'Estimated Avg Wind Speed (m/s)', 'data': speed});
            } else {
                var speed = (min_speed-.125) + ' to ' + (max_speed+.125);
                attrs.push({'display': 'Estimated Avg Wind Speed (m/s)', 'data': speed});
            }*/
            attrs.push({'display': 'Estimated Avg Wind Speed', 'data': min_range + ' to ' + max_range + ' m/s'});
        } else {
            attrs.push({'display': 'Estimated Avg Wind Speed', 'data': 'Unknown'});
        }
    }

    //Distance to Coastal Substation
    if ('SUBSTAMIN' in data && 'SUBSTMAX' in data) {
        if (data['SUBSTAMIN'] !== 0 && data['SUBSTMAX'] !== 0) {
            attrs.push({'display': 'Distance to Coastal Substation', 'data': data['SUBSTAMIN'].toFixed(0) + ' to ' + data['SUBSTMAX'].toFixed(0) + ' miles'});
        } else {
            attrs.push({'display': 'Distance to Coastal Substation Unknown', 'data': null});
        }
    }

    //Distance to AWC Hubs
    if ('AWCMI_MIN' in data && 'AWCMI_MAX' in data) {
        attrs.push({'display': 'Distance to Proposed AWC Hub', 'data': data['AWCMI_MIN'].toFixed(0) + ' to ' + data['AWCMI_MAX'].toFixed(0) + ' miles'});
    }

    //Wind Planning Areas
    if ('WEA2' in data && data['WEA2'] !== 0) {
        var weaName = data['WEA2_NAME'],
            stateName = weaName.substring(0, weaName.indexOf(' '));
        if (stateName === 'New') {
            stateName = 'New Jersey';
        } else if (stateName === 'Rhode') {
            stateName = 'Rhode Island / Massachusetts';
        }
        //if ( data['WEA2_NAME'].replace(/\s+/g, '') !== "" ) {
        //TAKING THIS OUT TEMPORARILY UNTIL WE HAVE UPDATED THE DATA SUMMARY FOR WPAS AND LEASE AREAS
        //attrs.push({'display': 'Within the ' + stateName + ' WPA', 'data': null});
        //}
    }

    //Distance to Shipping Lanes
    if ('TRAFFCMIN' in data && 'TRAFFCMAX' in data) {
        attrs.push({'display': 'Distance to Ship Routing Measures', 'data': data['TRAFFCMIN'].toFixed(0) + ' to ' + data['TRAFFCMAX'].toFixed(0) + ' miles'});
    }

    //Distance to Shore
    if ('MI_MIN' in data && 'MI_MAX' in data) {
        attrs.push({'display': 'Distance to Shore', 'data': data['MI_MIN'].toFixed(0) + ' to ' + data['MI_MAX'].toFixed(0) + ' miles'});
    }

    //Depth Range
    if ('DEPTHM_MIN' in data && 'DEPTHM_MAX' in data) {
        if ( data['DEPTHM_MIN'] ) {
            //convert depth values to positive feet values (from negative meter values)
            var max_depth = (-data['DEPTHM_MAX']).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                min_depth = (-data['DEPTHM_MIN']).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            attrs.push({'display': 'Depth Range', 'data': max_depth + ' to ' + min_depth + ' meters'});
        } else {
            attrs.push({'display': 'Depth Range', 'data': 'Unknown'});
        }
    }

    //Seabed Form
    if ('PCT_TOTAL' in data) {
        if (data['PCT_TOTAL'] < 99.9) {
            attrs.push({'display': 'Seabed Form', 'data': 'Unknown'});
        } else {
            attrs.push({'display': 'Seabed Form', 'data': ''});
            if ('PCTDEPRESS' in data && Math.round(data['PCTDEPRESS']) > 0) {
                attrs.push({'tab': true, 'display': 'Depression (' + Math.round(data['PCTDEPRESS']) + '%)', 'data': ''});
            }
            if ('PCTHIGHFLA' in data && Math.round(data['PCTHIGHFLA']) > 0) {
                attrs.push({'tab': true, 'display': 'High Flat (' + Math.round(data['PCTHIGHFLA']) + '%)', 'data': ''});
            }
            if ('PCTHIGHSLO' in data && Math.round(data['PCTHIGHSLO']) > 0) {
                attrs.push({'tab': true, 'display': 'High Slope (' + Math.round(data['PCTHIGHSLO']) + '%)', 'data': ''});
            }
            if ('PCTLOWSLOP' in data && Math.round(data['PCTLOWSLOP']) > 0) {
                attrs.push({'tab': true, 'display': 'Low Slope (' + Math.round(data['PCTLOWSLOP']) + '%)', 'data': ''});
            }
            if ('PCTMIDFLAT' in data && Math.round(data['PCTMIDFLAT']) > 0) {
                attrs.push({'tab': true, 'display': 'Mid Flat (' + Math.round(data['PCTMIDFLAT']) + '%)', 'data': ''});
            }
            if ('PCTSIDESLO' in data && Math.round(data['PCTSIDESLO']) > 0) {
                attrs.push({'tab': true, 'display': 'Side Slope (' + Math.round(data['PCTSIDESLO']) + '%)', 'data': ''});
            }
            if ('PCTSTEEP' in data && Math.round(data['PCTSTEEP']) > 0) {
                attrs.push({'tab': true, 'display': 'Steep (' + Math.round(data['PCTSTEEP']) + '%)', 'data': ''});
            }
        }
    }

    //Coral Count
    var coralCount = 0,
        laceCount = 0,
        blackCount = 0,
        softCount = 0,
        gorgoCount = 0,
        hardCount = 0;
    if ('FREQ_LACE' in data) {
        laceCount = data['FREQ_LACE'];
        coralCount += laceCount;
    }
    if ('FREQ_BLACK' in data) {
        blackCount = data['FREQ_BLACK'];
        coralCount += blackCount;
    }
    if ('FREQ_SOFT' in data) {
        softCount = data['FREQ_SOFT'];
        coralCount += softCount;
    }
    if ('FREQ_GORGO' in data) {
        gorgoCount = data['FREQ_GORGO'];
        coralCount += gorgoCount;
    }
    if ('FREQ_HARD' in data) {
        hardCount = data['FREQ_HARD'];
        coralCount += hardCount;
    }
    if (coralCount > 0) {
        attrs.push({'display': 'Identified Corals', 'data': coralCount});
        if (laceCount > 0) {
            attrs.push({'tab': true, 'display': 'Lace Corals (' + laceCount + ')', 'data': ''});
        }
        if (blackCount > 0) {
            attrs.push({'tab': true, 'display': 'Black/Thorny Corals (' + blackCount + ')', 'data': ''});
        }
        if (softCount > 0) {
            attrs.push({'tab': true, 'display': 'Soft Corals (' + softCount + ')', 'data': ''});
        }
        if (gorgoCount > 0) {
            attrs.push({'tab': true, 'display': 'Gorgonian Corals (' + gorgoCount + ')', 'data': ''});
        }
        if (hardCount > 0) {
            attrs.push({'tab': true, 'display': 'Hard Corals (' + hardCount + ')', 'data': ''});
        }
    }
    if ('FREQ_PENS' in data && data['FREQ_PENS'] > 0) {
        var seaPenCount = data['FREQ_PENS'];
        attrs.push({'display': 'Sea Pens Identified', 'data': seaPenCount});
    }

    //Shipwrecks
    if ('BOEMSHPDEN' in data) {
        attrs.push({'display': 'Number of Shipwrecks', 'data': data['BOEMSHPDEN']});
    }

    //Distance to Discharge Point Locations
    if ('DISCHMEAN' in data) {
        attrs.push({'display': 'Avg Distance to Offshore Discharge', 'data': data['DISCHMEAN'].toFixed(1) + ' miles'});
    }
    if ('DFLOWMEAN' in data) {
        attrs.push({'display': 'Avg Distance to Flow-Only Offshore Discharge', 'data': data['DFLOWMEAN'].toFixed(1) + ' miles'});
    }

    //Dredge Disposal Locations
    if ('DREDGE_LOC' in data) {
        if (data['DREDGE_LOC'] > 0) {
            attrs.push({'display': 'Contains a Dredge Disposal Location', 'data': ''});
        } else {
            attrs.push({'display': 'Does not contain a Dredge Disposal Location', 'data': ''});
        }
    }

    //Unexploded Ordinances
    if ('UXO' in data) {
        if (data['UXO'] === 0) {
            attrs.push({'display': 'No known Unexploded Ordnances', 'data': ''});
        } else {
            attrs.push({'display': 'Known to contain Unexploded Ordnance(s)', 'data': ''});
        }
    }

    //Traffic Density (High/Moderate/Low)
    if ('PCTALL_LO' in data && data['PCTALL_LO'] !== 999) {
        attrs.push({'display': 'Ship Traffic Density (All Vessels)', 'data': ''});
        if (data['PCTALL_LO'] > 0) {
            attrs.push({'tab': true, 'display': 'Low Traffic', 'data': data['PCTALL_LO'] + '%'});
        }
        if (data['PCTALL_ME'] > 0) {
            attrs.push({'tab': true, 'display': 'Moderate Traffic', 'data': data['PCTALL_ME'] + '%'});
        }
        if (data['PCTALL_HI'] > 0) {
            attrs.push({'tab': true, 'display': 'High Traffic', 'data': data['PCTALL_HI'] + '%'});
        }
    }
    if ('PCTCAR_LO' in data && data['PCTCAR_LO'] !== 999) {
        attrs.push({'display': 'Ship Traffic Density (Cargo Vessels)', 'data': ''});
        if (data['PCTCAR_LO'] > 0) {
            attrs.push({'tab': true, 'display': 'Low Traffic', 'data': data['PCTCAR_LO'] + '%'});
        }
        if (data['PCTCAR_ME'] > 0) {
            attrs.push({'tab': true, 'display': 'Moderate Traffic', 'data': data['PCTCAR_ME'] + '%'});
        }
        if (data['PCTCAR_HI'] > 0) {
            attrs.push({'tab': true, 'display': 'High Traffic', 'data': data['PCTCAR_HI'] + '%'});
        }
    }
    if ('PCTPAS_LO' in data && data['PCTPAS_LO'] !== 999) {
        attrs.push({'display': 'Ship Traffic Density (Passenger Vessels)', 'data': ''});
        if (data['PCTPAS_LO'] > 0) {
            attrs.push({'tab': true, 'display': 'Low Traffic', 'data': data['PCTPAS_LO'] + '%'});
        }
        if (data['PCTPAS_ME'] > 0) {
            attrs.push({'tab': true, 'display': 'Moderate Traffic', 'data': data['PCTPAS_ME'] + '%'});
        }
        if (data['PCTPAS_HI'] > 0) {
            attrs.push({'tab': true, 'display': 'High Traffic', 'data': data['PCTPAS_HI'] + '%'});
        }
    }
    if ('PCTTAN_LO' in data && data['PCTTAN_LO'] !== 999) {
        attrs.push({'display': 'Ship Traffic Density (Tanker Vessels)', 'data': ''});
        if (data['PCTTAN_LO'] > 0) {
            attrs.push({'tab': true, 'display': 'Low Traffic', 'data': data['PCTTAN_LO'] + '%'});
        }
        if (data['PCTTAN_ME'] > 0) {
            attrs.push({'tab': true, 'display': 'Moderate Traffic', 'data': data['PCTTAN_ME'] + '%'});
        }
        if (data['PCTTAN_HI'] > 0) {
            attrs.push({'tab': true, 'display': 'High Traffic', 'data': data['PCTTAN_HI'] + '%'});
        }
    }
    if ('PCTTUG_LO' in data && data['PCTTUG_LO'] !== 999) {
        attrs.push({'display': 'Ship Traffic Density (Tug/Tow Vessels)', 'data': ''});
        if (data['PCTTUG_LO'] > 0) {
            attrs.push({'tab': true, 'display': 'Low Traffic', 'data': data['PCTTUG_LO'] + '%'});
        }
        if (data['PCTTUG_ME'] > 0) {
            attrs.push({'tab': true, 'display': 'Moderate Traffic', 'data': data['PCTTUG_ME'] + '%'});
        }
        if (data['PCTTUG_HI'] > 0) {
            attrs.push({'tab': true, 'display': 'High Traffic', 'data': data['PCTTUG_HI'] + '%'});
        }
    }
    // if ('AIS7_MEAN' in data) {
    //     if ( data['AIS7_MEAN'] < 1 ) {
    //         var rank = 'Low';
    //     } else {
    //         var rank = 'High';
    //     }
    //     attrs.push({'display': 'Commercial Ship Traffic Density', 'data': rank });
    // }

    return attrs;
};

app.legacy.getSeaTurtleAttributes = function (data) {
    attrs = [];
    if ('ST_LK_NUM' in data && data['ST_LK_NUM']) {
        //attrs.push({'display': 'Sightings', 'data': data['ST_LK_NUM']});
        if (data['ST_LK_NUM'] === 99) {
            attrs.push({'display': 'Insufficient Data available for this area', 'data': ''});
        } else {
            attrs.push({'display': 'Above Average Sightings for the following species:', 'data': ''});
        }
    } else {
        attrs.push({'display': 'Sightings were in the normal range for all species', 'data': ''});
    }

    if ('ST_LK_NUM' in data && data['ST_LK_NUM'] ) {
        var season, species, sighting;
        if ('GREEN_LK' in data && data['GREEN_LK']) {
            season = data['GREEN_LK'];
            species = 'Green Sea Turtle';
            sighting = species + ' (' + season + ') ';
            attrs.push({'display': '', 'data': sighting});
        }
        if ('LEATH_LK' in data && data['LEATH_LK']) {
            season = data['LEATH_LK'];
            species = 'Leatherback Sea Turtle';
            sighting = species + ' (' + season + ') ';
            attrs.push({'display': '', 'data': sighting});
        }
        if ('LOGG_LK' in data && data['LOGG_LK']) {
            season = data['LOGG_LK'];
            species = 'Loggerhead Sea Turtle';
            sighting = species + ' (' + season + ') ';
            attrs.push({'display': '', 'data': sighting});
        }
    }
    return attrs;
};

app.legacy.getToothedMammalAttributes = function (data) {
    attrs = [];
    if ('TOO_LK_NUM' in data && data['TOO_LK_NUM']) {
        if (data['TOO_LK_NUM'] === 99) {
            attrs.push({'display': 'Insufficient Data available for this area', 'data': ''});
        } else {
            attrs.push({'display': 'Above Average Sightings for the following species:', 'data': ''});
        }
    } else {
        attrs.push({'display': 'Sightings were in the normal range for all species', 'data': ''});
    }
    if ('TOO_LK_NUM' in data && data['TOO_LK_NUM'] ) {
        var season, species, sighting;
        if ('SPERM_LK' in data && data['SPERM_LK']) {
            season = data['SPERM_LK'];
            species = 'Sperm Whale';
            sighting = species + ' (' + season + ') ';
            attrs.push({'display': '', 'data': sighting});
        }
        if ('BND_LK' in data && data['BND_LK']) {
            season = data['BND_LK'];
            species = 'Bottlenose Dolphin';
            sighting = species + ' (' + season + ') ';
            attrs.push({'display': '', 'data': sighting});
        }
        if ('STRIP_LK' in data && data['STRIP_LK']) {
            season = data['STRIP_LK'];
            species = 'Striped Dolphin';
            sighting = species + ' (' + season + ') ';
            attrs.push({'display': '', 'data': sighting});
        }
    }
    return attrs;
};

app.legacy.getWindSpeedAttributes = function (data) {
    attrs = [];
    if ('SPEED_90' in data) {
        var min_speed = (parseFloat(data['SPEED_90'])-0.125).toPrecision(3),
            max_speed = (parseFloat(data['SPEED_90'])+0.125).toPrecision(3);
        attrs.push({'display': 'Estimated Avg Wind Speed', 'data': min_speed + ' to ' + max_speed + ' m/s'});
    }
    return attrs;
};

app.legacy.getWindPlanningAreaAttributes = function (data) {
    attrs = [];
    if ('INFO' in data) {
        var state = data.INFO,
            first = state.indexOf("Call"),
            second = state.indexOf("WEA"),
            third = state.indexOf("RFI");
        /*if (first !== -1) {
            state = state.slice(0, first);
        } else if (second !== -1) {
            state = state.slice(0, second);
        } else if (third !== -1) {
            state = state.slice(0, third);
        }*/
        attrs.push({'display': '', 'data': state});
    }
    return attrs;
};

app.legacy.adjustPartyCharterAttributes = function (data) {
    var attrs = [];
    if (Array.isArray(data) == false) {
      data = [data]
    }
    for (var x=0; x<data.length; x=x+1) {
      if (data[x].hasOwnProperty('TOTAL_TRIP')) {
        attrs.push({
          'display': 'Total Trips (2000-2009)',
          'data': Math.round(data[x].TOTAL_TRIP)
        });
      }
    }
    return attrs;
};

app.legacy.getPortCommodityAttributes = function (data) {
    attrs = [];
    if ('Commodity_' in data) {
        var commodity = 'Unknown';
        switch (data['Commodity_']) {
            case 0:
                commodity = 'Not applicable';
                break;
            case 10:
                commodity = 'Coal';
                break;
            case 20:
                commodity = 'Petroleum & petroleum products';
                break;
            case 30:
                commodity = 'Chemicals & related products';
                break;
            case 40:
                commodity = 'Crude materials, inedible, except fuels';
                break;
            case 50:
                commodity = 'Primary manufactured goods';
                break;
            case 60:
                commodity = 'Food & farm products';
                break;
            case 70:
                commodity = 'All manufactured equipment and machinery';
                break;
            case 80:
                commodity = 'Waste material; garbage, landfill, sewage sludge & waste water';
                break;
            case 91:
                commodity = 'Multi-commodities';
                break;
            case 99:
                commodity = 'Unknown';
                break;
        }
        attrs.push({'display': '', 'data': commodity});
    }
    return attrs;
};

app.legacy.getPortOwnershipAttributes = function (data) {
    attrs = [];
    if ('Ownership' in data) {
        attrs.push({'display': '', 'data': data['Ownership']});
    }
    return attrs;
};

app.legacy.getChannelAttributes = function (data) {
    attrs = [];
    if ('location' in data) {
        attrs.push({'display': '', 'data': data['location']});
    }
    if ('minimumDep' in data) {
        var meters = data['minimumDep'],
            feet =  new Number(meters * 3.28084).toPrecision(2);
        attrs.push({'display': 'Minimum Depth', 'data': feet + ' feet'}); // + meters + ' meters)'});
    }
    return attrs;
};

app.legacy.getEFHAttributes = function (data) {
    attrs = [];

    if ('American_P' in data && data['American_P']) {
        output = getEFHData(data['American_P']);
        attrs.push({'display': 'American Plaice', 'data': output});
    }
    if ('Atlantic_C' in data && data['Atlantic_C']) {
        output = getEFHData(data['Atlantic_C']);
        attrs.push({'display': 'Atlantic Cod', 'data': output});
    }
    if ('Atlantic_1' in data && data['Atlantic_1']) {
        output = getEFHData(data['Atlantic_1']);
        attrs.push({'display': 'Atlantic Halibut', 'data': output});
    }
    if ('Atlantic_H' in data && data['Atlantic_H']) {
        output = getEFHData(data['Atlantic_H']);
        attrs.push({'display': 'Atlantic Herring', 'data': output});
    }
    if ('Atlantic_S' in data && data['Atlantic_S']) {
        output = getEFHData(data['Atlantic_S']);
        attrs.push({'display': 'Atlantic Sea Scallop', 'data': output});
    }
    if ('Atlantic_W' in data && data['Atlantic_W']) {
        output = getEFHData(data['Atlantic_W']);
        attrs.push({'display': 'Atlantic Wolffish', 'data': output});
    }
    if ('Barndoor_S' in data && data['Barndoor_S']) {
        output = getEFHData(data['Barndoor_S']);
        attrs.push({'display': 'Barndoor Skate', 'data': output});
    }
    if ('Black_Sea_' in data && data['Black_Sea_']) {
        output = getEFHData(data['Black_Sea_']);
        attrs.push({'display': 'Black Sea Bass', 'data': output});
    }
    if ('Bluefish' in data && data['Bluefish']) {
        output = getEFHData(data['Bluefish']);
        attrs.push({'display': 'Bluefish', 'data': output});
    }
    if ('Butterfish' in data && data['Butterfish']) {
        output = getEFHData(data['Butterfish']);
        attrs.push({'display': 'Butterfish', 'data': output});
    }
    if ('Clearnose_' in data && data['Clearnose_']) {
        output = getEFHData(data['Clearnose_']);
        attrs.push({'display': 'Clearnose Skate', 'data': output});
    }
    if ('Haddock' in data && data['Haddock']) {
        output = getEFHData(data['Haddock']);
        attrs.push({'display': 'Haddock', 'data': output});
    }
    if ('Little_Ska' in data && data['Little_Ska']) {
        output = getEFHData(data['Little_Ska']);
        attrs.push({'display': 'Little Skate', 'data': output});
    }
    if ('Longfin_In' in data && data['Longfin_In']) {
        output = getEFHData(data['Longfin_In']);
        attrs.push({'display': 'Longfin Inshore Squid', 'data': output});
    }
    if ('Mackerel' in data && data['Mackerel']) {
        output = getEFHData(data['Mackerel']);
        attrs.push({'display': 'Mackerel', 'data': output});
    }
    if ('Monkfish' in data && data['Monkfish']) {
        output = getEFHData(data['Monkfish']);
        attrs.push({'display': 'Monkfish', 'data': output});
    }
    if ('Northern_S' in data && data['Northern_S']) {
        output = getEFHData(data['Northern_S']);
        attrs.push({'display': 'Northern Shortfin Squid', 'data': output});
    }
    if ('Ocean_Pout' in data && data['Ocean_Pout']) {
        output = getEFHData(data['Ocean_Pout']);
        attrs.push({'display': 'Ocean Pout', 'data': output});
    }
    if ('Offshore_H' in data && data['Offshore_H']) {
        output = getEFHData(data['Offshore_H']);
        attrs.push({'display': 'Offshore Hake', 'data': output});
    }
    if ('Pollock' in data && data['Pollock']) {
        output = getEFHData(data['Pollock']);
        attrs.push({'display': 'Pollock', 'data': output});
    }
    if ('Quahog' in data && data['Quahog']) {
        output = getEFHData(data['Quahog']);
        attrs.push({'display': 'Quahog', 'data': output});
    }
    if ('Red_Crab' in data && data['Red_Crab']) {
        output = getEFHData(data['Red_Crab']);
        attrs.push({'display': 'Red Crab', 'data': output});
    }
    if ('Red_Hake' in data && data['Red_Hake']) {
        output = getEFHData(data['Red_Hake']);
        attrs.push({'display': 'Red Hake', 'data': output});
    }
    if ('Redfish' in data && data['Redfish']) {
        output = getEFHData(data['Redfish']);
        attrs.push({'display': 'Redfish', 'data': output});
    }
    if ('Rosette_Sk' in data && data['Rosette_Sk']) {
        output = getEFHData(data['Rosette_Sk']);
        attrs.push({'display': 'Rosette Skate', 'data': output});
    }
    if ('Scup' in data && data['Scup']) {
        output = getEFHData(data['Scup']);
        attrs.push({'display': 'Scup', 'data': output});
    }
    if ('Silver_Hak' in data && data['Silver_Hak']) {
        output = getEFHData(data['Silver_Hak']);
        attrs.push({'display': 'Silver Hake', 'data': output});
    }
    if ('Smooth_Ska' in data && data['Smooth_Ska']) {
        output = getEFHData(data['Smooth_Ska']);
        attrs.push({'display': 'Smooth Skate', 'data': output});
    }
    if ('Spiny_Dogf' in data && data['Spiny_Dogf']) {
        output = getEFHData(data['Spiny_Dogf']);
        attrs.push({'display': 'Spiny Dogfish', 'data': output});
    }
    if ('Summer_Flo' in data && data['Summer_Flo']) {
        output = getEFHData(data['Summer_Flo']);
        attrs.push({'display': 'Summer Flounder', 'data': output});
    }
    if ('Surfclam' in data && data['Surfclam']) {
        output = getEFHData(data['Surfclam']);
        attrs.push({'display': 'Surfclam', 'data': output});
    }
    if ('Thorny_Ska' in data && data['Thorny_Ska']) {
        output = getEFHData(data['Thorny_Ska']);
        attrs.push({'display': 'Thorny Skate', 'data': output});
    }
    if ('Tilefish' in data && data['Tilefish']) {
        output = getEFHData(data['Tilefish']);
        attrs.push({'display': 'Tilefish', 'data': output});
    }
    if ('Witch_Flou' in data && data['Witch_Flou']) {
        output = getEFHData(data['Witch_Flou']);
        attrs.push({'display': 'Witch Flounder', 'data': output});
    }
    if ('White_Hake' in data && data['White_Hake']) {
        output = getEFHData(data['White_Hake']);
        attrs.push({'display': 'White Hake', 'data': output});
    }
    if ('Windowpane' in data && data['Windowpane']) {
        output = getEFHData(data['Windowpane']);
        attrs.push({'display': 'Windowpane', 'data': output});
    }
    if ('Winter_Flo' in data && data['Winter_Flo']) {
        output = getEFHData(data['Winter_Flo']);
        attrs.push({'display': 'Winter Flounder', 'data': output});
    }
    if ('Winter_Ska' in data && data['Winter_Ska']) {
        output = getEFHData(data['Winter_Ska']);
        attrs.push({'display': 'Winter Skate', 'data': output});
    }
    if ('Yellowtail' in data && data['Yellowtail']) {
        output = getEFHData(data['Yellowtail']);
        attrs.push({'display': 'Yellowtail', 'data': output});
    }
    if ('Species_Co' in data && data['Species_Co']) {
        attrs.unshift({'display': '', 'data': data['Species_Co'] + ' Overlapping Essential Fish Habitats'});
    }
    return attrs;
};

var getEFHData = function(keys) {
    var output = [];
    if (keys.indexOf('X') !== -1) {
        output.push('Life stage data not developed');
    } else {
        if (keys.indexOf('E') !== -1) {
            output.push('Eggs');
        }
        if (keys.indexOf('L') !== -1) {
            output.push('Larvae');
        }
        if (keys.indexOf('J') !== -1) {
            output.push('Juveniles');
        }
        if (keys.indexOf('A') !== -1) {
            output.push('Adults');
        }
    }
    return output.join(', ');
};
