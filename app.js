import { loadQuizData } from "./data.js";
import { t, applyStaticTranslations, toggleLang } from "./i18n.js";

// Предметы, у которых есть отдельные модули для практики / merge.
// Subjects that have separate modules for individual practice / merging.
// Ключ — значение <option> в #subject-select; значение — список файлов модулей.
const MODULE_SUBJECTS = {
  python: [
    "questions_python_module1.txt",
    "questions_python_module2.txt",
    "questions_python_module3.txt",
    // "questions_python_module4.txt",
    // "questions_python_module5.txt",
    // "questions_python_module6.txt",
    // "questions_python_module7.txt",
    // "questions_python_module8.txt",
    // "question_module4_zaxra.txt",
  ],
};
const ALL_MODULES_VALUE = "__ALL__";

// Глобальные переменные для хранения данных викторины
let allQuestionsData = [];
let allAnswersCorrectness = [];
let incorrectAnswers = [];
const quizQuestions = [];

// Получение DOM-элементов
const inputMin = document.querySelector(".min");
const inputMax = document.querySelector(".max");
const inputCount = document.querySelector(".input-count");
const homePage = document.querySelector(".home");
const quizPage = document.getElementById("quiz-page"); // ИСПОЛЬЗУЕМ НОВЫЙ ID ИЗ index.html
const startButton = document.getElementById("start");

const questionNumberDisplay = document.getElementById(
  "question-number-display",
);
const questionContentArea = document.getElementById("question-content");

const answerButtonsContainer = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const backButton = document.getElementById("back-btn");
const showIncorrectAnswersButton = document.getElementById(
  "show-incorrect-answers",
);
const incorrectAnswersSection = document.getElementById("incorrect");
const mainButtonContainer = document.getElementById("btn");
const allQuestionsContainer = document.getElementById(
  "all-questions-container",
);
const incorrectAnswersTitle = document.getElementById(
  "incorrect-answers-title",
);
const showCorrectCheckbox = document.getElementById("show-correct-checkbox");

const subjectSelect = document.getElementById("subject-select");
const moduleSelectionDiv = document.getElementById("module-selection");
const moduleSelect = document.getElementById("module-select");

const themeToggleButton = document.getElementById("theme-toggle");
const langToggleButton = document.getElementById("lang-toggle");
const body = document.body;

// --- Функции загрузки данных и инициализации UI ---

async function initializeQuizData() {
  startButton.disabled = true;
  inputMax.value = t("loading");

  let selectedSubjectFile = "python";
  if (subjectSelect) {
    selectedSubjectFile = subjectSelect.value;
  }

  // Если у предмета есть модули — подставляем файл(ы) выбранного модуля,
  // либо весь набор модулей, если выбрано "Все модули"
  // If the subject has modules — swap in the selected module's file(s),
  // or the full module set if "All modules" is selected
  if (MODULE_SUBJECTS[selectedSubjectFile]) {
    const modules = MODULE_SUBJECTS[selectedSubjectFile];
    const selectedModule = moduleSelect
      ? moduleSelect.value
      : ALL_MODULES_VALUE;
    selectedSubjectFile =
      selectedModule === ALL_MODULES_VALUE ? modules : selectedModule;
  }

  try {
    const data = await loadQuizData(selectedSubjectFile);
    allQuestionsData = data.image_question;
    allAnswersCorrectness = data.result;

    if (allQuestionsData && allQuestionsData.length) {
      if (
        !inputMax.value ||
        parseFloat(inputMax.value) === 0 ||
        parseFloat(inputMax.value) > allQuestionsData.length
      ) {
        inputMax.value = allQuestionsData.length;
      }
      startButton.disabled = false;
    } else {
      inputMax.value = 0;
      console.warn(`Данные для викторины не загружены или пусты.`);
      alert(t("alert_no_data"));
    }
  } catch (error) {
    console.error("Ошибка загрузки данных викторины:", error);
    inputMax.value = t("error_text");
    startButton.disabled = true;
    alert(t("alert_load_error"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadThemeSetting();
  applyStaticTranslations();
  loadUserSettings();
  updateModuleVisibility();
  initializeQuizData();

  // Начальное состояние: видна только домашняя страница
  homePage.classList.remove("hide");
  homePage.style.display = "block";

  quizPage.classList.add("hide");
  quizPage.style.display = "none";

  incorrectAnswersSection.classList.add("hide");
  incorrectAnswersSection.style.display = "none";

  mainButtonContainer.classList.add("hide"); // Кнопки "Далее/Назад" скрыты на главной
  mainButtonContainer.style.display = "none";

  questionNumberDisplay.classList.add("hide"); // Элементы викторины также скрыты
  questionNumberDisplay.style.display = "none";
  questionContentArea.classList.add("hide");
  questionContentArea.style.display = "none";
  answerButtonsContainer.classList.add("hide");
  answerButtonsContainer.style.display = "none";

  inputMin.addEventListener("input", saveUserSettings);
  inputMax.addEventListener("input", saveUserSettings);
  inputCount.addEventListener("input", saveUserSettings);

  if (subjectSelect) {
    subjectSelect.addEventListener("change", handleSubjectChange);
  }
  if (moduleSelect) {
    moduleSelect.addEventListener("change", saveUserSettingsAndReloadData);
  }
  showCorrectCheckbox.addEventListener("change", saveUserSettings);

  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleTheme);
  } else {
    console.warn("Кнопка переключения темы с ID 'theme-toggle' не найдена.");
  }

  if (langToggleButton) {
    langToggleButton.addEventListener("click", handleLangToggle);
  } else {
    console.warn("Кнопка переключения языка с ID 'lang-toggle' не найдена.");
  }
});

// Переключает язык интерфейса и перерисовывает текущий видимый экран
// Switches the UI language and re-renders whichever screen is currently visible
function handleLangToggle() {
  toggleLang();
  applyStaticTranslations();

  if (!quizPage.classList.contains("hide")) {
    if (currentQuizQuestionIndex < quizQuestions.length) {
      showQuestion();
    } else {
      showQuizResult();
    }
  } else if (!incorrectAnswersSection.classList.contains("hide")) {
    incorrectAnswersTitle.textContent = t("incorrect_title_colon");
    displayIncorrectAnswers();
  } else if (!homePage.classList.contains("hide") && startButton.disabled) {
    // Пока данные загружаются/не загрузились — обновим текст поля
    // While data is loading/failed to load — refresh the field text
    if (inputMax.value === "" || inputMax.value === "0") {
      initializeQuizData();
    }
  }
}

function saveUserSettingsAndReloadData() {
  saveUserSettings();
  initializeQuizData();
}

// Показывает/скрывает выпадающий список модулей в зависимости от выбранного предмета
// Shows/hides the module dropdown depending on the selected subject
function updateModuleVisibility() {
  const hasModules = subjectSelect && MODULE_SUBJECTS[subjectSelect.value];
  if (!moduleSelectionDiv) return;
  if (hasModules) {
    moduleSelectionDiv.classList.remove("hide");
  } else {
    moduleSelectionDiv.classList.add("hide");
  }
}

// Реагирует на смену предмета: обновляет видимость модулей и перезагружает данные
// Reacts to a subject change: updates module visibility and reloads data
function handleSubjectChange() {
  updateModuleVisibility();
  saveUserSettingsAndReloadData();
}

function saveUserSettings() {
  const settings = {
    min: inputMin.value,
    max: inputMax.value,
    count: inputCount.value,
    subject: subjectSelect ? subjectSelect.value : "python",
    module: moduleSelect ? moduleSelect.value : ALL_MODULES_VALUE,
    showCorrect: showCorrectCheckbox.checked,
  };
  localStorage.setItem("quizSettings", JSON.stringify(settings));
}

function loadUserSettings() {
  const settings = JSON.parse(localStorage.getItem("quizSettings"));
  if (settings) {
    inputMin.value = settings.min || "1";
    if (inputMax) {
      inputMax.value = settings.max || "";
    }
    inputCount.value = settings.count || "20";
    if (subjectSelect) {
      subjectSelect.value = settings.subject || "python";
    }
    if (moduleSelect) {
      moduleSelect.value = settings.module || ALL_MODULES_VALUE;
    }
    showCorrectCheckbox.checked =
      settings.showCorrect !== undefined ? settings.showCorrect : true;
  }
}

function loadThemeSetting() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
    if (savedTheme === null) {
      localStorage.setItem("theme", "light");
    }
  }
}

function toggleTheme() {
  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  } else {
    body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  }
}

startButton.addEventListener("click", () => {
  if (startButton.disabled || allQuestionsData.length === 0) {
    alert(t("alert_wait"));
    return;
  }

  homePage.classList.add("hide");
  homePage.style.display = "none";

  quizPage.classList.remove("hide");
  quizPage.style.display = "block";

  incorrectAnswersSection.classList.add("hide");
  incorrectAnswersSection.style.display = "none";

  incorrectAnswers = [];
  localStorage.removeItem("incorrects");

  generateRandomQuestions();
  startQuiz();
});

// --- Функции викторины ---

function generateRandomQuestions() {
  const start = parseFloat(inputMin.value);
  const finish = parseFloat(inputMax.value);
  const questionCount = parseFloat(inputCount.value);

  if (
    isNaN(start) ||
    isNaN(finish) ||
    isNaN(questionCount) ||
    start < 1 ||
    questionCount < 1
  ) {
    alert(t("alert_invalid_numbers"));
    return;
  }
  if (finish < start) {
    alert(t("alert_max_less_than_min"));
    return;
  }
  if (start > allQuestionsData.length || finish > allQuestionsData.length) {
    alert(t("alert_range_out_of_bounds", { count: allQuestionsData.length }));
    return;
  }

  const actualStart = start - 1;
  const actualFinish = finish - 1;

  const availableIndices = [];
  for (let i = actualStart; i <= actualFinish; i++) {
    if (i >= 0 && i < allQuestionsData.length) {
      availableIndices.push(i);
    }
  }

  if (availableIndices.length === 0) {
    alert(t("alert_no_questions_in_range"));
    return;
  }

  const countToSelect = Math.min(questionCount, availableIndices.length);

  const selectedIndices = [];
  const tempSet = new Set();
  while (tempSet.size < countToSelect) {
    const randomIndex =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];
    tempSet.add(randomIndex);
  }
  selectedIndices.push(...Array.from(tempSet));

  quizQuestions.length = 0;

  for (const index of selectedIndices) {
    const currentQuestionData = allQuestionsData[index];
    const currentQuestionAnswersCorrectness = allAnswersCorrectness[index];

    const answersForCurrentQuestion = [];
    for (let m = 1; m < currentQuestionData.length; m++) {
      answersForCurrentQuestion.push({
        text: currentQuestionData[m],
        correct: currentQuestionAnswersCorrectness[m - 1],
        originalIndex: m - 1,
      });
    }
    quizQuestions.push({
      question: currentQuestionData[0],
      answers: answersForCurrentQuestion,
    });
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let currentQuizQuestionIndex = 0;
let score = 0;
let userSelectedAnswers = [];

function startQuiz() {
  incorrectAnswersSection.classList.add("hide");
  incorrectAnswersSection.style.display = "none";

  mainButtonContainer.classList.remove("hide");
  mainButtonContainer.style.display = "flex";

  questionNumberDisplay.classList.remove("hide");
  questionContentArea.classList.remove("hide");
  answerButtonsContainer.classList.remove("hide");

  questionNumberDisplay.style.display = "block";
  questionContentArea.style.display = "block";
  answerButtonsContainer.style.display = "block";

  currentQuizQuestionIndex = 0;
  score = 0;
  userSelectedAnswers = Array(quizQuestions.length).fill(null);
  nextButton.textContent = t("next_button");
  backButton.textContent = t("back_button");
  showQuestion();
}

function addMediaToElement(content, container) {
  container.innerHTML = "";
  if (content.includes("output_images/")) {
    const image = document.createElement("img");
    image.src = content;
    image.alt = "Question Image";
    image.classList.add("question-image");
    container.appendChild(image);
  } else {
    container.textContent = content;
  }
}

function resetState() {
  while (answerButtonsContainer.firstChild) {
    answerButtonsContainer.removeChild(answerButtonsContainer.firstChild);
  }
}

function showQuestion() {
  resetState();
  questionNumberDisplay.textContent = "";
  questionContentArea.innerHTML = "";

  if (quizQuestions.length === 0) {
    questionNumberDisplay.textContent = "";
    questionContentArea.textContent = t("no_questions_generated");
    answerButtonsContainer.innerHTML = "";
    nextButton.style.display = "none";
    backButton.style.display = "none";
    return;
  }

  let currentQuestion = quizQuestions[currentQuizQuestionIndex];
  let questionNumber = currentQuizQuestionIndex + 1;
  const totalQuestions = quizQuestions.length;

  questionNumberDisplay.textContent = t("question_progress", {
    current: questionNumber,
    total: totalQuestions,
  });

  if (currentQuestion.question.includes("output_images/")) {
    addMediaToElement(currentQuestion.question, questionContentArea);
  } else {
    questionContentArea.textContent = currentQuestion.question;
  }

  const shuffledAnswers = shuffle([...currentQuestion.answers]);

  shuffledAnswers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.classList.add("btn");
    addMediaToElement(answer.text, button);
    answerButtonsContainer.appendChild(button);

    if (answer.correct) {
      button.dataset.correct = "true";
    }

    // Если пользователь уже выбрал ответ для этого вопроса, подсвечиваем его
    if (
      userSelectedAnswers[currentQuizQuestionIndex] === answer.originalIndex
    ) {
      button.classList.add("selected");
      // Если чекбокс "Показать правильный ответ" включен, сразу показываем правильность/неправильность
      if (showCorrectCheckbox.checked) {
        if (answer.correct) {
          button.classList.add("correct");
        } else {
          button.classList.add("incorrect");
        }
      }
    }

    button.addEventListener("click", () =>
      selectAnswer(index, shuffledAnswers),
    );
  });

  // После создания кнопок, если ответ уже выбран, отключаем их и подсвечиваем
  if (userSelectedAnswers[currentQuizQuestionIndex] !== null) {
    Array.from(answerButtonsContainer.children).forEach((button) => {
      button.disabled = true; // Отключаем все кнопки
      if (showCorrectCheckbox.checked) {
        // Дополнительная проверка: всегда показываем правильный ответ зеленым
        if (button.dataset.correct === "true") {
          button.classList.add("correct");
        }
        // И если это был выбранный пользователем неправильный ответ, красим его красным
        if (
          button.classList.contains("selected") &&
          button.dataset.correct !== "true"
        ) {
          button.classList.add("incorrect");
        }
      }
    });
  }
  updateNavigationButtonsVisibility();
  updateNavigationButtonsText();
}

function selectAnswer(selectedAnswerIndex, shuffledAnswers) {
  const selectedAnswer = shuffledAnswers[selectedAnswerIndex];
  userSelectedAnswers[currentQuizQuestionIndex] = selectedAnswer.originalIndex;

  const selectedButton = answerButtonsContainer.children[selectedAnswerIndex];
  const prevSelectedButton = answerButtonsContainer.querySelector(".selected");
  const checkbox = showCorrectCheckbox;

  if (prevSelectedButton) {
    prevSelectedButton.classList.remove("selected");
    prevSelectedButton.classList.remove("correct");
    prevSelectedButton.classList.remove("incorrect");
  }
  selectedButton.classList.add("selected");

  const isCorrect = selectedAnswer.correct;

  // Обновляем incorrectAnswers: удаляем, если вопрос был в неправильных и стал правильным,
  // или добавляем/обновляем, если он неправильный.
  incorrectAnswers = incorrectAnswers.filter(
    (q) => q.question !== quizQuestions[currentQuizQuestionIndex].question,
  );

  if (isCorrect) {
    if (checkbox.checked) {
      selectedButton.classList.add("correct");
    }
  } else {
    if (checkbox.checked) {
      selectedButton.classList.add("incorrect");
    }
    incorrectAnswers.push({
      ...quizQuestions[currentQuizQuestionIndex],
      userSelectedOriginalIndex: selectedAnswer.originalIndex,
    });
  }

  // Отключаем все кнопки и показываем правильные/неправильные ответы после выбора
  Array.from(answerButtonsContainer.children).forEach((button, btnIndex) => {
    button.disabled = true;
    const originalAnswerOfButton = shuffledAnswers[btnIndex];

    if (checkbox.checked) {
      if (originalAnswerOfButton.correct) {
        button.classList.add("correct");
      } else if (
        button.classList.contains("selected") &&
        !originalAnswerOfButton.correct
      ) {
        button.classList.add("incorrect");
      }
    }
  });

  // Пересчет очков
  score = 0;
  for (let i = 0; i < quizQuestions.length; i++) {
    const question = quizQuestions[i];
    const selectedOriginalIndex = userSelectedAnswers[i];
    if (selectedOriginalIndex !== null) {
      const correctAnswer = question.answers.find(
        (ans) => ans.originalIndex === selectedOriginalIndex,
      );
      if (correctAnswer && correctAnswer.correct) {
        score++;
      }
    }
  }

  nextButton.style.display = "block";
  backButton.style.display = "block";
  updateNavigationButtonsText();
}

function showQuizResult() {
  resetState();

  questionNumberDisplay.classList.add("hide");
  questionContentArea.classList.add("hide");
  answerButtonsContainer.classList.add("hide");

  questionNumberDisplay.style.display = "none";
  questionContentArea.style.display = "none";
  answerButtonsContainer.style.display = "none";

  questionNumberDisplay.textContent = "";
  questionContentArea.innerHTML = t("quiz_result", {
    score: score,
    total: quizQuestions.length,
  });

  mainButtonContainer.classList.remove("hide");
  mainButtonContainer.style.display = "flex";

  nextButton.textContent = t("play_again_button");
  backButton.textContent = t("show_incorrect_button");
  nextButton.style.display = "block";

  questionContentArea.classList.remove("hide");
  questionContentArea.style.display = "block";

  localStorage.setItem("incorrects", JSON.stringify(incorrectAnswers));
}

function handleNextQuestion() {
  currentQuizQuestionIndex++;
  if (currentQuizQuestionIndex < quizQuestions.length) {
    showQuestion();
  } else {
    showQuizResult();
  }
  updateNavigationButtonsText();
}

function handlePreviousQuestion() {
  if (currentQuizQuestionIndex > 0) {
    currentQuizQuestionIndex--;
    showQuestion();
  }
  updateNavigationButtonsText();
}

function updateNavigationButtonsText() {
  if (currentQuizQuestionIndex === quizQuestions.length - 1) {
    nextButton.textContent = t("finish_button");
  } else if (currentQuizQuestionIndex < quizQuestions.length) {
    nextButton.textContent = t("next_button");
  }

  if (currentQuizQuestionIndex === quizQuestions.length) {
    nextButton.textContent = t("play_again_button");
    backButton.textContent = t("show_incorrect_button");
  } else if (currentQuizQuestionIndex === 0) {
    backButton.textContent = t("back_button");
  }
}

function updateNavigationButtonsVisibility() {
  nextButton.style.display = "block";
  backButton.style.display = "block";
}

nextButton.addEventListener("click", () => {
  if (currentQuizQuestionIndex < quizQuestions.length) {
    handleNextQuestion();
  } else {
    // Если тест завершен и нажата "Играть снова"
    quizPage.classList.add("hide");
    quizPage.style.display = "none";

    homePage.classList.remove("hide");
    homePage.style.display = "block";

    incorrectAnswersSection.classList.add("hide");
    incorrectAnswersSection.style.display = "none";

    mainButtonContainer.classList.add("hide"); // Скрываем кнопки на главной
    mainButtonContainer.style.display = "none";

    // Убедимся, что элементы викторины скрыты на главной
    questionNumberDisplay.style.display = "none";
    questionContentArea.style.display = "none";
    answerButtonsContainer.style.display = "none";

    initializeQuizData();
  }
});

backButton.addEventListener("click", () => {
  if (
    currentQuizQuestionIndex === quizQuestions.length &&
    quizQuestions.length > 0
  ) {
    // Если мы на экране результатов и нажата "Показать неправильные"
    quizPage.classList.add("hide"); // Скрываем страницу викторины
    quizPage.style.display = "none";

    mainButtonContainer.classList.add("hide"); // Скрываем кнопки "Далее/Назад"
    mainButtonContainer.style.display = "none";

    incorrectAnswersTitle.textContent = t("incorrect_title_colon");
    incorrectAnswersSection.classList.remove("hide");
    incorrectAnswersSection.style.display = "block"; // ПОКАЗЫВАЕМ секцию неправильных ответов

    showIncorrectAnswersButton.style.display = "block"; // Кнопка "Вернуться на главную"

    displayIncorrectAnswers();
  } else if (currentQuizQuestionIndex > 0) {
    // Если мы в процессе викторины и нажата "Назад"
    handlePreviousQuestion();
  }
});

// --- Функции для отображения неправильных ответов ---
function displayIncorrectAnswers() {
  allQuestionsContainer.innerHTML = ""; // Очищаем контейнер перед заполнением

  const storedIncorrects = JSON.parse(
    localStorage.getItem("incorrects") || "[]",
  );
  if (storedIncorrects.length === 0) {
    allQuestionsContainer.textContent = t("no_incorrect_to_show");
    return;
  }

  storedIncorrects.forEach((questionData, index) => {
    const questionItemContainer = document.createElement("div");
    questionItemContainer.classList.add("incorrect-question-item");

    const questionTitle = document.createElement("h3");
    questionTitle.classList.add("incorrect-question-title");
    questionTitle.textContent = `${index + 1}. `;

    if (questionData.question.includes("output_images/")) {
      const image = document.createElement("img");
      image.src = questionData.question;
      image.alt = t("question_alt", { num: index + 1 });
      image.classList.add("question-image-small");
      questionItemContainer.appendChild(questionTitle);
      questionItemContainer.appendChild(image);
    } else {
      questionTitle.textContent += questionData.question;
      questionItemContainer.appendChild(questionTitle);
    }

    const answersList = document.createElement("div");
    answersList.classList.add("incorrect-answers-list");

    questionData.answers.forEach((answer) => {
      const answerButton = document.createElement("button");
      answerButton.classList.add("btn");
      answerButton.disabled = true; // Делаем кнопки неактивными в режиме просмотра

      addMediaToElement(answer.text, answerButton);

      // ДОБАВЛЕНА ЛОГИКА ДЛЯ ПОДСВЕТКИ ОТВЕТОВ
      if (showCorrectCheckbox.checked) {
        // Проверяем, включен ли чекбокс "Показать правильный ответ"
        if (answer.correct) {
          answerButton.classList.add("correct"); // Правильный ответ - зеленый
        }
        // Если это был ответ пользователя И он был неправильным, красим в красный
        if (
          answer.originalIndex === questionData.userSelectedOriginalIndex &&
          !answer.correct
        ) {
          answerButton.classList.add("incorrect"); // Неправильный ответ пользователя - красный
        }
      }
      answersList.appendChild(answerButton);
    });
    questionItemContainer.appendChild(answersList);
    allQuestionsContainer.appendChild(questionItemContainer);
  });
}
showIncorrectAnswersButton.addEventListener("click", () => {
  // При нажатии "Вернуться на главную" на экране неправильных ответов:
  incorrectAnswersSection.classList.add("hide");
  incorrectAnswersSection.style.display = "none";

  quizPage.classList.add("hide");
  quizPage.style.display = "none";

  homePage.classList.remove("hide");
  homePage.style.display = "block";

  mainButtonContainer.classList.add("hide"); // Скрываем кнопки навигации при возврате на главную
  mainButtonContainer.style.display = "none";

  // Убедимся, что элементы викторины скрыты
  questionNumberDisplay.style.display = "none";
  questionContentArea.style.display = "none";
  answerButtonsContainer.style.display = "none";

  initializeQuizData(); // Перезагружаем данные для выбранного предмета
});
