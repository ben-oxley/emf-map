import './index.css'
import { registerSW } from 'virtual:pwa-register'
import maplibregl from 'maplibre-gl'
import map_style from './map_style.json'
import Marker from './marker'
import LayerSwitcher from '@russss/maplibregl-layer-switcher'
import URLHash from '@russss/maplibregl-layer-switcher/urlhash'
import DistanceMeasure from './distancemeasure'
import ContextMenu from './contextmenu'
import { roundPosition } from './util'
import InstallControl from './installcontrol'

if (import.meta.env.DEV) {
    map_style.sources.villages.data = 'http://localhost:2342/api/villages.geojson'
    map_style.sources.site_plan.url = 'http://localhost:8888/capabilities/buildmap'
    map_style.glyphs = 'http://localhost:8080/fonts/{fontstack}/{range}.pbf'
}

class EventMap {
    layers: Record<string, string> = {
        Background: 'background_',
        Slope: 'slope',
        Hillshade: 'hillshade',
        'Aerial Imagery': 'ortho',
        Structures: 'structures_',
        Paths: 'paths_',
        'Buried Services': 'services_',
        Water: 'site_water_',
        DKs: 'dk_',
        'NOC-Physical': 'noc_',
        Power: 'power_',
        Lighting: 'lighting_',
        Villages: 'villages_',
    }
    map?: maplibregl.Map
    layer_switcher?: LayerSwitcher
    url_hash?: URLHash
    marker?: Marker

    init() {
        registerSW({ immediate: true })
        const layers_enabled = ['Background', 'Structures', 'Paths', 'Villages']
        this.layer_switcher = new LayerSwitcher(this.layers, layers_enabled)

        this.url_hash = new URLHash(this.layer_switcher)
        this.layer_switcher.urlhash = this.url_hash
        this.marker = new Marker(this.url_hash)

        this.layer_switcher.setInitialVisibility(map_style)
        this.map = new maplibregl.Map({
                container: 'map',
                style: map_style,
                hash: true,
                zoom: 17.12,
                center: [-2.377036, 52.04143],
                attributionControl: false
            }
        )
        this.map.rotateTo(25);

        this.map.touchZoomRotate.disableRotation()

        this.map.addControl(this.layer_switcher, 'top-right')
        this.url_hash.enable(this.map)

    }
}

const em = new EventMap()
window.em = em

if (document.readyState != 'loading') {
    em.init()
} else {
    document.addEventListener('DOMContentLoaded', em.init)
}
