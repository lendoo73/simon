# [simon](https://cselko.offyoucode.co.uk/fcc/take_home/simon/)

<a href="https://www.freecodecamp.org/learn/coding-interview-prep/take-home-projects/build-a-simon-game" target="_blank">Build a Simon Game</a>

This is a FreeCodeCamp inspired project.

I did not followed strictly the user story because I did not want to build another circle- or square- or triangle-style Simon game.
I tried to realize my own ideas:
  - The menu a bit tricky: (click on...)
      Alien-mouth: change strict mode on/off
      Alien-eye: left: lower difficulty, right: raise: difficulty
      Alien-forehead: start game
      Info window on bottom: Click: open Hall of Fame
  - you can find 3 difficulty:
      - Simon
      - Super-human
      - Alien-intelligence
  - I made some animations with css
  - I also made a Hall of Fame where stored the records of players. I did not use database, instead I save  the data to json files. Only  the top 10 players saved (name with country, date and performed turn).
  - If you choose strict mode: on, then you can save your record.
  - Info and restart button: hidden on top by default. Hover over the top area to open it.
