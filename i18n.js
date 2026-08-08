// --- Словарь переводов / Translation dictionary ---
export const translations = {
  ru: {
    page_title: "Baby sinaq",
    app_heading: "Сынаг малыш",
    theme_toggle: "Переключить тему",
    lang_toggle: "English",

    select_subject_label: "Выберите предмет:",
    subject_psychology: "Психология",
    subject_sociology: "Социология",
    subject_azerbaijani: "Азербайджанский",
    subject_risks: "Риски",
    subject_python: "Intro to cyber",

    select_module_label: "Выберите модуль:",
    all_modules_option: "Все модули (объединённо)",
    python_module_1: "Модуль 1",
    python_module_2: "Модуль 2",
    python_module_3: "Модуль 3",
    python_module_4: "Модуль 4",
    python_module_5: "Модуль 5",
    python_module_6: "Модуль 6",
    python_module_7: "Модуль 7",
    python_module_8: "Модуль 8",

    questions_from_label: "Вопросы от:",
    min_placeholder: "Начальный номер вопроса",
    to_label: "до:",
    max_placeholder: "Конечный номер вопроса",
    count_placeholder: "Сколько вопросов вы хотите изучить?",
    show_correct_label: "Показать правильный ответ",

    start_button: "Начать",
    back_button: "Назад",
    next_button: "Далее",
    finish_button: "Завершить",
    play_again_button: "Играть снова",
    show_incorrect_button: "Показать неправильные",
    return_home_button: "Вернуться на главную",
    incorrect_title: "Неправильные ответы",
    incorrect_title_colon: "Неправильные ответы:",

    loading: "Загрузка...",
    error_text: "Ошибка",

    alert_no_data: "Не удалось загрузить данные для викторины.",
    alert_load_error: "Произошла ошибка при загрузке данных.",
    alert_wait: "Пожалуйста, дождитесь загрузки вопросов или проверьте файлы.",
    alert_invalid_numbers:
      "Пожалуйста, введите действительные числа для диапазона и количества вопросов.",
    alert_max_less_than_min:
      "Максимальный номер вопроса не может быть меньше минимального.",
    alert_range_out_of_bounds:
      "Диапазон вопросов выходит за пределы доступных вопросов ({count}).",
    alert_no_questions_in_range:
      "В выбранном диапазоне нет доступных вопросов. Измените диапазон.",

    question_progress: "{current} из {total}. ",
    no_questions_generated:
      "Вопросы не сгенерированы. Проверьте ваш ввод или выберите предмет.",
    quiz_result: "Вы набрали {score} из {total}!",
    no_incorrect_to_show: "Нет неправильных ответов для отображения.",
    question_alt: "Вопрос {num}",
  },

  en: {
    page_title: "Baby sinaq",
    app_heading: "Baby Quiz",
    theme_toggle: "Toggle theme",
    lang_toggle: "Русский",

    select_subject_label: "Select a subject:",
    subject_psychology: "Psychology",
    subject_sociology: "Sociology",
    subject_azerbaijani: "Azerbaijani",
    subject_risks: "Risks",
    subject_python: "Intro to cyber",

    select_module_label: "Select a module:",
    all_modules_option: "All modules (merged)",
    python_module_1: "Module 1",
    python_module_2: "Module 2",
    python_module_3: "Module 3",
    python_module_4: "Module 4",
    python_module_5: "Module 5",
    python_module_6: "Module 6",
    python_module_7: "Module 7",
    python_module_8: "Module 8",

    questions_from_label: "Questions from:",
    min_placeholder: "Starting question number",
    to_label: "to:",
    max_placeholder: "Ending question number",
    count_placeholder: "How many questions do you want to study?",
    show_correct_label: "Show correct answer",

    start_button: "Start",
    back_button: "Back",
    next_button: "Next",
    finish_button: "Finish",
    play_again_button: "Play again",
    show_incorrect_button: "Show incorrect",
    return_home_button: "Return to home",
    incorrect_title: "Incorrect answers",
    incorrect_title_colon: "Incorrect answers:",

    loading: "Loading...",
    error_text: "Error",

    alert_no_data: "Failed to load quiz data.",
    alert_load_error: "An error occurred while loading the data.",
    alert_wait: "Please wait for the questions to load, or check the files.",
    alert_invalid_numbers:
      "Please enter valid numbers for the range and question count.",
    alert_max_less_than_min:
      "The maximum question number cannot be less than the minimum.",
    alert_range_out_of_bounds:
      "The question range is outside the available questions ({count}).",
    alert_no_questions_in_range:
      "There are no available questions in the selected range. Please change the range.",

    question_progress: "{current} of {total}. ",
    no_questions_generated:
      "No questions were generated. Check your input or select a subject.",
    quiz_result: "You scored {score} out of {total}!",
    no_incorrect_to_show: "There are no incorrect answers to display.",
    question_alt: "Question {num}",
  },
};

const LANG_STORAGE_KEY = "quizLang";
const DEFAULT_LANG = "ru";

// Текущий выбранный язык / current selected language
export function getLang() {
  return localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG;
}

export function setLang(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

export function toggleLang() {
  const next = getLang() === "ru" ? "en" : "ru";
  setLang(next);
  return next;
}

// Получить перевод по ключу с подстановкой параметров {param}
// Get a translation by key, substituting {param} placeholders
export function t(key, params = {}) {
  const lang = getLang();
  let str =
    (translations[lang] && translations[lang][key]) ??
    translations[DEFAULT_LANG][key] ??
    key;
  for (const [paramKey, value] of Object.entries(params)) {
    str = str.replace(`{${paramKey}}`, value);
  }
  return str;
}

// Применяет переводы ко всем элементам с data-i18n / data-i18n-placeholder
// Applies translations to every element with data-i18n / data-i18n-placeholder
export function applyStaticTranslations() {
  document.title = t("page_title");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });

  document.documentElement.lang = getLang();
}