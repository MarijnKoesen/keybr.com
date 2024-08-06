export type WordList = readonly string[];

export function uniqueWordList(wordList: WordList): WordList {
  const uniqueWords = new Set(wordList);
  return Array.from(uniqueWords) as WordList;
}
