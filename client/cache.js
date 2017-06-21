const Cache = {
    data: {},

    get: (store = 'APP', key) => (Cache.data && Cache.data[store]) ? Cache.data[store][key] : undefined,

    set: (store = 'APP', key, value) => {
        if (!Cache.data) Cache.data = {}
        if (!Cache.data[store]) Cache.data[store] = {}
        return Cache.data[store][key] = value
    }
}
