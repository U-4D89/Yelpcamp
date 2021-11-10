
mapboxgl.accessToken = 'pk.eyJ1IjoiZHllb21kYW5pIiwiYSI6ImNrdmp5ZzZzdDJwcmsyd255dTg1dmZ4dGgifQ.5LzZt_y-Nj3AloZ7Jx7MkA';
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 15 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 5 })
            .setHTML(
                `<p><b>${campground.title}</b>, <br> ${campground.location}</p>`
            )
    )
    .addTo(map)