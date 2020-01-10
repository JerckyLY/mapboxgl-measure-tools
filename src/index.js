const turf = require('turf')
const mapboxgl = require('mapbox-gl')
const MapboxDraw = require('@mapbox/mapbox-gl-draw')
class MapMeasureTool {
    constructor () {
        this.linePopupWindow = undefined // 测距结果显示
        this.areaPopupWindow = undefined // 测面结果显示
        this.isMeasureType = '' //
        this.measureMethod = this.measureMethod.bind(this)
    }
    onAdd (map) {
        this.map = map
        // 初始化绘制
        this.mapMeasureDrawTool = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
            }
        })
        this.map.addControl(this.mapMeasureDrawTool, 'top-left')
        console.log('mapMeasureDrawTool loaded')
        // 初始化按钮
        this.initMeasureToolControl()

        const that = this
        // 测距按钮点击事件
        this.lineButton.addEventListener('click', () => {
            if (that.isMeasureType === '' || that.isMeasureType === 'polygon') {
                that.clearMeasure()
                // 开始测距
                that.isMeasureType = 'line'
                that.map.on('draw.create', that.measureMethod)
                that.mapMeasureDrawTool.changeMode('draw_line_string')
            } else {
                that.clearMeasure()
            }
        })

        // 测面按钮点击事件
        this.areaButton.addEventListener('click', () => {
            if (that.isMeasureType === '' || that.isMeasureType === 'line') {
                that.clearMeasure()
                // 开始测面
                that.isMeasureType = 'polygon'
                that.map.on('draw.create', that.measureMethod)
                that.mapMeasureDrawTool.changeMode('draw_polygon')
            } else {
                that.clearMeasure()
            }
        })

        return this.container
    }

    // 清除
    clearMeasure () {
        this.isMeasureType = ''
        this.mapMeasureDrawTool.deleteAll()
        if (this.linePopupWindow) {
            this.linePopupWindow.remove()
            this.linePopupWindow = undefined
        }
        if (this.areaPopupWindow) {
            this.areaPopupWindow.remove()
            this.areaPopupWindow = undefined
        }
    }

    // 测量结果
    measureMethod () {
        let data = this.mapMeasureDrawTool.getAll()
        if (data.features.length > 0) {
            if (this.isMeasureType === 'line') {
                const coordinates = data.features[0].geometry.coordinates
                const position = coordinates[coordinates.length - 1]
                const result = Math.round(turf.lineDistance(data) * 1000) / 1000
                this.linePopupWindow = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
                this.linePopupWindow.setLngLat(position).setHTML('<div>距离：' + result + ' (km)</div>').addTo(this.map)
            } else if (this.isMeasureType === 'polygon') {
                const center = turf.centroid(data).geometry.coordinates
                const result = Math.round(turf.area(data) / 1000000 * 1000) / 1000
                this.areaPopupWindow = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
                this.areaPopupWindow.setLngLat(center).setHTML('<div>面积：' + result + ' (km²)</div>').addTo(this.map)
            }
        }
        this.map.off('draw.create', this.measureMethod)
    }

    initMeasureToolControl () {
        const iconRuler = '<svg t="1575453922172" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5140" width="25" height="30"><path d="M64 335.8v352c0 8.8 6.9 16 15.4 16h865.1c8.5 0 15.4-7.2 15.4-16v-352c0-8.8-6.9-16-15.4-16h-865c-8.6 0-15.5 7.2-15.5 16z m833.2 304H128.8v-256h768.4v256z" p-id="5141"></path><path d="M202.5 577.6h30v62h-30zM320.3 485.3h30v154h-30zM438.1 577.6h30v62h-30zM555.9 485.3h30v154h-30zM673.7 577.6h30v62h-30zM791.5 485.3h30v154h-30z" p-id="5142"></path></svg>'
        const iconArea = '<svg t="1575453274789" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4964" width="25" height="25"><path d="M947.93351 255.639285c16.063496 0 29.06104-12.998035 29.06104-29.059849L976.99455 73.015967c0-16.062837-12.997545-29.060873-29.06104-29.060873L794.334073 43.955094c-16.034842 0-29.060017 12.998035-29.060017 29.060873L765.274056 120.750131l-94.33837 0c-2.937009-0.451278-5.928256-0.451278-8.864241 0L258.72799 120.750131 258.72799 73.015967c0-16.062837-13.027222-29.060873-29.062063-29.060873L76.067513 43.955094c-16.063496 0-29.062063 12.998035-29.062063 29.060873l0 153.563468c0 16.062837 12.998568 29.059849 29.062063 29.059849l47.737143 0 0 506.581594L76.067513 762.220878c-16.063496 0-29.062063 12.997012-29.062063 29.059849l0 153.563468c0 16.062837 12.998568 29.059849 29.062063 29.059849l153.598414 0c16.034842 0 29.062063-12.997012 29.062063-29.059849l0-47.735188 506.545043 0 0 47.735188c0 16.062837 13.026198 29.059849 29.060017 29.059849l153.599437 0c16.063496 0 29.06104-12.997012 29.06104-29.059849L976.993527 791.281751c0-16.062837-12.997545-29.059849-29.06104-29.059849l-47.737143 0L900.195344 354.582761c0.050144-0.984421 0.050144-1.970888 0-2.955308l0-95.988168L947.93351 255.639285zM823.39716 102.07684l95.473264 0 0 95.441723-95.473264 0L823.39716 102.07684zM181.928783 459.920878c1.707968-1.102101 3.328951-2.394537 4.825086-3.89061l277.168724-277.158391 132.079449 0L181.928783 592.929194 181.928783 459.920878zM105.129576 102.07684l95.473264 0 0 46.62797c-0.014327 0.367367-0.02763 0.734734-0.02763 1.106194s0.014327 0.738827 0.02763 1.106194l0 46.601364-95.473264 0L105.129576 102.07684zM229.665927 255.639285c16.034842 0 29.062063-12.998035 29.062063-29.059849l0-47.707558 123.003375 0L181.928783 378.666272 181.928783 255.639285 229.665927 255.639285zM181.928783 675.116031l496.265511-496.244154 87.079762 0 0 35.606962L217.509574 762.220878l-35.580791 0L181.928783 675.116031zM105.129576 915.784346l0-95.441723 95.473264 0 0 46.600341c-0.014327 0.367367-0.02763 0.735757-0.02763 1.106194s0.014327 0.738827 0.02763 1.106194l0 46.62797L105.129576 915.783323zM842.071217 553.748846 563.784997 832.022641c-2.10912 2.109034-3.823229 4.460592-5.148464 6.965645L426.365717 838.988286l415.7055-415.688467L842.071217 553.748846zM918.870424 915.784346l-95.473264 0 0-95.441723 95.473264 0L918.870424 915.784346zM794.334073 762.220878c-16.034842 0-29.060017 12.997012-29.060017 29.059849l0 47.706535L639.011318 838.987263l203.060922-203.051579 0 126.284171L794.334073 762.219855zM842.071217 341.111958 344.174489 838.988286l-85.446499 0 0-35.795251 547.576186-547.552727 35.76704 0L842.071217 341.111958z" p-id="4965"></path></svg>'

        this.container = document.createElement('div')
        this.container.classList.add('mapboxgl-ctrl')
        this.container.classList.add('mapboxgl-ctrl-group')

        // 测距
        this.lineButton = document.createElement('button')
        this.lineButton.classList.add('mapboxgl-ctrl-measure-line-tool')
        this.lineButton.title = '测距'
        this.lineButton.innerHTML = iconRuler
        this.container.appendChild(this.lineButton)

        // 测面
        this.areaButton = document.createElement('button')
        this.areaButton.classList.add('mapboxgl-ctrl-measure-area-tool')
        this.areaButton.title = '测面'
        this.areaButton.innerHTML = iconArea
        this.container.appendChild(this.areaButton)
    }

    onRemove () {
        this.container.parentNode.removeChild(this.container)
        this.map = undefined
    }
}

export default MapMeasureTool
