# Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

### User Input

shuffle question in sentence-correction

*Listed directory [games](file:///d:/CHAD/GRAMMAR%20TREATS%20APRIL%209%20FINALE/Grammar%20Treatsv15.13/games) *

*Listed directory [sentence-correction](file:///d:/CHAD/GRAMMAR%20TREATS%20APRIL%209%20FINALE/Grammar%20Treatsv15.13/games/sentence-correction) *

*Viewed [correction.js](file:///d:/CHAD/GRAMMAR%20TREATS%20APRIL%209%20FINALE/Grammar%20Treatsv15.13/games/sentence-correction/correction.js) *

*Grep searched codebase*

*Grep searched codebase*

*Grep searched codebase*

*Viewed [correction.js](file:///d:/CHAD/GRAMMAR%20TREATS%20APRIL%209%20FINALE/Grammar%20Treatsv15.13/games/sentence-correction/correction.js) *

*Edited relevant file*

*Viewed [correction.js](file:///d:/CHAD/GRAMMAR%20TREATS%20APRIL%209%20FINALE/Grammar%20Treatsv15.13/games/sentence-correction/correction.js) *

### Planner Response

I have implemented question shuffling for the **Sentence Correction** game.

### Changes Made:
- Added a `shuffleQuestions` function in `correction.js` that uses the Fisher-Yates algorithm to randomize the `questions` array.
- Updated the `initGame` function to call `shuffleQuestions()` at the start of every session, ensuring players receive questions in a different order each time they play.

You can now test the game, and you should see that the question sequence is randomized.