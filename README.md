## Game for cognitive science research

Build on Express, Socket.io, React, Rx, [Redux](https://github.com/gaearon/redux), Mongodb

```
$ npm intall
$ npm run dev
$ browser http://localhost:3000
```

Game is described in ttcg.pdf file in root directory. File is work in progress and is not yet fully translated to english.

Flow of the experiment session is:
- /setup - create a new testing session
- / - join game, all 3 roles needs to join for game to be ready
- /game - play the game, use arrows to move the token on grid
- /progress - progress page to display progress for all games being played

game ends when the timer ends or is terminated from /setup page

##TODO
- merge shared and client folder
- refactor to use redux store on server, fe should just fire actions
- remove rest api and use only sockets
- add tests
- implement reconnect functionality for players
- error handling
- change styling to more subtle colors
- refactor modals
- finish this markdown
