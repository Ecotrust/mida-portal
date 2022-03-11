from data_manager.models import Layer

def mdat_22Q1(prod=True, undo=False):
    prod_url = "mgelmaps.env.duke.edu/mdat/rest/services/MDAT/Mammal_SummaryProducts"
    stage_url = "mgelmaps.env.duke.edu/mdat_devel/rest/services/MDAT_Staging/Mammal_SummaryProducts"

    source_url = prod_url if prod else stage_url


    mammal_sound_mapping = {
        'Low': {
            'Abundance': {
                'old_id': '41',
                'new_id': '49',
            },
            'Species Richness': {
                'old_id': '42',
                'new_id': '50',
            },
            'Core Abundance Area - Mid-Atlantic scale': {
                'old_id': '46',
                'new_id': '54',
            }
        },
        'Medium': {
            'Abundance': {
                'old_id': '49',
                'new_id': '41',
            },
            'Species Richness': {
                'old_id': '50',
                'new_id': '42',
            },
            'Core Abundance Area - Mid-Atlantic scale': {
                'old_id': '54',
                'new_id': '46',
            }
        }
    }
    mammal_sound_mapping['High'] = mammal_sound_mapping['Medium']
    layer_name_start = "Sound sensitivity "
    layer_name_middle = " frequency: "


    mammal_sound_sensitivity_layers = Layer.objects.filter(url__icontains=source_url, name__contains=layer_name_start).filter(name__icontains=layer_name_middle)

    low_label = "Low"
    if undo:
        from_id = 'new_id'
        to_id = 'old_id'
        from_label = 'High'
        to_label = 'Medium'
    else:
        from_id = 'old_id'
        to_id = 'new_id'
        from_label = 'Medium'
        to_label = 'High'

    for layer in mammal_sound_sensitivity_layers:
        [name_start, metric_label] = layer.name.split(layer_name_middle)
        frequency_label = name_start.split(layer_name_start)[1]
        from_value = mammal_sound_mapping[frequency_label][metric_label][from_id]
        to_value = mammal_sound_mapping[frequency_label][metric_label][to_id]
        if not layer.arcgis_layers == from_value:
            print("============= DATA MISMATCH: PLEASE FIX MANUALLY =============")
            print("ArcGIS layers {} not equal to expected {} for [{}][{}][{}]".format(layer.arcgis_layers, from_value, frequency_label, metric_label, from_id))
            import ipdb; ipdb.set_trace()
        elif not frequency_label in [low_label, from_label]:
            print("============= LABEL MISMATCH: PLEASE FIX MANUALLY =============")
            print("{} not in [{}, {}]".format(frequency_label, low_label, from_label))
            import ipdb; ipdb.set_trace()
        elif layer.name != "{}{}{}{}".format(layer_name_start, frequency_label, layer_name_middle, metric_label):
            print("============= NAME MISMATCH: PLEASE FIX MANUALLY =============")
            print("{} not in {}{}{}{}".format(layer.name, layer_name_start, frequency_label, layer_name_middle, metric_label))
            import ipdb; ipdb.set_trace()
        else:
            if frequency_label == from_label:
                layer.name = "{}{}{}{}".format(layer_name_start, to_label, layer_name_middle, metric_label)
                print("Layer Name changed from {}{}{}{} to {}{}{}{}".format(
                    layer_name_start, frequency_label, layer_name_middle, metric_label,
                    layer_name_start, to_label, layer_name_middle, metric_label
                ))
            layer.arcgis_layers = to_value
            print("{} arcgis layer changed from {} to {}".format(layer.name, from_value, to_value))
            layer.save()
