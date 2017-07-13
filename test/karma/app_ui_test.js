

describe('App UI', function () {
  it('renders boxes', function () {
    const ui = {
      initProgress: sinon.spy()
    }
    const http = {
      post: sinon.stub().returns(Promise.resolve({ tournamentId: 0, matchUps: [] }))
    }
    const app = new App({ ui, http })
    return app.getTournament({
      teamsPerMatch: 2,
      numberOfTeams: 4
    }).then(_ => expect(ui.initProgress).calledWith(3)
      )
  });
});
