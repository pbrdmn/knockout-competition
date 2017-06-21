// Simple two-dimensional structure

const Cache = {
    teams: {},

    // retrieve stored values by store, key
    get: (key) => (Cache.teams[key]) ? Cache.teams[key] : undefined,

    // setup objects and store value
    set: (key, value) => {
        if (!Cache.teams) Cache.teams = {}
        return Cache.teams[key] = value
    },

    // remove objects from store
    clear: (key) => (Cache.teams[key]) ? delete Cache.teams[key] : null
}
