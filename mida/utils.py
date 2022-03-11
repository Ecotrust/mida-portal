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

    mammal_sound_sensitivity_layers = Layer.objects.filter(url__icontains=source_url, name__icontains="Sound sensitivity").filter(name__icontains="frequency:")

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
        print(layer.name)