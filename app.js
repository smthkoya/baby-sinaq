import { loadQuizData } from "./data.js";
import { t, applyStaticTranslations, toggleLang } from "./i18n.js";

const MODULE_SUBJECTS = {
  python: [
    { file: "questions_python_module1.txt", label: "Модуль 1 AI according to the example" },
    { file: "questions_python_module2.txt", label: "Модуль 2 AI according to the example" },
    { file: "questions_python_module3.txt", label: "Модуль 3 AI according to the example" },
    { file: "questions_python_module4.txt", label: "Модуль 4 AI according to the example" },
    { file: "questions_python_module5.txt", label: "Модуль 5 AI according to the example" },
    { file: "questions_python_module6.txt", label: "Модуль 1 AI" },
    { file: "questions_python_module7.txt", label: "Модуль 2 AI" },
    { file: "questions_python_module8.txt", label: "Модуль 3 AI" },
    { file: "questions_python_module9.txt", label: "Module 4 AI" },
    { file: "questions_module4_zaxra.txt", label: "Module 5 AI" },
  ],
  security_gateways: [
    { file: "questions_security_gateways_module4.txt", label: "Module 4 — Authentication & Access Control" },
    { file: "questions_security_gateways_module5.txt", label: "Module 5 — Private Networks" },
    { file: "questions_security_gateways_module6.txt", label: "Module 6 — Attacks & Defense" },
  ],
  linux: [
    { file: "questions_linux_module1.txt", label: "Module 1" },
    { file: "questions_linux_module2.txt", label: "Module 2" },
    { file: "questions_linux_module3.txt", label: "Module 3" },
    { file: "questions_linux_module4.txt", label: "Module 4" },
    { file: "questions_linux_module5.txt", label: "Module 5" },
    { file: "questions_linux_module6.txt", label: "Module 6" },
    { file: "questions_linux_midterm.txt", label: "Midterm Questions" },
  ],
};

const ALL_MODULES_VALUE = "__ALL__";

let allQuestionsData = [];
let allAnswersCorrectness = [];
let incorrectAnswers = [];
const quizQuestions = [];

const inputMin = document.querySelector(".min");
const inputMax = document.querySelector(".max");
const inputCount = document.querySelector(".input-count");
const homePage = document.querySelector(".home");
const quizPage = document.getElementById("quiz-page");
const startButton = document.getElementById("start");
const questionNumberDisplay = document.getElementById("question-number-display");
const questionContentArea = document.getElementById("question-content");
const answerButtonsContainer = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const backButton = document.getElementById("back-btn");
const showIncorrectAnswersButton = document.getElementById("show-incorrect-answers");
const incorrectAnswersSection = document.getElementById("incorrect");
const mainButtonContainer = document.getElementById("btn");
const allQuestionsContainer = document.getElementById("all-questions-container");
const incorrectAnswersTitle = document.getElementById("incorrect-answers-title");
const showCorrectCheckbox = document.getElementById("show-correct-checkbox");
const subjectSelect = document.getElementById("subject-select");
const moduleSelectionDiv = document.getElementById("module-selection");
const moduleSelect = document.getElementById("module-select");
const themeToggleButton = document.getElementById("theme-toggle");
const langToggleButton = document.getElementById("lang-toggle");
const body = document.body;

function getModuleFiles(subject) {
  return (MODULE_SUBJECTS[subject] || []).map((module) => module.file);
}

function populateModules(subject, preferredValue = null) {
  if (!moduleSelectionDiv || !moduleSelect) return;

  const modules = MODULE_SUBJECTS[subject];
  if (!modules) {
    moduleSelectionDiv.classList.add("hide");
    moduleSelect.innerHTML = "";
    return;
  }

  moduleSelectionDiv.classList.remove("hide");
  moduleSelect.innerHTML = "";

  modules.forEach(({ file, label }) => {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = label;
    moduleSelect.appendChild(option);
  });

  if (preferredValue && modules.some((module) => module.file === preferredValue)) {
    moduleSelect.value = preferredValue;
  }
}

async function initializeQuizData() {
  startButton.disabled = true;
  inputMax.value = t("loading");

  let selectedSubjectFile = subjectSelect ? subjectSelect.value : "python";

  if (MODULE_SUBJECTS[selectedSubjectFile]) {
    const selectedModule = moduleSelect ? moduleSelect.value : ALL_MODULES_VALUE;
    selectedSubjectFile =
      selectedModule === ALL_MODULES_VALUE
        ? getModuleFiles(selectedSubjectFile)
        : selectedModule;
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
      console.warn("Данные для викторины не загружены или пусты.");
      alert(t("alert_no_data"));
    }
  } catch (error) {
    console.error("Ошибка загрузки данных викторины:", error);
    inputMax.value = t("error_text");
    startButton.disabled = true;
    alert(t("alert_load_error"));
  }
}

function handleLangToggle() {
  toggleLang();
  applyStaticTranslations();

  if (!quizPage.classList.contains("hide")) {
    if (currentQuizQuestionIndex < quizQuestions.length) showQuestion();
    else showQuizResult();
  } else if (!incorrectAnswersSection.classList.contains("hide")) {
    incorrectAnswersTitle.textContent = t("incorrect_title_colon");
    displayIncorrectAnswers();
  } else if (!homePage.classList.contains("hide") && startButton.disabled) {
    if (inputMax.value === "" || inputMax.value === "0") initializeQuizData();
  }
}

function saveUserSettingsAndReloadData() {
  saveUserSettings();
  initializeQuizData();
}

function updateModuleVisibility(preferredValue = null) {
  if (!subjectSelect) return;
  populateModules(subjectSelect.value, preferredValue);
}

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

  if (!settings) {
    updateModuleVisibility();
    return;
  }

  inputMin.value = settings.min || "1";
  if (inputMax) inputMax.value = settings.max || "";
  inputCount.value = settings.count || "20";

  if (subjectSelect) subjectSelect.value = settings.subject || "python";
  updateModuleVisibility(settings.module || null);

  showCorrectCheckbox.checked =
    settings.showCorrect !== undefined ? settings.showCorrect : true;
}

function loadThemeSetting() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
    if (savedTheme === null) localStorage.setItem("theme", "light");
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

document.addEventListener("DOMContentLoaded", () => {
  loadThemeSetting();
  applyStaticTranslations();
  loadUserSettings();
  initializeQuizData();

  homePage.classList.remove("hide");
  homePage.style.display = "block";
  quizPage.classList.add("hide");
  quizPage.style.display = "none";
  incorrectAnswersSection.classList.add("hide");
  incorrectAnswersSection.style.display = "none";
  mainButtonContainer.classList.add("hide");
  mainButtonContainer.style.display = "none";
  questionNumberDisplay.classList.add("hide");
  questionNumberDisplay.style.display = "none";
  questionContentArea.classList.add("hide");
  questionContentArea.style.display = "none";
  answerButtonsContainer.classList.add("hide");
  answerButtonsContainer.style.display = "none";

  inputMin.addEventListener("input", saveUserSettings);
  inputMax.addEventListener("input", saveUserSettings);
  inputCount.addEventListener("input", saveUserSettings);
  if (subjectSelect) subjectSelect.addEventListener("change", handleSubjectChange);
  if (moduleSelect) moduleSelect.addEventListener("change", saveUserSettingsAndReloadData);
  showCorrectCheckbox.addEventListener("change", saveUserSettings);
  if (themeToggleButton) themeToggleButton.addEventListener("click", toggleTheme);
  if (langToggleButton) langToggleButton.addEventListener("click", handleLangToggle);
});

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

  const availableIndices = [];
  for (let i = start - 1; i <= finish - 1; i++) {
    if (i >= 0 && i < allQuestionsData.length) availableIndices.push(i);
  }

  if (availableIndices.length === 0) {
    alert(t("alert_no_questions_in_range"));
    return;
  }

  const countToSelect = Math.min(questionCount, availableIndices.length);
  const selectedIndices = [];
  const tempSet = new Set();
  while (tempSet.size < countToSelect) {
    tempSet.add(availableIndices[Math.floor(Math.random() * availableIndices.length)]);
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
    const j = Math.floor(Math.random() * (i + 1));
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
    questionContentArea.textContent = t("no_questions_generated");
    nextButton.style.display = "none";
    backButton.style.display = "none";
    return;
  }

  const currentQuestion = quizQuestions[currentQuizQuestionIndex];
  const questionNumber = currentQuizQuestionIndex + 1;
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

    if (answer.correct) button.dataset.correct = "true";

    if (userSelectedAnswers[currentQuizQuestionIndex] === answer.originalIndex) {
      button.classList.add("selected");
      if (showCorrectCheckbox.checked) {
        button.classList.add(answer.correct ? "correct" : "incorrect");
      }
    }

    button.addEventListener("click", () => selectAnswer(index, shuffledAnswers));
  });

  if (userSelectedAnswers[currentQuizQuestionIndex] !== null) {
    Array.from(answerButtonsContainer.children).forEach((button) => {
      button.disabled = true;
      if (showCorrectCheckbox.checked) {
        if (button.dataset.correct === "true") button.classList.add("correct");
        if (button.classList.contains("selected") && button.dataset.correct !== "true") {
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

  if (prevSelectedButton) {
    prevSelectedButton.classList.remove("selected", "correct", "incorrect");
  }
  selectedButton.classList.add("selected");

  incorrectAnswers = incorrectAnswers.filter(
    (q) => q.question !== quizQuestions[currentQuizQuestionIndex].question,
  );

  if (selectedAnswer.correct) {
    if (showCorrectCheckbox.checked) selectedButton.classList.add("correct");
  } else {
    if (showCorrectCheckbox.checked) selectedButton.classList.add("incorrect");
    incorrectAnswers.push({
      ...quizQuestions[currentQuizQuestionIndex],
      userSelectedOriginalIndex: selectedAnswer.originalIndex,
    });
  }

  Array.from(answerButtonsContainer.children).forEach((button, btnIndex) => {
    button.disabled = true;
    const originalAnswer = shuffledAnswers[btnIndex];
    if (showCorrectCheckbox.checked) {
      if (originalAnswer.correct) button.classList.add("correct");
      else if (button.classList.contains("selected")) button.classList.add("incorrect");
    }
  });

  score = 0;
  for (let i = 0; i < quizQuestions.length; i++) {
    const selectedOriginalIndex = userSelectedAnswers[i];
    if (selectedOriginalIndex !== null) {
      const correctAnswer = quizQuestions[i].answers.find(
        (ans) => ans.originalIndex === selectedOriginalIndex,
      );
      if (correctAnswer?.correct) score++;
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
    score,
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
  if (currentQuizQuestionIndex < quizQuestions.length) showQuestion();
  else showQuizResult();
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
    quizPage.classList.add("hide");
    quizPage.style.display = "none";
    homePage.classList.remove("hide");
    homePage.style.display = "block";
    incorrectAnswersSection.classList.add("hide");
    incorrectAnswersSection.style.display = "none";
    mainButtonContainer.classList.add("hide");
    mainButtonContainer.style.display = "none";
    questionNumberDisplay.style.display = "none";
    questionContentArea.style.display = "none";
    answerButtonsContainer.style.display = "none";
    initializeQuizData();
  }
});

backButton.addEventListener("click", () => {
  if (currentQuizQuestionIndex === quizQuestions.length && quizQuestions.length > 0) {
    quizPage.classList.add("hide");
    quizPage.style.display = "none";
    mainButtonContainer.classList.add("hide");
    mainButtonContainer.style.display = "none";
    incorrectAnswersTitle.textContent = t("incorrect_title_colon");
    incorrectAnswersSection.classList.remove("hide");
    incorrectAnswersSection.style.display = "block";
    showIncorrectAnswersButton.style.display = "block";
    displayIncorrectAnswers();
  } else if (currentQuizQuestionIndex > 0) {
    handlePreviousQuestion();
  }
});

function displayIncorrectAnswers() {
  allQuestionsContainer.innerHTML = "";
  const storedIncorrects = JSON.parse(localStorage.getItem("incorrects") || "[]");

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
      answerButton.disabled = true;
      addMediaToElement(answer.text, answerButton);

      if (showCorrectCheckbox.checked) {
        if (answer.correct) answerButton.classList.add("correct");
        if (
          answer.originalIndex === questionData.userSelectedOriginalIndex &&
          !answer.correct
        ) {
          answerButton.classList.add("incorrect");
        }
      }

      answersList.appendChild(answerButton);
    });

    questionItemContainer.appendChild(answersList);
    allQuestionsContainer.appendChild(questionItemContainer);
  });
}

showIncorrectAnswersButton.addEventListener("click", () => {
  incorrectAnswersSection.classList.add("hide");
  incorrectAnswersSection.style.display = "none";
  quizPage.classList.add("hide");
  quizPage.style.display = "none";
  homePage.classList.remove("hide");
  homePage.style.display = "block";
  mainButtonContainer.classList.add("hide");
  mainButtonContainer.style.display = "none";
  questionNumberDisplay.style.display = "none";
  questionContentArea.style.display = "none";
  answerButtonsContainer.style.display = "none";
  initializeQuizData();
});