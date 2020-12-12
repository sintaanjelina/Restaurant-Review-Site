export default class Marker {
    constructor(google, markerOptions) {
        this.marker = new google.maps.Marker(markerOptions)
    }
    updateIcon(iconOption) {
        this.marker.setIcon(iconOption)
    }
    placeOnMap(map) {
        this.marker.setMap(map)
    }
    getCoordinate() {
        return this.marker.getPosition()
    }
}
