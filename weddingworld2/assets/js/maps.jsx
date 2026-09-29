/**
 * Wedding Venue & Maps Helpers
 */

function getGoogleMapsUrl(place) {
  if (!place) return '#';
  if (place.googleMapsUrl) return place.googleMapsUrl;
  if (place.latitude && place.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  }
  return '#';
}

/** Small "Find the Venue" / "View Location" link used in timeline & moments cards. */
function MapButton({ place, label }) {
  const url = getGoogleMapsUrl(place);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-gold-outline">
      <i className="fa-solid fa-location-dot" style={{ marginRight: '6px' }}></i>
      <span>{label || 'View Location'}</span>
    </a>
  );
}
