class HTTP {
  constructor(params) {
    const defaults = { rateLimit: false, connectionsLimit: 6 };
    const options = Object.assign({}, defaults, params);

    // API rateLimit in requests per second
    this.rateLimit = options.rateLimit;

    // Maximum number of simultaneous connections
    // Note: XMLHttpRequest has a limit of 6 connections per domain
    // https://stackoverflow.com/a/985704
    this.connectionsLimit = options.connectionsLimit;

    this.useQueue = this.connectionsLimit || this.rateLimit;

    if (this.useQueue) {
      this.queue = [];
      if (this.rateLimit) {
        setInterval(() => {
          this.maintainRateLimit();
        }, 1000 / this.rateLimit);
      } else if (this.connectionsLimit) {
        this.connections = 0;
        setInterval(() => {
          this.maintainConnectionsLimit();
        }, 10);
      }
    }
  }

  maintainConnectionsLimit() {
    while (this.queue.length && this.connections < this.connectionsLimit) {
      const { request, params } = this.queue.shift();
      request.send(params);
      this.connections++;
    }
  }

  maintainRateLimit() {
    if (this.queue.length) {
      const { request, params } = this.queue.shift();
      request.send(params);
    }
  }

  send(p, request, params) {
    if (this.useQueue) {
      this.queue.push({ p, request, params });
      this.queue = this.queue.sort((a, b) => a.p - b.p);
    } else request.send(params);
  }

  // HTTP POST request
  post(priority, url, data) {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.open("POST", url, true);
      request.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
      );

      request.onload = () => {
        this.connections--;
        if (request.status >= 200 && request.status < 400) {
          resolve(JSON.parse(request.responseText));
        } else {
          const response = JSON.parse(request.responseText);
          if (response.error) {
            reject(response.message);
          }
        }
      };

      request.onerror = () => {
        this.connections--;
        reject({ message: "Connection Error", error: true });
      };

      this.send(priority, request, this.params(data));
    });
  }

  // HTTP GET request
  get(priority, url, data) {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.open("GET", url + "?" + this.params(data), true);

      request.onload = () => {
        this.connections--;
        if (request.status >= 200 && request.status < 400) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject(JSON.parse(request.responseText));
        }
      };

      request.onerror = () => {
        this.connections--;
        reject({ message: "Connection Error", error: true });
      };

      this.send(priority, request);
    });
  }

  // Serialise form data
  params(data) {
    return Object.keys(data)
      .map((key) => {
        if (Array.isArray(data[key])) {
          return data[key]
            .map((value) => key + "[]=" + encodeURIComponent(value))
            .join("&");
        } else {
          return key + "=" + encodeURIComponent(data[key]);
        }
      })
      .join("&");
  }
}
