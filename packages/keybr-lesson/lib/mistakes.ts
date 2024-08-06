import { uniqueWordList,type WordList } from "@keybr/content";
import { type Keyboard } from "@keybr/keyboard";
import { type Letter, type PhoneticModel } from "@keybr/phonetic-model";
import { type KeyStatsMap } from "@keybr/result";
import { type Settings } from "@keybr/settings";
import { CustomTextLesson } from "./customtext.ts";
import { LessonKeys } from "./key.ts";
import { Lesson } from "./lesson.ts";
import { Target } from "./target.ts";

export class MistakesLesson extends CustomTextLesson {
  override readonly wordList: WordList;
  readonly repeats: number;

  constructor(
    settings: Settings,
    keyboard: Keyboard,
    model: PhoneticModel,
    wordList: WordList,
    repeats: 3,
  ) {
    super(settings, keyboard, model);
    this.wordList = uniqueWordList(wordList);
    this.repeats = repeats;
  }

  // override update(keyStatsMap: KeyStatsMap): LessonKeys {
  //   return LessonKeys.includeAll(keyStatsMap, new Target(this.settings));
  // }
  //
  // override get letters(): readonly Letter[] {
  //   return this.model.letters;
  // }

  override generate(): string {
    let words: string[] = [];
    for (let i = 0; i < this.repeats; i++) {
      words.push(...this.wordList);
    }

    return shuffle(words).join(" ");
  }
}
const shuffle = (array: string[]): string[] => {
  array.sort(() => Math.random() - 0.5);
  return array;
};
