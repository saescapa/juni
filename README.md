# Juni

Writing-Assistant.

TODO

### Structure
- Front-End - Detects:
  - Command
    - Asks API for results, gives back:
      - (Depending on API) - all possible info that might be used at once.
      - Error
  - Change
    - Replaces with alt up or down with more options, until user presses space.

Information comes in packages (aka different APIs), multiple commands have same
API usage, so packages are used to extract the data only once.

Packages:
- 1: bighugelabs - synonyms, antonyms and usr(?)

### Commands:

- 's' -> Synonym from PACKAGE 1
- 'a' -> Antonym from PACKAGE 1
- 'u' -> ?? from PACKAGE 1

### TODO List
- Instructions
- README
- UI
- History
- A lot more.
- Restrict .post requests
- Detect part of speech for more accuracy.

### Features
- [x] Commands (see [commands](#commands))
- [x] Color on possible command.
- [x] Store info on front-end for future use.
- [x] Color on possible change.
- [x] Can change between different options.
- [ ] A lot more
