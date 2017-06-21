// Simple two-dimensional structure

const Cache = {
    data: {},

    // retrieve stored values by store, key
    get: (store = 'APP', key) => (Cache.data && Cache.data[store]) ? Cache.data[store][key] : undefined,

    // setup objects and store value
    set: (store = 'APP', key, value) => {
        if (!Cache.data) Cache.data = {}
        if (!Cache.data[store]) Cache.data[store] = {}
        return Cache.data[store][key] = value
    }
}
