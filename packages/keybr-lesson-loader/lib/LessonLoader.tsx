import { loadWordList } from "@keybr/content-words";
import { catchError } from "@keybr/debug";
import { keyboardProps, useKeyboard } from "@keybr/keyboard";
import {
  CodeLesson,
  CustomTextLesson,
  GuidedLesson,
  type Lesson,
  lessonProps,
  LessonType,
  NumbersLesson,
  WordListLesson,
} from "@keybr/lesson";
import { LoadingProgress } from "@keybr/pages-shared";
import { PhoneticModel } from "@keybr/phonetic-model";
import { PhoneticModelLoader } from "@keybr/phonetic-model-loader";
import { useSettings } from "@keybr/settings";
import { type ReactNode, useEffect, useState } from "react";

export function LessonLoader({
  children,
  fallback = <LoadingProgress total={0} current={0} />,
}: {
  readonly children: (result: Lesson) => ReactNode;
  readonly fallback?: ReactNode;
}): ReactNode {
  const { settings } = useSettings();
  const lessonType = settings.get(lessonProps.type);
  const layout = settings.get(keyboardProps.layout);
  return (
    <PhoneticModelLoader language={layout.language}>
      {(model) => (
        <Loader key={lessonType.id} model={model} fallback={fallback}>
          {children}
        </Loader>
      )}
    </PhoneticModelLoader>
  );
}

function Loader({
  model,
  children,
  fallback,
}: {
  readonly model: PhoneticModel;
  readonly children: (result: Lesson) => ReactNode;
  readonly fallback?: ReactNode;
}): ReactNode {
  const result = useLoader(model);
  if (result == null) {
    return fallback;
  } else {
    return children(result);
  }
}

function useLoader(model0: PhoneticModel): Lesson | null {
  const { settings } = useSettings();
  const keyboard = useKeyboard();
  const [result, setResult] = useState<Lesson | null>(null);

  useEffect(() => {
    let didCancel = false;

    const load = async (): Promise<void> => {
      const codePoints = keyboard.getCodePoints();
      const model = PhoneticModel.restrict(model0, codePoints);

      switch (settings.get(lessonProps.type)) {
        case LessonType.GUIDED: {
          const { language } = settings.get(keyboardProps.layout);
          const wordList = await loadWordList(language);
          if (!didCancel) {
            setResult(
              new GuidedLesson(
                settings, //
                model,
                codePoints,
                wordList,
              ),
            );
          }
          break;
        }
        case LessonType.WORDLIST: {
          const { language } = settings.get(keyboardProps.layout);
          const wordList = await loadWordList(language);
          if (!didCancel) {
            setResult(
              new WordListLesson(
                settings, //
                model,
                codePoints,
                wordList,
              ),
            );
          }
          break;
        }
        case LessonType.CUSTOM: {
          if (!didCancel) {
            setResult(new CustomTextLesson(settings, model, codePoints));
          }
          break;
        }
        case LessonType.NUMBERS: {
          if (!didCancel) {
            setResult(new NumbersLesson(settings, model, codePoints));
          }
          break;
        }
        case LessonType.CODE: {
          if (!didCancel) {
            setResult(new CodeLesson(settings, model, codePoints));
          }
          break;
        }
        default:
          throw new Error();
      }
    };

    load().catch(catchError);

    return () => {
      didCancel = true;
    };
  }, [model0, settings, keyboard]);

  return result;
}
