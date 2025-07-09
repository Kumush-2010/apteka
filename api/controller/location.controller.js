
function extractLatLngFromGoogleMap(url) {
    const regex = /[?@](-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex)
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
    }
    return null
}

function extractLatLngFromYandexMap(url) {
    const regex = /ll=(-?\d+\.\d+)%2C(-?\d+\.\d+)/;
    const match = url.match(regex)
    if (match) {
        return { lat: parseFloat(match[2]), lng: parseFloat(match[1]) }
    }
    return null
}

function extractLatLngFromMapUrl(url) {
    if (url.includes("google.com/maps")) {
        return extractLatLngFromGoogleMap(url)
    } else if (url.includes("yandex.com/maps") || url.includes("yandex.uz/maps")) {
        return extractLatLngFromYandexMap(url)
    } else {
        throw new Error('Xarita havolasi notoʻgʻri')
    }
}

export default extractLatLngFromMapUrl