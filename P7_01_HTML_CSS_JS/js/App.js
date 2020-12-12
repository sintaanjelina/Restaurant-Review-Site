import Marker from './Marker.js'
import Restaurant from './Restaurant.js'

const infoPanel = document.getElementById('panel')

export default class App {
    constructor(google, mapElement, mapOptions) {
        this.restaurants = []
        this.map = new google.maps.Map(mapElement, mapOptions)
        this.google = google
    }

    updateMapCenter(position) {
        this.map.setCenter(position)
    }

    getNearbyGooglePlacesRestaurants(center) {
        return new Promise((resolve, reject) => {
            let places = new this.google.maps.places.PlacesService(this.map)

            let request = {
                location: center,
                radius: 1000,
                types: ['restaurant']
            }

            places.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    const restaurants = []
                    for (let i = 0; i < results.length; i++) {
                        const result = results[i]
                        const newRestaurant = new Restaurant(result.place_id, result.name, result.geometry.location, [], null)
                        newRestaurant.rating = result.rating
                        newRestaurant.vicinity = result.vicinity
                        newRestaurant.photos = result.photos
                        newRestaurant.formatted_phone_number = newRestaurant.formatted_phone_number
                        newRestaurant.marker = new Marker(google, newRestaurant)
                        // console.log(result)
                        restaurants.push(newRestaurant)
                    }
                    resolve(restaurants)

                } else {
                    const error = new Error('no place found')

                    reject(error)
                }
            })
        })
    }
    getRestaurantExampleJson(url) {
        return new Promise((resolve, reject) => {
            fetch(url).then(response => response.json()).then(responses => {
                if (responses.length !== 0) {
                    const restaurants = []
                    for (let i = 0; i < responses.length; i++) {
                        const restaurant = responses[i]
                        const responsePosition = new google.maps.LatLng(restaurant.position.lat, restaurant.position.lng)
                        const newRestaurant = new Restaurant(restaurant.placeId, restaurant.restaurantName, responsePosition, restaurant.ratings)
                        newRestaurant.rating = newRestaurant.averageRatings() 
                        newRestaurant.marker = new Marker(google, newRestaurant)
                        restaurants.push(newRestaurant)
                    }
                    resolve(restaurants)
                } else {
                    const error = new Error('no data in json file')

                    reject(error)
                }
            })
        })
    }
    getRestaurantByRating(star) {
        let results = []
        for (let i = 0; i < this.restaurants.length; i++) {
            const restaurant = this.restaurants[i]

            if (restaurant.rating >= star && restaurant.rating < star + 1) {
                results.push(restaurant)
            }
        }
        console.log('results', results)
        return results
    }

    displayRestaurants(center, bounds, minStar = 0, maxStar = 5) {
        infoPanel.innerHTML = ''
        console.log('display', this.restaurants)
        for (let i = 0; i < this.restaurants.length; i++) {
            const restaurant = this.restaurants[i]

            if (google.maps.geometry.spherical.computeDistanceBetween(restaurant.marker.getCoordinate(), center) < 1000 && restaurant.rating >= minStar && restaurant.rating <= maxStar) {
                bounds.extend(restaurant.marker.getCoordinate())

                const marker = restaurant.marker;

                marker.placeOnMap(this.map)

                //add info panel with list card of data
                let card = document.createElement('div')
                card.classList.add('card', 'my-3');
                card.id = restaurant.id
                card.onclick = function () {
                    google.maps.event.trigger(marker.marker, 'click')
                }

                let details = `<div class="card-body"><div class="row px-2">
              <img src="${restaurant.photos ? restaurant.photos[0].getUrl() : 'images/restaurant-icon.png'}" style="height: 4rem; width: 6rem" id="infoPanelImage"> <div class="col">
              <h5 class="card-title">${restaurant.name}</h5>
<p class="my-0">Rating: <span  class='ratings'> ${restaurant.averageRatings()}</span>✮</p></div></div></div>`

                card.insertAdjacentHTML("beforeEnd", details);

                infoPanel.appendChild(card);

            } else {
                restaurant.marker.placeOnMap(null);
            }
        }
    }

    //compare the value that exist in newRestaurant that has not exist in current restaurant arr when we want to add restaurants from google later
    comparer(newRestaurants) {
        return function (currentRestaurants) {
            return newRestaurants.filter(function (newRestaurant) {
                return newRestaurant.id == currentRestaurants.id
            }).length == 0;
        }
    }

    //add restaurants array 
    addRestaurants(restaurantArr) {
        let notYetExist = restaurantArr.filter(this.comparer(this.restaurants))
        if (notYetExist) {
            for (let i = 0; i < notYetExist.length; i++) {
                this.restaurants.push(notYetExist[i])
            }
        }
    }

    //add a restaurant
    addARestaurant(restaurant) {
        let restaurants = this.restaurants.filter(item => {
            if (restaurant.id !== item.id) {
                return restaurant
            }
        })
        if (restaurants) {
            this.restaurants.push(restaurant)
        }
    }
}
