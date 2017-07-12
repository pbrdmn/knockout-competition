// Writing unit tests is entirely optional for the challenge.
// However we have included this unit test harness should you prefer to develop in a TDD environment.

// http://chaijs.com/api
// https://mochajs.org
// http://sinonjs.org/docs

describe('App', function () {
  it('creates a new App', function () {
    app = new App({})
    expect(typeof app).to.equal('object')
  })

  it('creates a tournament', function () {
    const http = {
      post: (a, b, c) => {
        return Promise.resolve({
          tournamentId: 1,
          matchUps: 'matchUps'
        })
      }
    }
    const app = new App({ http })
    const p = app.createTournament({
      teamsPerMatch: 2,
      numberOfTeams: 2
    })
    return p
  })

  it('gets a tournament', function () {
    const http = {
      post: sinon.stub().returns(Promise.resolve({
        tournamentId: 1,
        matchUps: 'matchUps'
      }))
    }
    const app = new App({ http })
    const p = app.getTournament({
      teamsPerMatch: 2,
      numberOfTeams: 2
    })
    expect(http.post.callCount).to.equal(1)
    return p
  })

  it('fetches a team from cache', function () {
    const app = new App({})
    const team0 = {
      teamId: 0,
      name: "team-one",
      score: 1
    }
    app.teams = { 0: team0 }
    return app.findTeam({ teamId: 0 })
      .then(team => {
        expect(team).to.equal(team0)
      })
  })

  it('fetches a team from http', function () {
    const team0 = {
      teamId: 0,
      name: "team-one",
      score: 1
    }
    const http = {
      get: sinon.stub().returns(Promise.resolve(team0))
    }
    const app = new App({ http })
    app.teams = {}
    return app.findTeam({ teamId: 0 })
      .then(team => {
        expect(http.get.callCount).to.equal(1)
        expect(team).to.equal(team0)
      })
  })

  it('gets a team', function () {
    const http = {
      get: sinon.stub().returns(Promise.resolve({
        teamId: 0,
        name: "team-name",
        score: 1
      }))
    }
    const app = new App({ http })
    app.teams = {}
    const p = app.getTeam(0, {
      tournamentId: 0,
      teamId: 0
    })
    expect(http.get.callCount).to.equal(1)
    return p
  })


  // it('passes', function () {
  //   expect(2 + 2).to.equal(4);
  // });

  // it('supports spies', function () {
  //   var spy = sinon.spy();
  //   spy();
  //   expect(spy.callCount).to.equal(1);
  // });

  // it('supports stubs', function () {
  //   var stub = sinon.stub().returns(42);
  //   expect(stub()).to.equal(42);
  // });
});
