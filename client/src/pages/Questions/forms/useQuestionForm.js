import { useState, useEffect } from 'react';

const EMPTY_MCQ_OPTIONS = [
  { text: '', isCorrect: true },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
];

const INITIAL = {
  text: '',
  imageUrl: '',
  type: 'mcq',
  category: '',
  difficulty: '',
  points: '',
  timeLimitSeconds: '',
  hintText: '',
  options: EMPTY_MCQ_OPTIONS,
  correctAnswer: '',
  numericTolerance: '',
};

export function useQuestionForm(initialValues) {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setValues({
        ...INITIAL,
        ...initialValues,
        options: initialValues.options || EMPTY_MCQ_OPTIONS,
        points: initialValues.points ?? '',
        timeLimitSeconds: initialValues.timeLimitSeconds ?? '',
        numericTolerance: initialValues.numericTolerance ?? '',
        correctAnswer: initialValues.correctAnswer ?? '',
        hintText: initialValues.hintText ?? '',
        difficulty: initialValues.difficulty ?? '',
        imageUrl: initialValues.imageUrl ?? '',
      });
    }
  }, [initialValues]);

  const setField = (field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const changeType = (type) => {
    setValues((v) => ({
      ...v,
      type,
      options: type === 'mcq' ? EMPTY_MCQ_OPTIONS : v.options,
      correctAnswer: type === 'mcq' ? '' : v.correctAnswer,
    }));
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!values.text || values.text.length < 5) e.text = '\u0627\u0644\u0646\u0635 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 5 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644';
    if (values.text?.length > 500) e.text = '\u0627\u0644\u0646\u0635 \u064A\u062C\u0628 \u0623\u0644\u0627 \u064A\u062A\u062C\u0627\u0648\u0632 500 \u062D\u0631\u0641';
    if (!values.category) e.category = '\u0627\u0644\u0642\u0633\u0645 \u0645\u0637\u0644\u0648\u0628';

    if (values.type === 'mcq') {
      const correctCount = values.options.filter((o) => o.isCorrect).length;
      const texts = values.options.map((o) => o.text.trim());
      if (values.options.length !== 4) e.options = '\u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 4 \u062E\u064A\u0627\u0631\u0627\u062A';
      else if (texts.some((t) => !t)) e.options = '\u0643\u0644 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0645\u0637\u0644\u0648\u0628\u0629';
      else if (new Set(texts).size !== 4) e.options = '\u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u062E\u062A\u0644\u0641\u0629';
      else if (correctCount !== 1) e.options = '\u064A\u062C\u0628 \u062A\u062D\u062F\u064A\u062F \u0625\u062C\u0627\u0628\u0629 \u0635\u062D\u064A\u062D\u0629 \u0648\u0627\u062D\u062F\u0629';
    }

    if (values.type === 'quick_input') {
      if (!values.correctAnswer) e.correctAnswer = '\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0645\u0637\u0644\u0648\u0628\u0629';
      else if (!isNaN(Number(values.correctAnswer))) e.correctAnswer = '\u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0646\u0635 \u0644\u064A\u0633 \u0631\u0642\u0645';
    }

    if (values.type === 'numeric') {
      if (!values.correctAnswer) e.correctAnswer = '\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0645\u0637\u0644\u0648\u0628\u0629';
      else if (isNaN(Number(values.correctAnswer))) e.correctAnswer = '\u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0631\u0642\u0645';
      if (values.numericTolerance === '' || values.numericTolerance === null) e.numericTolerance = '\u0647\u0627\u0645\u0634 \u0627\u0644\u062E\u0637\u0623 \u0645\u0637\u0644\u0648\u0628';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => {
    const base = {
      text: values.text,
      type: values.type,
      category: values.category,
    };
    if (values.difficulty) base.difficulty = values.difficulty;
    if (values.points) base.points = Number(values.points);
    if (values.timeLimitSeconds) base.timeLimitSeconds = Number(values.timeLimitSeconds);
    if (values.hintText) base.hintText = values.hintText;
    base.imageUrl = values.imageUrl || null;

    if (values.type === 'mcq') {
      base.options = values.options.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }));
    } else {
      base.correctAnswer = String(values.correctAnswer);
      if (values.type === 'numeric') base.numericTolerance = Number(values.numericTolerance);
    }
    return base;
  };

  return { values, errors, setField, changeType, validate, buildPayload };
}
