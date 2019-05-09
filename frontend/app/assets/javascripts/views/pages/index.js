/*
Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import PageExploreDialects from './explore/archive/dialects'
import PageExploreFamily from './explore/family'
import PageExploreLanguage from './explore/language'
import PageExploreDialect from './explore/dialect'

import PageDialectLearn from './explore/dialect/learn'
import PageDialectMedia from './explore/dialect/media'
import PageDialectPlay from './explore/dialect/play'

import PageJigsawGame from './explore/dialect/play/jigsaw'
import PageWordSearch from './explore/dialect/play/wordsearch'
import PageColouringBook from './explore/dialect/play/colouringbook'
import PagePictureThis from './explore/dialect/play/picturethis'
import PageHangman from './explore/dialect/play/hangman'
import PageWordscramble from './explore/dialect/play/wordscramble'
import PageQuiz from './explore/dialect/play/quiz'
import PageConcentration from './explore/dialect/play/concentration'

import PageDialectGalleries from './explore/dialect/gallery'
import PageDialectGalleryView from './explore/dialect/gallery/view'
import PageDialectReports from './explore/dialect/reports'
import PageDialectReportsView from './explore/dialect/reports/view'
import PageDialectUsers from './explore/dialect/users'

import PageDialectLearnWords from './explore/dialect/learn/words'
import PageDialectLearnPhrases from './explore/dialect/learn/phrases'
import PageDialectLearnStoriesAndSongs from './explore/dialect/learn/songs-stories'

import PageDialectViewMedia from './explore/dialect/media/view'
import PageDialectViewWord from './explore/dialect/learn/words/view'
import PageDialectViewPhrase from './explore/dialect/learn/phrases/view'
import PageDialectViewBook from './explore/dialect/learn/songs-stories/view'
import PageDialectViewAlphabet from './explore/dialect/learn/alphabet/'
import PageDialectViewCharacter from './explore/dialect/learn/alphabet/view'
import PageDialectLearnWordsCategories from './explore/dialect/learn/words/categories'
import PageDialectLearnPhrasesCategories from './explore/dialect/learn/phrases/categories'

import PageTest from './test.js'
import PageDebugAPI from './debug-api.js'
import PageError from './error.js'
import PageHome from './home'
import PageContent from './content'
import PageIntro from './intro'
import PagePlay from './play'
import PageSearch from './search'
import PageTasks from './tasks'
import PageUserTasks from './tasks/users'
import PageUsersRegister from './users/register'
import PageUsersForgotPassword from './users/forgotpassword'
import PageUsersProfile from './users/profile'

// KIDS
import PageKidsHome from './kids/home'

// EDIT
import PageExploreDialectEdit from './explore/dialect/edit'
import PageDialectGalleryEdit from './explore/dialect/gallery/edit'
import PageDialectEditMedia from './explore/dialect/media/edit'
import PageDialectWordEdit from './explore/dialect/learn/words/edit'
import PageDialectPhraseEdit from './explore/dialect/learn/phrases/edit'
import PageDialectBookEdit from './explore/dialect/learn/songs-stories/edit'
import PageDialectBookEntryEdit from './explore/dialect/learn/songs-stories/entry/edit'
import PageDialectAlphabetCharacterEdit from './explore/dialect/learn/alphabet/edit'

// CREATE
import { default as PageDialectWordsCreate } from './explore/dialect/learn/words/create'
import { default as CreateV2 } from './explore/dialect/create/Word'
import { default as CreateAudio } from './explore/dialect/create/Audio'
import { default as CreateRecorder } from './explore/dialect/create/Recorder'
import { default as PageDialectPhrasesCreate } from './explore/dialect/learn/phrases/create'
import { default as PageDialectStoriesAndSongsCreate } from './explore/dialect/learn/songs-stories/create'
import { default as PageDialectStoriesAndSongsBookEntryCreate } from './explore/dialect/learn/songs-stories/entry/create'
import { default as PageDialectGalleryCreate } from './explore/dialect/gallery/create'
import { default as PageDialectCategoryCreate } from './explore/dialect/category/create'
import { default as PageDialectPhraseBooksCreate } from './explore/dialect/phrasebooks/create'
import { default as PageDialectContributorsCreate } from './explore/dialect/contributors/create'

export {
  PageTest,
  PageDebugAPI,
  PageError,
  PageIntro,
  PageHome,
  PageContent,
  PageExploreDialects,
  PageExploreFamily,
  PageExploreLanguage,
  PageExploreDialect,
  PageDialectLearn,
  PageDialectMedia,
  PageDialectLearnWords,
  PageDialectLearnWordsCategories,
  PageDialectLearnPhrases,
  PageDialectLearnPhrasesCategories,
  PageDialectLearnStoriesAndSongs,
  PageDialectViewWord,
  PageDialectViewMedia,
  PageDialectViewPhrase,
  PageDialectViewBook,
  PageDialectViewAlphabet,
  PageDialectViewCharacter,
  PageDialectPlay,
  PageDialectGalleries,
  PageDialectGalleryView,
  PageDialectReports,
  PageDialectReportsView,
  PageDialectUsers,
  PagePlay,
  PageSearch,
  PageTasks,
  PageUserTasks,
  PageUsersRegister,
  PageUsersForgotPassword,
  PageUsersProfile,
  //GAMES
  PageJigsawGame,
  PageColouringBook,
  PageWordSearch,
  PagePictureThis,
  PageConcentration,
  PageHangman,
  PageWordscramble,
  PageQuiz,
  // KIDS
  PageKidsHome,
  // EDITS
  PageExploreDialectEdit,
  PageDialectWordEdit,
  PageDialectEditMedia,
  PageDialectPhraseEdit,
  PageDialectBookEdit,
  PageDialectBookEntryEdit,
  PageDialectAlphabetCharacterEdit,
  PageDialectGalleryEdit,
  //CREATE
  PageDialectWordsCreate,
  CreateV2,
  CreateAudio,
  CreateRecorder,
  PageDialectPhrasesCreate,
  PageDialectStoriesAndSongsCreate,
  PageDialectStoriesAndSongsBookEntryCreate,
  PageDialectGalleryCreate,
  PageDialectCategoryCreate,
  PageDialectPhraseBooksCreate,
  PageDialectContributorsCreate,
}
