export default class Restaurant {
    constructor(id, name, position, ratings) {
        this.id = id
        this.name = name
        this.position = position
        this.ratings = ratings
        this.marker = null
    }
    addReview(newReview) {
        this.ratings.push(newReview)
    }
    averageRatings() {
        if(this.ratings) {
            let calculatedRating= 0
            if (this.ratings.length == 0) {
                if (this.rating) {
                    calculatedRating += this.rating                 
                }
            }
            else {
                let totalStar = []
                for (let i = 0; i < this.ratings.length; i++) {
                    totalStar.push(this.ratings[i].star)
                }
                calculatedRating = (Math.ceil(totalStar.reduce((a, b) => a + b, 0) / this.ratings.length))
            }

            this.rating = calculatedRating
            return calculatedRating
        }
    }

    displayReviews() {
        let reviewsContent = ''

        if (this.ratings.length > 0) {
            for (let j = this.ratings.length - 1; j >= 0; j--) {
                let rating = this.ratings[j]
                reviewsContent += `<li class="media mb-4">
                            <img class="mr-3" src=${rating.profile_photo_url ? rating.profile_photo_url : "images/profile_photo.png"
                    } alt="profile image" style="width: 2rem;">
                                <div class="media-body">
                                    <h5 class="mt-0 mb-1">${rating.author}  (${rating.star}<span class="star"></span>)</h5>
                    ${rating.comment}
                </div>
            </li>`
            }
            return reviewsContent
        } else {
            return ''
        }
    }
}