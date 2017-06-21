const HTTP = {
    // HTTP POST request
    post: (url, data) => new Promise((resolve, reject) => {
        var request = new XMLHttpRequest()
        request.open('POST', url, true)
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                resolve(JSON.parse(request.responseText))
            } else {
                const response = JSON.parse(request.responseText)
                if (response.error) {
                    reject(response.message)
                }
            }
        }

        request.onerror = function() {
            reject({ message:'Connection Error', error: true })
        }

        const params = HTTP.params(data)
        request.send(params)
    }),

    // HTTP GET request
    get: (url, data) => new Promise((resolve, reject) => {
        var request = new XMLHttpRequest()
        request.open('GET', url + '?' + HTTP.params(data), true)

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                resolve(JSON.parse(request.responseText))
            } else {
                reject(JSON.parse(request.responseText))
            }
        }

        request.onerror = function() {
            reject({ message:'Connection Error', error: true })
        }

        request.send()
    }),

    // Serialise form data
    params: (data) => {
        return Object.keys(data).map((key) => {
            if (Array.isArray(data[key])) {
                return data[key].map(value => key + '[]=' + encodeURIComponent(value)).join('&')
            } else {
                return key + '=' + encodeURIComponent(data[key])
            }
        }).join('&')
    }
}
