import {getLiteralUnicodeValues} from '../UnicodeHelpers'

/*
Note: to run this test enter the following in the command line:
    npx jest UnicodeHelpers

Websites to convert unicode:
    - https://convertcodes.com/unicode-converter-encode-decode-utf/
    - https://www.branah.com/unicode-converter
    - https://onlineunicodetools.com/convert-unicode-to-string-literal
        Note: this url generates a different value for 😀 = \u1f600
*/
const confusables = [
  ['‎ݖ‎', '\\u200e\\u0756\\u200e'],
  ['‎ى̆‎', '\\u200e\\u0649\\u0306\\u200e'],
  ['‎ێ‎', '\\u200e\\u06ce\\u200e'],
  ['‎ى̆‎', '\\u200e\\u0649\\u0306\\u200e'],
  ['‎ࢺ‎', '\\u200e\\u08ba\\u200e'],
  ['‎ى̆̇‎', '\\u200e\\u0649\\u0306\\u0307\\u200e'],
  ['‎ؽ‎', '\\u200e\\u063d\\u200e'],
  ['‎ى̂‎', '\\u200e\\u0649\\u0302\\u200e'],
  ['‎ﯱ‎', '\\u200e\\ufbf1\\u200e'],
  ['‎ىٴو̓‎', '\\u200e\\u0649\\u0674\\u0648\\u0313\\u200e'],
  ['‎ﯰ‎', '\\u200e\\ufbf0\\u200e'],
  ['‎ىٴو̓‎', '\\u200e\\u0649\\u0674\\u0648\\u0313\\u200e'],
  ['‎ﯳ‎', '\\u200e\\ufbf3\\u200e'],
  ['‎ىٴو̆‎', '\\u200e\\u0649\\u0674\\u0648\\u0306\\u200e'],
  ['‎ﯲ‎', '\\u200e\\ufbf2\\u200e'],
  ['‎ىٴو̆‎', '\\u200e\\u0649\\u0674\\u0648\\u0306\\u200e'],
  ['ఢ', '\\u0c22'],
  ['భ', '\\u0c2d'],
  ['ష', '\\u0c37'],
  ['  ̊า ', '\\u0020\\u0020\\u030a\\u0e32\\u0020'],
  ['  ̊າ ', '\\u0020\\u0020\\u030a\\u0eb2\\u0020'],
  ['႞', '\\u109e'],
  ['ᖄ', '\\u1584'],
  ['ᕐḃ', '\\u1550\\u0062\\u0307'],
  ['⍚', '\\u235a'],
  ['ᛜ̲', '\\u16dc\\u0332'],
]

const combinables = [
  ['Ò̴̖', '\\u004f\\u0300\\u0334\\u0316'],
  ['Ó̵̗', '\\u004f\\u0301\\u0335\\u0317'],
  ['Ô̶̘', '\\u004f\\u0302\\u0336\\u0318'],
  ['Õ̷̙', '\\u004f\\u0303\\u0337\\u0319'],
  ['Ō̸̜', '\\u004f\\u0304\\u0338\\u031c'],
  ['O⃒̝̅', '\\u004f\\u0305\\u20d2\\u031d'],
  ['Ŏ⃓̞', '\\u004f\\u0306\\u20d3\\u031e'],
  ['Ȯ⃘̟', '\\u004f\\u0307\\u20d8\\u031f'],
  ['Ö⃙̠', '\\u004f\\u0308\\u20d9\\u0320'],
  ['Ỏ⃚̡', '\\u004f\\u0309\\u20da\\u0321'],
  ['O̊⃝̢', '\\u004f\\u030a\\u20dd\\u0322'],
  ['Ő⃞̣', '\\u004f\\u030b\\u20de\\u0323'],
  ['Ǒ⃟̤', '\\u004f\\u030c\\u20df\\u0324'],
  ['O⃥̥̍', '\\u004f\\u030d\\u20e5\\u0325'],
  ['O⃦̦̎', '\\u004f\\u030e\\u20e6\\u0326'],
  ['Ȍ̧', '\\u004f\\u030f\\u0327'],
  ['Ǫ̐', '\\u004f\\u0310\\u0328'],
  ['Ȏ̩', '\\u004f\\u0311\\u0329'],
  ['O̪̒', '\\u004f\\u0312\\u032a'],
  ['O̫̓', '\\u004f\\u0313\\u032b'],
  ['O̬̔', '\\u004f\\u0314\\u032c'],
  ['O̭̕', '\\u004f\\u0315\\u032d'],
  ['O̮̚', '\\u004f\\u031a\\u032e'],
  ['Ơ̯', '\\u004f\\u031b\\u032f'],
  ['O̰̽', '\\u004f\\u033d\\u0330'],
  ['O̱̾', '\\u004f\\u033e\\u0331'],
  ['O̲̿', '\\u004f\\u033f\\u0332'],
  ['Ò̳', '\\u004f\\u0340\\u0333'],
  ['Ó̹', '\\u004f\\u0341\\u0339'],
  ['O̺͂', '\\u004f\\u0342\\u033a'],
  ['O̻̓', '\\u004f\\u0343\\u033b'],
  ['Ö̼́', '\\u004f\\u0344\\u033c'],
  ['O͆ͅ', '\\u004f\\u0346\\u0345'],
  ['O͇͊', '\\u004f\\u034a\\u0347'],
  ['O͈͋', '\\u004f\\u034b\\u0348'],
  ['O͉͌', '\\u004f\\u034c\\u0349'],
  ['O͍͐', '\\u004f\\u0350\\u034d'],
  ['O͎͑', '\\u004f\\u0351\\u034e'],
  ['O͓͒', '\\u004f\\u0352\\u0353'],
  ['O͔͗', '\\u004f\\u0357\\u0354'],
  ['O͕͘', '\\u004f\\u0358\\u0355'],
  ['O͖͛', '\\u004f\\u035b\\u0356'],
  ['O͙͝', '\\u004f\\u035d\\u0359'],
  ['O͚͞', '\\u004f\\u035e\\u035a'],
  ['O͜͠', '\\u004f\\u0360\\u035c'],
  ['O͟͡', '\\u004f\\u0361\\u035f'],
  ['Oͣ͢', '\\u004f\\u0363\\u0362'],
  ['O᷂ͤ', '\\u004f\\u0364\\u1dc2'],
  ['O᷊ͥ', '\\u004f\\u0365\\u1dca'],
  ['O᷿ͦ', '\\u004f\\u0366\\u1dff'],
  ['O⃨ͧ', '\\u004f\\u0367\\u20e8'],
  ['Oͨ', '\\u004f\\u0368'],
  ['Oͩ', '\\u004f\\u0369'],
  ['Oͪ', '\\u004f\\u036a'],
  ['Oͫ', '\\u004f\\u036b'],
  ['Oͬ', '\\u004f\\u036c'],
  ['Oͭ', '\\u004f\\u036d'],
  ['Oͮ', '\\u004f\\u036e'],
  ['Oͯ', '\\u004f\\u036f'],
  ['O᷀', '\\u004f\\u1dc0'],
  ['O᷁', '\\u004f\\u1dc1'],
  ['O᷃', '\\u004f\\u1dc3'],
  ['O᷄', '\\u004f\\u1dc4'],
  ['O᷅', '\\u004f\\u1dc5'],
  ['O᷆', '\\u004f\\u1dc6'],
  ['O᷇', '\\u004f\\u1dc7'],
  ['O᷈', '\\u004f\\u1dc8'],
  ['O᷉', '\\u004f\\u1dc9'],
  ['O᷾', '\\u004f\\u1dfe'],
  ['O⃐', '\\u004f\\u20d0'],
  ['O⃑', '\\u004f\\u20d1'],
  ['O⃔', '\\u004f\\u20d4'],
  ['O⃕', '\\u004f\\u20d5'],
  ['O⃖', '\\u004f\\u20d6'],
  ['O⃗', '\\u004f\\u20d7'],
  ['O⃛', '\\u004f\\u20db'],
  ['O⃜', '\\u004f\\u20dc'],
  ['O⃡', '\\u004f\\u20e1'],
  ['O⃩', '\\u004f\\u20e9'],
  ['O⃰', '\\u004f\\u20f0'],
  ['O︠', '\\u004f\\ufe20'],
  ['O︡', '\\u004f\\ufe21'],
  ['O︢', '\\u004f\\ufe22'],
  ['O︣', '\\u004f\\ufe23'],
]

const graphemeClusters = [
  [' g̈ ', '\\u0020\\u0067\\u0308\\u0020'],
  [' 각 ', '\\u0020\\uac01\\u0020'],
  [' ก ', '\\u0020\\u0e01\\u0020'],
  [' நி ', '\\u0020\\u0ba8\\u0bbf\\u0020'],
  [' เ ', '\\u0020\\u0e40\\u0020'],
  [' กำ ', '\\u0020\\u0e01\\u0e33\\u0020'],
  [' षि ', '\\u0020\\u0937\\u093f\\u0020'],
  [' ำ ', '\\u0020\\u0e33\\u0020'],
  [' ष ', '\\u0020\\u0937\\u0020'],
  [' ch ', '\\u0020\\u0063\\u0068\\u0020'],
  [' kʷ ', '\\u0020\\u006b\\u02b7\\u0020'],
  [' क्षि ', '\\u0020\\u0915\\u094d\\u0937\\u093f\\u0020'],
]

const latin = [
  ['a', '\\u0061'],
  ['b', '\\u0062'],
  ['c', '\\u0063'],
  ['d', '\\u0064'],
  ['e', '\\u0065'],
  ['f', '\\u0066'],
  ['g', '\\u0067'],
  ['h', '\\u0068'],
  ['i', '\\u0069'],
  ['j', '\\u006a'],
  ['k', '\\u006b'],
  ['l', '\\u006c'],
  ['m', '\\u006d'],
  ['n', '\\u006e'],
  ['o', '\\u006f'],
  ['p', '\\u0070'],
  ['q', '\\u0071'],
  ['r', '\\u0072'],
  ['s', '\\u0073'],
  ['t', '\\u0074'],
  ['u', '\\u0075'],
  ['v', '\\u0076'],
  ['w', '\\u0077'],
  ['x', '\\u0078'],
  ['y', '\\u0079'],
  ['z', '\\u007a'],
]
const misc = [
  ['😀', '\\ud83d\\ude00'], //
  ['å', '\\u00e5'],
  ['ᖁ', '\\u1581'],
  ['ᕐd', '\\u1550\\u0064'],
]
const characterMap = (arr) => {
  return arr.map((v)=>{
    expect(getLiteralUnicodeValues(v[0])).toMatch(v[1])
  })
}
describe('UnicodeHelpers', () => {
  test('getLiteralUnicodeValues > confusables', () => {
    characterMap(confusables)
  })
  test('getLiteralUnicodeValues > combinables', () => {
    characterMap(combinables)
  })
  test('getLiteralUnicodeValues > graphemeClusters', () => {
    characterMap(graphemeClusters)
  })
  test('getLiteralUnicodeValues > latin', () => {
    characterMap(latin)
  })
  test('getLiteralUnicodeValues > misc', () => {
    characterMap(misc)
  })
})
