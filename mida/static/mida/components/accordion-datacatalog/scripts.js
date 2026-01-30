(() => {
    
    // If there's a hash in the URL, open that accordion entry after a short delay
    if (window.location.hash.length > 1) {
        setTimeout(() => {
            const hash = window.location.hash;
            const id = hash.startsWith('#') ? hash.slice(1) : hash;
            if (!id) {
                return;
            }

            const anchor = document.getElementById(id);
            const summary = anchor.querySelector('summary');

            if (summary) {
                summary.click();
            }

        }, 500);
    }

    // Cache loaded layers to avoid redundant requests
    const loadedLayers = new Map();
    
    // Function to get catalog entry data via AJAX
    window.getCatalogEntry = async (layerType, layerId, themeId) => {
        
        const layerKey = String(layerId);
        const targetId = `collapse-layer-${layerType}-${layerKey}`;
        const target = document.getElementById(targetId);
        
        if (!target) {
            console.warn(`getCatalogEntry: element "${targetId}" not found.`);
            return false;
        }
        
        if (loadedLayers.has(layerKey)) {
            return true;
        }
        
        const themeSegment = themeId !== undefined && themeId !== null ? `/${themeId}` : '';
        const url = `/data_manager/get_layer_catalog_content/${layerType}/${layerKey}${themeSegment}`;
        
        try {

            const response = await fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            target.innerHTML = data?.html ?? '';
            loadedLayers.set(layerKey, 'Loaded');
            return true;

        } catch (error) {

            console.error('getCatalogEntry error:', error);
            target.innerHTML = '<div class="layer-loading-panel">Failed to retrieve layer info.</div>';
            loadedLayers.set(layerKey, 'Failed to load');
            return false;

        }
    };
})();
