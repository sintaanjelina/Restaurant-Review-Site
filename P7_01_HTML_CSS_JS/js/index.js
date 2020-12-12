import App from './App.js'
import Marker from './Marker.js'
import Restaurant from './Restaurant.js'
import Review from './Review.js'

const google = window.google

//dom element needed
const sortByStarDiv = document.getElementById('sortByStarDiv')
const infoPanel = document.getElementById('panel')
const infoRestaurantDetails = document.getElementById('restaurant-details')
const restoDetailsImages = document.getElementById('photo')
const restoDetailsCardBody = document.querySelector('#restaurant-details .card-body')
const submitReviewButton = document.getElementById('submit-review-button')
const createReviewButton = document.getElementById('create-review-button')
const sortByMinStar = $('#sortByMinStar')
const sortByMaxStar = $('#sortByMaxStar')
const displayMapButton = $('#display-map-button')
const displayListButton = $('#display-list-button')
const closeDetailsButton = $('#close-details-button')

//default position
let currentPosition = {
    lat: 0,
    lng: 0
}

//for storing previously click or opened info Window
let lastOpenInfoWindow = null
let lastOpenInfoRestaurantDetails = null
let lastCircle = '';


const mapElement = document.getElementById('map')
const mapOptions = {
    zoom: 15,
    center: currentPosition
}

const app = new App(google, mapElement, mapOptions)

//if user accept location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {

        currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }

        console.log(currentPosition.lat, currentPosition.lng)
        app.updateMapCenter(currentPosition)
        const userMarkerOptions = {
            position: currentPosition,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                strokeColor: "white",
                strokeWeight: 5,
                fillColor: "blue",
                fillOpacity: 1
            },
            map: app.map
        }

        const userMarker = new Marker(google, userMarkerOptions)

    })
}

//get restaurant example data from json file and start creating its infowindow and event listener
app.getRestaurantExampleJson('js/data.json').then(restaurants => {

    // console.log(app.restaurants)

    for (let i = 0; i < restaurants.length; i++) {
        const restaurant = restaurants[i]

        const marker = restaurant.marker.marker

        // place marker for each restaurant data
        const popUpInfoWindow = new google.maps.InfoWindow

        const popUpCard = document.createElement('div')
        popUpCard.classList.add('card')

        const popUpImage = document.createElement('img')
        popUpImage.src = restaurant.photos ? restaurant.photos[0].getUrl() : 'images/restaurant-icon.png'
        popUpImage.style.height = "4rem"

        popUpImage.alt = restaurant.name + ' image'

        const popUpCardBody = document.createElement('div')
        popUpCardBody.classList.add('card-body')

        const popUpName = document.createElement('h6')
        popUpName.classList.add('card-title', 'px-4')
        popUpName.id = 'info-name'
        popUpName.innerText = restaurant.name

        const popUpRating = document.createElement('p')
        popUpRating.classList.add('my-0')
        popUpRating.id = 'info-rating'
        popUpRating.innerHTML = ' <span class="star"> <span>'
        const popUpRatingSpan = document.createElement('span')
        popUpRatingSpan.classList.add('rating')
        popUpRatingSpan.innerHTML = restaurant.ratings ? restaurant.averageRatings() : 'no rating yet'

        const popUpStarSpan = document.createElement('span')
        popUpStarSpan.class = 'star'

        const popUpVicinity = document.createElement('p')
        popUpVicinity.classList.add('my-1', 'card-text', 'text-muted')
        popUpVicinity.id = 'info-vicinity'
        popUpVicinity.innerText = restaurant.vicinity ? restaurant.vicinity : 'no address details'

        const popUpPhoneNumber = document.createElement('p')
        popUpPhoneNumber.classList.add('my-1', 'card-text')
        popUpPhoneNumber.id = 'info-phone'
        popUpPhoneNumber.innerText = restaurant.formatted_phone_number ? restaurant.formatted_phone_number : 'No Phone number listed'

        const popUpMoreInfoBtn = document.createElement('a')
        popUpMoreInfoBtn.classList.add('btn', 'btn-primary', 'text-white')
        popUpMoreInfoBtn.id = 'moreinfo-button'
        popUpMoreInfoBtn.innerText = 'More Info'

        popUpCardBody.append(popUpName)
        popUpCardBody.append(popUpRating)
        popUpRating.append(popUpRatingSpan)
        popUpRating.append(popUpStarSpan)

        popUpCardBody.append(popUpVicinity)
        popUpCardBody.append(popUpPhoneNumber)
        popUpCardBody.append(popUpMoreInfoBtn)

        popUpCard.append(popUpImage)
        popUpCard.append(popUpCardBody)
        popUpInfoWindow.setContent(popUpCard)

        marker.addListener('click', () => {
            //close previously opened infoWindow clicked in info panel
            if (lastOpenInfoWindow) {
                lastOpenInfoWindow.close()
            }

            if (lastOpenInfoRestaurantDetails) {
                lastOpenInfoRestaurantDetails.classList.add('d-none')
            }

            popUpInfoWindow.setPosition(restaurant.marker.getCoordinate())
            popUpInfoWindow.open(app.map, marker);
            sortByStarDiv.classList.remove('d-none')

            popUpMoreInfoBtn.addEventListener('click', () => {
                infoPanel.classList.add('d-none')
                infoRestaurantDetails.classList.remove('d-none')

                let streetViewServ = new google.maps.StreetViewService();

                streetViewServ.getPanorama({
                    location: restaurant.marker.getCoordinate(),
                    radius: 1000
                }, processStreetViewData);

                let streetViewDiv = document.getElementById('street-view')
                streetViewDiv.classList.remove('d-none')

                function processStreetViewData(data, status) {
                    if (status === "OK") {
                        let panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));
                        panorama.setPano(data.location.pano)
                        panorama.setPov({
                            heading: 440,
                            pitch: 0
                        })
                        panorama.setVisible(true)
                    } else if (status === 'ZERO_RESULTS') {
                        alert(status + " need to retry with more radius... add it");
                    } else {
                        alert(status + " cant do nothing about it bye");
                    }
                }

                restoDetailsImages.src = restaurant.photos ? restaurant.photos[0].getUrl() : 'images/restaurant-icon.png'
                restoDetailsImages.style.height = '4rem'
                restoDetailsImages.alt = restaurant.name + ' image'

                const restoDetails = `<h5 class="card-title ">${restaurant.name}</h5>
            <p class="my-0">Rating: <span  class='ratings'> ${restaurant.averageRatings()}</span><span class="star"> </p><p class="my-0" id="address">Address: ${restaurant.vicinity ? restaurant.vicinity : 'no address details'}</p><p class="my-0" id="telephone">Phone: ${restaurant.formatted_phone_number ? restaurant.formatted_phone_number : 'No Phone number listed'}</p> <h5 class="my-1 py-0"> Reviews </h5>`

                restoDetailsCardBody.innerHTML = restoDetails

                //show all restaurant reviews
                let reviewsDiv = $('#list-reviews')
                reviewsDiv.html(restaurant.displayReviews())


                submitReviewButton.classList.add('d-none')
                createReviewButton.classList.remove('d-none')

                const createReviewDiv = document.getElementById('create-review-div')
                //make sure form is empty everytime more info button is click
                createReviewDiv.innerHTML = ""

                //show review form div when the button is click
                createReviewButton.addEventListener('click', () => {
                    submitReviewButton.classList.remove('d-none')
                    createReviewButton.classList.add('d-none')


                    createReviewDiv.innerHTML = `<div class="card mx-4"><form class="create-review-form-${restaurant.id}" class="px-2">
                                <h4 > Review Form </h4>
                                <div class="form-group">
                                    <label for="your-name">Your Name</label>
                                    <input type="text" class="form-control" id="your-name" placeholder="Your Name" required>
                                </div>
                                <div class="form-group">
                                    <label for="your-rating"> Your Rating</label>
                                    <select class="form-control" id="your-rating" required>
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="your-comment">Your Comment</label>
                                    <textarea class="form-control" id="your-comment" rows="3" required></textarea>
                                </div>
                                </form> </div>`
                })

                //submit review event on click 
                submitReviewButton.addEventListener('click', () => {
                    const newReviewName = $(`.create-review-form-${restaurant.id} #your-name`)
                    const newReviewRating = $(`.create-review-form-${restaurant.id} #your-rating`)
                    const newReviewComment = $(`.create-review-form-${restaurant.id} #your-comment`)

                    //If review form input is not filled cannot be submitted
                    if (!(newReviewName.val() && newReviewRating.val() && newReviewComment.val())) {
                        return
                    }

                    //add the submitted Review new review to the page & restaurant data 
                    let newReviewDetails = new Review(newReviewName.val(), newReviewComment.val(), parseInt(newReviewRating.val()))

                    restaurant.addReview(newReviewDetails)

                    $('.ratings').text(restaurant.averageRatings())
                    $('.rating').text(restaurant.averageRatings())

                    let newReviewContent = '';
                    newReviewContent += `<li class="media mb-4">
                                <img class="mr-3" src="images/profile_photo.png"
                                        } alt="profile image" style="width: 2rem;">
                                    <div class="media-body">
                                        <h5 class="mt-0 mb-1">${newReviewName.val()}  (${newReviewRating.val()}<span class="star"></span>)</h5>
                        ${newReviewComment.val()}
                    </div>
                </li>`

                    // .insertAdjacentHTML("beforeBegin", ...) //$('...').before(...)
                    // .insertAdjacentHTML("afterBegin", ...) //$('...').prepend(...)
                    // .insertAdjacentHTML("beforeEnd", ...) //$('...').append(...)
                    // .insertAdjacentHTML("afterEnd", ...) //$('...').after(...)

                    reviewsDiv.prepend(newReviewContent)
                    submitReviewButton.classList.add('d-none')
                    createReviewButton.classList.remove('d-none')
                    createReviewDiv.innerHTML = ""

                    const bounds = new google.maps.LatLngBounds()
                    const center = app.map.getCenter()


                    const minStarValue = parseInt(sortByMinStar.val())
                    const maxStarValue = parseInt(sortByMaxStar.val())

                    app.displayRestaurants(center, bounds, minStarValue, maxStarValue)
                })

            })
            
            lastOpenInfoRestaurantDetails = infoRestaurantDetails
            lastOpenInfoWindow = popUpInfoWindow
        })

       
    }

    app.addRestaurants(restaurants);

    const bounds = new google.maps.LatLngBounds()
    const center = app.map.getCenter()


    const minStarValue = parseInt(sortByMinStar.val())
    const maxStarValue = parseInt(sortByMaxStar.val())

    app.displayRestaurants(center, bounds, minStarValue, maxStarValue)
})


app.map.addListener("idle", () => {
    //clear side infoPanel results first 
    while (infoPanel.childNodes[0]) {
        infoPanel.removeChild(infoPanel.childNodes[0])
    }


    //clear previous circle
    if (lastCircle) {
        lastCircle.setCenter(null)
    }


    //create circle
    let circle = new google.maps.Circle({
        center: app.map.getCenter(),
        map: app.map,
        radius: 1000,
        fillOpacity: 0.13,
        fillColor: "#FF0000",
    })



    circle.addListener('rightclick', (pin) => {
        const popUpInfoWindow = new google.maps.InfoWindow

        //close restaurant details every time idle bounds change 
        sortByStarDiv.classList.remove('d-none')
        infoRestaurantDetails.classList.add('d-none')

        if (lastOpenInfoWindow) {
            lastOpenInfoWindow.close()
        }


        let newRestaurantLatLng = new google.maps.LatLng(pin.latLng.lat(), pin.latLng.lng())

        let newRestaurantMarker = new google.maps.Marker({
            position: newRestaurantLatLng,
            id: Object.keys(app.restaurants).length + 1
        })


        newRestaurantMarker.setMap(app.map)

        //create form markup
        let popUpFormContent =
            `<h5> Add New restaurant Form </h5>
                      <div class="form-group" >
                          <input class="form-control" id="your-restaurant-lat" value="${newRestaurantMarker.position.lat()}" type="hidden"  >
                      </div>
                      <div class="form-group">
                          <input  class="form-control" id="your-restaurant-lng" value="${newRestaurantMarker.position.lng()}"  type="hidden" >
                      </div>
                      <div class="form-group">
                          <label for="your-restaurant-name">Your Restaurant Name</label>
                          <input type="text" class="form-control" id="your-restaurant-name" placeholder="Your Restaurant Name" required>
                      </div>
                      <div class="form-group">
                          <label for="your-restaurant-address">Your Restaurant Address</label>
                          <input type="text" class="form-control" id="your-restaurant-address" placeholder="Your Restaurant Address" required>
                      </div>`


        const popUpFormCard = document.createElement('div')
        popUpFormCard.id = `new-restaurant-info-${newRestaurantMarker.id}`
        popUpFormCard.classList.add('card')

        const addNewRestaurantButton = document.createElement('button')
        addNewRestaurantButton.classList.add('btn', 'btn-submit', 'mx-4')
        addNewRestaurantButton.id = 'btn-add-restaurant'
        addNewRestaurantButton.textContent = 'Add Restaurant'


        const addNewRestaurantForm = document.createElement('form')
        addNewRestaurantForm.classList.add('px-2', 'py-2', 'add-restaurant-form')

        addNewRestaurantForm.innerHTML = popUpFormContent

        popUpFormCard.append(addNewRestaurantForm)

        popUpFormCard.append(addNewRestaurantButton)

        //create form popup info window
        popUpInfoWindow.setContent(popUpFormCard)

        popUpInfoWindow.setPosition(newRestaurantMarker.getPosition())

        popUpInfoWindow.open(app.map, newRestaurantMarker);




        //click add restaurant button
        addNewRestaurantButton.addEventListener('click', (e) => {
            const bounds = new google.maps.LatLngBounds()
            const center = app.map.getCenter()

            e.preventDefault();

            //create new restaurant added element info window
            const popUpCard = document.createElement('div')
            popUpCard.classList.add('card')

            const popUpImage = document.createElement('img')
            popUpImage.style.height = '3rem'

            const popUpCardBody = document.createElement('div')
            popUpCardBody.classList.add('card-body')

            const popUpName = document.createElement('h6')
            popUpName.classList.add('card-title', 'px-4')
            popUpName.id = 'info-name'

            const popUpRating = document.createElement('p')
            popUpRating.classList.add('my-0')
            popUpRating.id = 'info-rating'
            popUpRating.innerHTML = ' <span class="star"> <span>'
            const popUpRatingSpan = document.createElement('span')
            popUpRatingSpan.classList.add('rating')
            const popUpStarSpan = document.createElement('span')
            popUpStarSpan.class = 'star'

            const popUpVicinity = document.createElement('p')
            popUpVicinity.classList.add('my-1', 'card-text', 'text-muted')
            popUpVicinity.id = 'info-vicinity'

            const popUpPhoneNumber = document.createElement('p')
            popUpPhoneNumber.classList.add('my-1', 'card-text')
            popUpPhoneNumber.id = 'info-phone'

            const popUpMoreInfoBtn = document.createElement('button')
            popUpMoreInfoBtn.classList.add('btn', 'btn-primary', 'text-white')
            popUpMoreInfoBtn.id = 'moreinfo-button'

            popUpCardBody.append(popUpName)
            popUpCardBody.append(popUpRating)
            popUpRating.append(popUpRatingSpan)
            popUpRating.append(popUpStarSpan)

            popUpCardBody.append(popUpVicinity)
            popUpCardBody.append(popUpPhoneNumber)
            popUpCardBody.append(popUpMoreInfoBtn)

            popUpCard.append(popUpImage)
            popUpCard.append(popUpCardBody)


            //get input element from add restaurant form
            let newRestaurantName = $('#your-restaurant-name')
            let newRestaurantAddress = $('#your-restaurant-address')
            let newRestaurantLat = $('#your-restaurant-lat')
            let newRestaurantLng = $('#your-restaurant-lng')
            let newRestaurantPosition = new google.maps.LatLng(newRestaurantLat.val(), newRestaurantLng.val())
            let newRestaurantRating = []


            //create new Restaurant Object and its marker
            const newRestaurantRequest = new Restaurant(newRestaurantMarker.id, newRestaurantName.val(), newRestaurantPosition, newRestaurantRating)
            newRestaurantRequest.rating = 0
            newRestaurantRequest.vicinity = newRestaurantAddress.val()
            newRestaurantRequest.marker = new Marker(google, newRestaurantRequest)
            newRestaurantMarker.setMap(null)
            app.addARestaurant(newRestaurantRequest)
            //add the data to its infowindow element
            popUpImage.src = newRestaurantRequest.photos ? newRestaurantRequest.photos[0].getUrl() : 'images/restaurant-icon.png'
            popUpImage.alt = newRestaurantRequest.name + ' image'

            popUpName.innerText = newRestaurantRequest.name

            popUpRatingSpan.innerHTML = newRestaurantRequest.ratings ? newRestaurantRequest.averageRatings() : 'no rating yet'

            popUpVicinity.innerText = newRestaurantRequest.vicinity ? newRestaurantRequest.vicinity : 'no address details'
            popUpPhoneNumber.innerText = newRestaurantRequest.formatted_phone_number ? newRestaurantRequest.formatted_phone_number : 'No Phone number listed'

            popUpMoreInfoBtn.innerText = 'More Info'

            //close form 
            if (lastOpenInfoWindow) {
                lastOpenInfoWindow.close()
            }


            //after creating marker and its marker if the marker is clicked then open the infowindow and set its content 
            newRestaurantRequest.marker.marker.addListener('click', () => {
                if (lastOpenInfoWindow) {
                    lastOpenInfoWindow.close()
                }
                popUpInfoWindow.setContent(popUpCard)

                popUpInfoWindow.setPosition(newRestaurantRequest.marker.marker.getPosition())
                popUpInfoWindow.open(app.map)
            })

            popUpMoreInfoBtn.addEventListener('click', () => {
                infoPanel.classList.add('d-none')
                // sortByStarDiv.classList.add('d-none')
                infoRestaurantDetails.classList.remove('d-none')

                let streetViewServ = new google.maps.StreetViewService();

                streetViewServ.getPanorama({
                    location: newRestaurantRequest.marker.getCoordinate(),
                    radius: 1000
                }, processStreetViewData);

                let streetViewDiv = document.getElementById('street-view')
                streetViewDiv.classList.remove('d-none')

                function processStreetViewData(data, status) {
                    console.log(status)
                    if (status === "OK") {
                        let panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));
                        panorama.setPano(data.location.pano)
                        panorama.setPov({
                            heading: 10000,
                            pitch: 0
                        })
                        panorama.setVisible(true)
                    } else if (status === 'ZERO_RESULTS') {
                        alert(status + " need to retry with more radius... add it");
                    } else {
                        alert(status + " cant do nothing about it bye");
                    }
                }


                restoDetailsImages.src = newRestaurantRequest.photos ? newRestaurantRequest.photos[0].getUrl() : 'images/restaurant-icon.png'
                restoDetailsImages.alt = newRestaurantRequest.name + ' image'

                const restoDetails = `<h5 class="card-title ">${newRestaurantRequest.name}</h5>
  <p class="my-0">Rating: <span  class='ratings'> ${newRestaurantRequest.averageRatings()}</span><span class="star"> </p><p class="my-0" id="address">Address: ${newRestaurantRequest.vicinity ? newRestaurantRequest.vicinity : 'no address details'}</p><p class="my-0" id="telephone">Phone: ${newRestaurantRequest.formatted_phone_number ? newRestaurantRequest.formatted_phone_number : 'No Phone number listed'}</p> <h5 class="my-1 py-0"> Reviews </h5>`

                restoDetailsCardBody.innerHTML = restoDetails

                //show all restaurant reviews
                let reviewsDiv = $('#list-reviews')
                reviewsDiv.html(newRestaurantRequest.displayReviews())


                submitReviewButton.classList.add('d-none')
                createReviewButton.classList.remove('d-none')

                const createReviewDiv = document.getElementById('create-review-div')
                //make sure form is empty everytime more info button is click
                createReviewDiv.innerHTML = ""

                //show review form div when the button is click
                createReviewButton.addEventListener('click', () => {
                    submitReviewButton.classList.remove('d-none')
                    createReviewButton.classList.add('d-none')


                    createReviewDiv.innerHTML = `<div class="card mx-4"><form class="create-review-form-${newRestaurantRequest.id}" class="px-2">
                      <h4 > Review Form </h4>
                      <div class="form-group">
                          <label for="your-name">Your Name</label>
                          <input type="text" class="form-control" id="your-name" placeholder="Your Name" required>
                      </div>
                      <div class="form-group">
                          <label for="your-rating"> Your Rating</label>
                          <select class="form-control" id="your-rating" required>
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                          </select>
                      </div>
                      <div class="form-group">
                          <label for="your-comment">Your Comment</label>
                          <textarea class="form-control" id="your-comment" rows="3" required></textarea>
                      </div>
                      </form> </div>`
                })

                //submit review event on click 
                submitReviewButton.addEventListener('click', () => {
                    const newReviewName = $(`.create-review-form-${newRestaurantRequest.id} #your-name`)
                    const newReviewRating = $(`.create-review-form-${newRestaurantRequest.id} #your-rating`)
                    const newReviewComment = $(`.create-review-form-${newRestaurantRequest.id} #your-comment`)

                    //If review form input is not filled cannot be submitted
                    if (!(newReviewName.val() && newReviewRating.val() && newReviewComment.val())) {
                        return
                    }

                    //add the submitted Review new review to the page & restaurant data 
                    let newReviewDetails = new Review(newReviewName.val(), newReviewComment.val(), parseInt(newReviewRating.val()))

                    newRestaurantRequest.addReview(newReviewDetails)

                    $('.ratings').text(newRestaurantRequest.averageRatings())
                    $('.rating').text(newRestaurantRequest.averageRatings())

                    let newReviewContent = '';
                    newReviewContent += `<li class="media mb-4">
                      <img class="mr-3" src="images/profile_photo.png"
                              } alt="profile image" style="width: 2rem;">
                          <div class="media-body">
                              <h5 class="mt-0 mb-1">${newReviewName.val()}  (${newReviewRating.val()}<span class="star"></span>)</h5>
              ${newReviewComment.val()}
          </div>
      </li>`


                    // .insertAdjacentHTML("beforeBegin", ...) //$('...').before(...)
                    // .insertAdjacentHTML("afterBegin", ...) //$('...').prepend(...)
                    // .insertAdjacentHTML("beforeEnd", ...) //$('...').append(...)
                    // .insertAdjacentHTML("afterEnd", ...) //$('...').after(...)

                    reviewsDiv.prepend(newReviewContent)

                    submitReviewButton.classList.add('d-none')
                    createReviewButton.classList.remove('d-none')
                    createReviewDiv.innerHTML = ""


                    const bounds = new google.maps.LatLngBounds()
                    const center = app.map.getCenter()


                    //after added check current restaurants app to be shown based on star and place
                    const minStarValue = parseInt(sortByMinStar.val())
                    const maxStarValue = parseInt(sortByMaxStar.val())

                    app.displayRestaurants(center, bounds, minStarValue, maxStarValue)


                })
                const bounds = new google.maps.LatLngBounds()
                const center = app.map.getCenter()


                //after added check current restaurants app to be shown based on star and place
                const minStarValue = parseInt(sortByMinStar.val())
                const maxStarValue = parseInt(sortByMaxStar.val())

                app.displayRestaurants(center, bounds, minStarValue, maxStarValue)
            })
                   

            //after added check current restaurants app to be shown based on star and place
            const minStarValue = parseInt(sortByMinStar.val())
            const maxStarValue = parseInt(sortByMaxStar.val())

            app.displayRestaurants(center, bounds, minStarValue, maxStarValue)

        })

        lastOpenInfoWindow = popUpInfoWindow

        lastOpenInfoRestaurantDetails = infoRestaurantDetails


    })


    lastCircle = circle


    app.getNearbyGooglePlacesRestaurants(app.map.getCenter())
        .then(restaurants => {


            console.log(app.restaurants)

            for (let i = 0; i < restaurants.length; i++) {
                const restaurant = restaurants[i]

                const marker = restaurant.marker.marker

                // place marker for each restaurant data
                const popUpInfoWindow = new google.maps.InfoWindow

                const popUpCard = document.createElement('div')
                popUpCard.classList.add('card')

                const popUpImage = document.createElement('img')
                popUpImage.src = restaurant.photos ? restaurant.photos[0].getUrl() : 'images/restaurant-icon.png'
                popUpImage.style.height = "4rem"

                popUpImage.alt = restaurant.name + ' image'

                const popUpCardBody = document.createElement('div')
                popUpCardBody.classList.add('card-body')

                const popUpName = document.createElement('h6')
                popUpName.classList.add('card-title', 'px-4')
                popUpName.id = 'info-name'
                popUpName.innerText = restaurant.name

                const popUpRating = document.createElement('p')
                popUpRating.classList.add('my-0')
                popUpRating.id = 'info-rating'
                popUpRating.innerHTML = ' <span class="star"> <span>'
                const popUpRatingSpan = document.createElement('span')
                popUpRatingSpan.classList.add('rating')
                popUpRatingSpan.innerHTML = restaurant.ratings ? restaurant.averageRatings() : 'no rating yet'

                const popUpStarSpan = document.createElement('span')
                popUpStarSpan.class = 'star'

                const popUpVicinity = document.createElement('p')
                popUpVicinity.classList.add('my-1', 'card-text', 'text-muted')
                popUpVicinity.id = 'info-vicinity'
                popUpVicinity.innerText = restaurant.vicinity ? restaurant.vicinity : 'no address details'

                const popUpPhoneNumber = document.createElement('p')
                popUpPhoneNumber.classList.add('my-1', 'card-text')
                popUpPhoneNumber.id = 'info-phone'
                popUpPhoneNumber.innerText = restaurant.formatted_phone_number ? restaurant.formatted_phone_number : 'No Phone number listed'

                const popUpMoreInfoBtn = document.createElement('a')
                popUpMoreInfoBtn.classList.add('btn', 'btn-primary', 'text-white')
                popUpMoreInfoBtn.id = 'moreinfo-button'
                popUpMoreInfoBtn.innerText = 'More Info'

                popUpCardBody.append(popUpName)
                popUpCardBody.append(popUpRating)
                popUpRating.append(popUpRatingSpan)
                popUpRating.append(popUpStarSpan)

                popUpCardBody.append(popUpVicinity)
                popUpCardBody.append(popUpPhoneNumber)
                popUpCardBody.append(popUpMoreInfoBtn)

                popUpCard.append(popUpImage)
                popUpCard.append(popUpCardBody)
                popUpInfoWindow.setContent(popUpCard)

                marker.addListener('click', () => {
                    //close previously opened infoWindow clicked in info panel
                    if (lastOpenInfoWindow) {
                        lastOpenInfoWindow.close()
                    }

                    if (lastOpenInfoRestaurantDetails) {
                        lastOpenInfoRestaurantDetails.classList.add('d-none')
                    }

                    popUpInfoWindow.setPosition(restaurant.marker.getCoordinate())
                    popUpInfoWindow.open(app.map, marker);
                    // infoPanel.classList.remove('d-none')
                    sortByStarDiv.classList.remove('d-none')

                    popUpMoreInfoBtn.addEventListener('click', () => {
                        infoPanel.classList.add('d-none')
                        // sortByStarDiv.classList.add('d-none')
                        infoRestaurantDetails.classList.remove('d-none')

                        let streetViewServ = new google.maps.StreetViewService();

                        streetViewServ.getPanorama({
                            location: restaurant.marker.getCoordinate(),
                            radius: 1000
                        }, processStreetViewData);

                        let streetViewDiv = document.getElementById('street-view')
                        streetViewDiv.classList.remove('d-none')

                        function processStreetViewData(data, status) {
                            if (status === "OK") {
                                let panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));
                                panorama.setPano(data.location.pano)
                                panorama.setPov({
                                    heading: 440,
                                    pitch: 0
                                })
                                panorama.setVisible(true)
                            } else if (status === 'ZERO_RESULTS') {
                                alert(status + " need to retry with more radius... add it");
                            } else {
                                alert(status + " cant do nothing about it bye");
                            }
                        }

                        restoDetailsImages.src = restaurant.photos ? restaurant.photos[0].getUrl() : 'images/restaurant-icon.png'
                        restoDetailsImages.style.height = '4rem'
                        restoDetailsImages.alt = restaurant.name + ' image'

                        const restoDetails = `<h5 class="card-title ">${restaurant.name}</h5>
            <p class="my-0">Rating: <span  class='ratings'> ${restaurant.averageRatings()}</span><span class="star"> </p><p class="my-0" id="address">Address: ${restaurant.vicinity ? restaurant.vicinity : 'no address details'}</p><p class="my-0" id="telephone">Phone: ${restaurant.formatted_phone_number ? restaurant.formatted_phone_number : 'No Phone number listed'}</p> <h5 class="my-1 py-0"> Reviews </h5>`

                        restoDetailsCardBody.innerHTML = restoDetails

                        //show all restaurant reviews
                        let reviewsDiv = $('#list-reviews')
                        reviewsDiv.html(restaurant.displayReviews())


                        submitReviewButton.classList.add('d-none')
                        createReviewButton.classList.remove('d-none')

                        const createReviewDiv = document.getElementById('create-review-div')
                        //make sure form is empty everytime more info button is click
                        createReviewDiv.innerHTML = ""

                        //show review form div when the button is click
                        createReviewButton.addEventListener('click', () => {
                            submitReviewButton.classList.remove('d-none')
                            createReviewButton.classList.add('d-none')


                            createReviewDiv.innerHTML = `<div class="card mx-4"><form class="create-review-form-${restaurant.id}" class="px-2">
                                <h4 > Review Form </h4>
                                <div class="form-group">
                                    <label for="your-name">Your Name</label>
                                    <input type="text" class="form-control" id="your-name" placeholder="Your Name" required>
                                </div>
                                <div class="form-group">
                                    <label for="your-rating"> Your Rating</label>
                                    <select class="form-control" id="your-rating" required>
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="your-comment">Your Comment</label>
                                    <textarea class="form-control" id="your-comment" rows="3" required></textarea>
                                </div>
                                </form> </div>`
                        })

                        //submit review event on click 
                        submitReviewButton.addEventListener('click', () => {
                            const newReviewName = $(`.create-review-form-${restaurant.id} #your-name`)
                            const newReviewRating = $(`.create-review-form-${restaurant.id} #your-rating`)
                            const newReviewComment = $(`.create-review-form-${restaurant.id} #your-comment`)

                            //If review form input is not filled cannot be submitted
                            if (!(newReviewName.val() && newReviewRating.val() && newReviewComment.val())) {
                                return
                            }

                            //add the submitted Review new review to the page & restaurant data 
                            let newReviewDetails = new Review(newReviewName.val(), newReviewComment.val(), parseInt(newReviewRating.val()))

                            restaurant.addReview(newReviewDetails)

                            $('.ratings').text(restaurant.averageRatings())
                            $('.rating').text(restaurant.averageRatings())

                            let newReviewContent = '';
                            newReviewContent += `<li class="media mb-4">
                                <img class="mr-3" src="images/profile_photo.png"
                                        } alt="profile image" style="width: 2rem;">
                                    <div class="media-body">
                                        <h5 class="mt-0 mb-1">${newReviewName.val()}  (${newReviewRating.val()}<span class="star"></span>)</h5>
                        ${newReviewComment.val()}
                    </div>
                </li>`

                            // .insertAdjacentHTML("beforeBegin", ...) //$('...').before(...)
                            // .insertAdjacentHTML("afterBegin", ...) //$('...').prepend(...)
                            // .insertAdjacentHTML("beforeEnd", ...) //$('...').append(...)
                            // .insertAdjacentHTML("afterEnd", ...) //$('...').after(...)

                            reviewsDiv.prepend(newReviewContent)
                            submitReviewButton.classList.add('d-none')
                            createReviewButton.classList.remove('d-none')
                            createReviewDiv.innerHTML = ""

                            const bounds = new google.maps.LatLngBounds()
                            const center = app.map.getCenter()


                            const minStarValue = parseInt(sortByMinStar.val())
                            const maxStarValue = parseInt(sortByMaxStar.val())

                            app.displayRestaurants(center, bounds, minStarValue, maxStarValue)
                        })

                    })
                    lastOpenInfoRestaurantDetails = infoRestaurantDetails
                    lastOpenInfoWindow = popUpInfoWindow
                })

            }
            app.addRestaurants(restaurants);

            const center = app.map.getCenter()
            const bounds = new google.maps.LatLngBounds()

            const minStarValue = parseInt(sortByMinStar.val())
            const maxStarValue = parseInt(sortByMaxStar.val())

            app.displayRestaurants(center, bounds, minStarValue, maxStarValue)
        });

})

sortByMinStar.on('change', function () {
    const center = app.map.getCenter()
    const bounds = new google.maps.LatLngBounds()
    const minStarValue = parseInt(sortByMinStar.val())
    const maxStarValue = parseInt(sortByMaxStar.val())

    const nodeSortByMaxStar = document.getElementById('sortByMaxStar')

    //disabled option maxstar if max star option value is less than min star 
    for (let i = 0; i < nodeSortByMaxStar.children.length; i++) {
        const option = nodeSortByMaxStar.children[i]
        const value = option.value
        option.disabled = value < minStarValue
    }
    app.displayRestaurants(center, bounds, minStarValue, maxStarValue)
})

sortByMaxStar.on('change', function () {
    const center = app.map.getCenter()
    const bounds = new google.maps.LatLngBounds()
    const minStarValue = parseInt(sortByMinStar.val())
    const maxStarValue = parseInt(sortByMaxStar.val())

    const nodeSortByMinStar = document.getElementById('sortByMinStar')

    //disabled option minstar if minstar option value is bigger than max star 
    for (let i = 0; i < nodeSortByMinStar.children.length; i++) {
        const option = nodeSortByMinStar.children[i]
        const value = option.value

        option.disabled = value > maxStarValue
    }


    app.displayRestaurants(center, bounds, minStarValue, maxStarValue)
})

displayMapButton.on('click', function () {
    infoPanel.classList.add('d-none')
    mapElement.classList.remove('d-none')
})

displayListButton.on('click', function () {
    mapElement.classList.add('d-none')
    infoPanel.classList.remove('d-none')
})

closeDetailsButton.on('click', function () {
    infoRestaurantDetails.classList.add('d-none')
})


