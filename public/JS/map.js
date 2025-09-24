const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/streets/style.json?key=${mapToken}`,
    center: listing.geometry.coordinates,   // [Longitue, Latitude]
    zoom: 15
});

map.addControl(new maplibregl.NavigationControl());

const marker = new maplibregl.Marker({color: "red"})
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new maplibregl.Popup({ offset: 25 }) // add popups
      .setHTML(`<h4>${listing.location}</h4><p>Exact location provided after booking</p>`)
  )
  .addTo(map);
