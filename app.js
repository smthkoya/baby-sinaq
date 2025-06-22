import { loadQuizData } from "./data.js";

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
const quizPage = document.querySelector(".quiz");

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

// ************ Добавление для темной темы ************
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body; // Получаем доступ к body

// --- Функции загрузки данных и инициализации UI ---

async function initializeQuizData() {
    startButton.disabled = true;
    inputMax.value = 'Загрузка...';

    let selectedSubjectFile = "questions_data_mining.txt";
    if (subjectSelect) {
        selectedSubjectFile = subjectSelect.value;
    } else {
        console.warn("subjectSelect не найден. Используется значение по умолчанию.");
    }
    
    try {
        const data = await loadQuizData(selectedSubjectFile);
        allQuestionsData = data.image_question;
        allAnswersCorrectness = data.result;

        if (allQuestionsData && allQuestionsData.length) {
            if (!inputMax.value || parseFloat(inputMax.value) === 0 || parseFloat(inputMax.value) > allQuestionsData.length) {
                inputMax.value = allQuestionsData.length;
            }
            startButton.disabled = false;
        } else {
            inputMax.value = 0;
            console.warn(`Данные для викторины не загружены или пусты.`);
            alert(`Не удалось загрузить данные для викторины.`);
        }
    } catch (error) {
        console.error("Ошибка загрузки данных викторины:", error);
        inputMax.value = "Ошибка";
        startButton.disabled = true;
        alert(`Произошла ошибка при загрузке данных.`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // ************ Сначала загружаем настройки темы ************
    loadThemeSetting(); 
    
    // ************ Затем загружаем остальные пользовательские настройки ************
    loadUserSettings();
    initializeQuizData();
    
    // ************ Устанавливаем начальное состояние видимости страниц ************
    // Гарантируем, что homePage видна, а остальные скрыты при загрузке
    homePage.classList.remove("hide");
    homePage.style.display = 'block'; // Убедимся, что она отображается

    quizPage.classList.add("hide");
    quizPage.style.display = 'none';

    incorrectAnswersSection.classList.add("hide");
    incorrectAnswersSection.style.display = 'none';

    mainButtonContainer.classList.add("hide"); // Кнопки "Далее/Назад" скрыты на главной
    mainButtonContainer.style.display = 'none';

    // Элементы викторины (номер вопроса, контент, кнопки ответов) должны быть скрыты на старте
    questionNumberDisplay.classList.add('hide');
    questionNumberDisplay.style.display = 'none';
    questionContentArea.classList.add('hide');
    questionContentArea.style.display = 'none';
    answerButtonsContainer.classList.add('hide');
    answerButtonsContainer.style.display = 'none';


    inputMin.addEventListener("input", saveUserSettings);
    inputMax.addEventListener("input", saveUserSettings);
    inputCount.addEventListener("input", saveUserSettings);
    
    if (subjectSelect) {
        subjectSelect.addEventListener("change", saveUserSettingsAndReloadData);
    }
    showCorrectCheckbox.addEventListener("change", saveUserSettings);

    // ************ Обработчик для кнопки переключения темы ************
    themeToggleButton.addEventListener('click', toggleTheme);
});

function saveUserSettingsAndReloadData() {
    saveUserSettings();
    initializeQuizData();
}

function saveUserSettings() {
    const settings = {
        min: inputMin.value,
        max: inputMax.value,
        count: inputCount.value,
        subject: subjectSelect ? subjectSelect.value : "questions_data_mining.txt",
        showCorrect: showCorrectCheckbox.checked
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
        inputCount.value = settings.count || "50";
        if (subjectSelect) {
            subjectSelect.value = settings.subject || "questions_data_mining.txt";
        }
        showCorrectCheckbox.checked = settings.showCorrect !== undefined ? settings.showCorrect : true;
    }
}

// ************ Функции для сохранения/загрузки темы ************
function loadThemeSetting() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    } else if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
    } else {
        // Если тема не сохранена, проверяем системные настройки
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    }
}

function toggleTheme() {
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
}

startButton.addEventListener("click", () => {
    if (startButton.disabled || allQuestionsData.length === 0) {
        alert("Пожалуйста, дождитесь загрузки вопросов или проверьте файлы.");
        return;
    }

    // Мгновенное скрытие home и показ quiz
    homePage.classList.add("hide");
    homePage.style.display = 'none';
    
    quizPage.classList.remove("hide");
    quizPage.style.display = 'block';

    incorrectAnswersSection.classList.add("hide");
    incorrectAnswersSection.style.display = 'none';

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

    if (isNaN(start) || isNaN(finish) || isNaN(questionCount) || start < 1 || questionCount < 1) {
        alert("Пожалуйста, введите действительные числа для диапазона и количества вопросов.");
        return;
    }
    if (finish < start) {
        alert("Максимальный номер вопроса не может быть меньше минимального.");
        return;
    }
    if (start > allQuestionsData.length || finish > allQuestionsData.length) {
        alert(`Диапазон вопросов выходит за пределы доступных вопросов (${allQuestionsData.length}).`);
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
        alert("В выбранном диапазоне нет доступных вопросов. Измените диапазон.");
        return;
    }

    const countToSelect = Math.min(questionCount, availableIndices.length);

    const selectedIndices = [];
    const tempSet = new Set();
    while (tempSet.size < countToSelect) {
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
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
    incorrectAnswersSection.style.display = 'none';

    mainButtonContainer.classList.remove("hide");
    mainButtonContainer.style.display = 'flex';

    // Элементы вопроса сразу видны, без задержки
    questionNumberDisplay.classList.remove('hide');
    questionContentArea.classList.remove('hide');
    answerButtonsContainer.classList.remove('hide');
    
    questionNumberDisplay.style.display = 'block';
    questionContentArea.style.display = 'block';
    answerButtonsContainer.style.display = 'block';

    currentQuizQuestionIndex = 0;
    score = 0;
    userSelectedAnswers = Array(quizQuestions.length).fill(null);
    nextButton.textContent = "Далее";
    backButton.textContent = "Назад";
    showQuestion();
}

function addMediaToElement(content, container) {
    container.innerHTML = '';
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
    // Вопросы теперь меняются мгновенно
    resetState();
    questionNumberDisplay.textContent = "";
    questionContentArea.innerHTML = "";

    if (quizQuestions.length === 0) {
        questionNumberDisplay.textContent = "";
        questionContentArea.textContent = "Вопросы не сгенерированы. Проверьте ваш ввод или выберите предмет.";
        answerButtonsContainer.innerHTML = '';
        nextButton.style.display = 'none';
        backButton.style.display = 'none';
        return;
    }

    let currentQuestion = quizQuestions[currentQuizQuestionIndex];
    let questionNumber = currentQuizQuestionIndex + 1;
    const totalQuestions = quizQuestions.length;

    questionNumberDisplay.textContent = `${questionNumber} из ${totalQuestions}. `;

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

        if (userSelectedAnswers[currentQuizQuestionIndex] === answer.originalIndex) {
            button.classList.add("selected");
            if (showCorrectCheckbox.checked) {
                if (answer.correct) {
                    button.classList.add("correct");
                } else {
                    button.classList.add("incorrect");
                }
            }
        }

        button.addEventListener("click", () =>
            selectAnswer(index, shuffledAnswers)
        );
    });

    if (userSelectedAnswers[currentQuizQuestionIndex] !== null) {
        Array.from(answerButtonsContainer.children).forEach((button) => {
            button.disabled = true;
            if (showCorrectCheckbox.checked) {
                if (button.dataset.correct === "true") {
                    button.classList.add("correct");
                } else if (button.classList.contains("selected") && button.dataset.correct !== "true") {
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

    incorrectAnswers = incorrectAnswers.filter(q => q.question !== quizQuestions[currentQuizQuestionIndex].question);

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
            userSelectedOriginalIndex: selectedAnswer.originalIndex
        });
    }

    Array.from(answerButtonsContainer.children).forEach((button, btnIndex) => {
        button.disabled = true;
        const originalAnswerOfButton = shuffledAnswers[btnIndex];

        if (checkbox.checked) {
            if (originalAnswerOfButton.correct) {
                button.classList.add("correct");
            } else if (button.classList.contains("selected") && !originalAnswerOfButton.correct) {
                button.classList.add("incorrect");
            }
        }
    });

    score = 0;
    for (let i = 0; i < quizQuestions.length; i++) {
        const question = quizQuestions[i];
        const selectedOriginalIndex = userSelectedAnswers[i];
        if (selectedOriginalIndex !== null) {
            const correctAnswer = question.answers.find(ans => ans.originalIndex === selectedOriginalIndex);
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

    // Мгновенное скрытие элементов вопроса
    questionNumberDisplay.classList.add("hide");
    questionContentArea.classList.add("hide");
    answerButtonsContainer.classList.add("hide");

    questionNumberDisplay.style.display = 'none';
    questionContentArea.style.display = 'none';
    answerButtonsContainer.style.display = 'none';

    questionNumberDisplay.textContent = ""; // Очищаем для результата
    questionContentArea.innerHTML = `Вы набрали ${score} из ${quizQuestions.length}!`;
    
    mainButtonContainer.classList.remove("hide");
    mainButtonContainer.style.display = 'flex';

    nextButton.textContent = "Играть снова";
    backButton.textContent = "Показать неправильные";
    nextButton.style.display = "block";

    // Показываем область контента результата мгновенно
    questionContentArea.classList.remove("hide");
    questionContentArea.style.display = 'block';

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
        nextButton.textContent = "Завершить";
    } else if (currentQuizQuestionIndex < quizQuestions.length) {
        nextButton.textContent = "Далее";
    }

    if (currentQuizQuestionIndex === quizQuestions.length) {
        nextButton.textContent = "Играть снова";
        backButton.textContent = "Показать неправильные";
    } else if (currentQuizQuestionIndex === 0) {
        backButton.textContent = "Назад";
    }
}

function updateNavigationButtonsVisibility() {
    nextButton.style.display = "block";
    backButton.style.display = "block";
}


nextButton.addEventListener("click", () => {
    if (currentQuizQuestionIndex < quizQuestions.length) {
        handleNextQuestion();
    } else { // Если на экране результатов (кнопка "Играть снова")
        // Мгновенное скрытие quiz, показ home
        quizPage.classList.add("hide");
        quizPage.style.display = 'none';

        homePage.classList.remove("hide");
        homePage.style.display = 'block';

        incorrectAnswersSection.classList.add("hide");
        incorrectAnswersSection.style.display = 'none';

        mainButtonContainer.classList.add("hide"); // Скрываем кнопки навигации
        mainButtonContainer.style.display = 'none';
        
        // Сбрасываем display у элементов вопросов, чтобы они снова появились при старте викторины
        questionNumberDisplay.style.display = 'none';
        questionContentArea.style.display = 'none';
        answerButtonsContainer.style.display = 'none';

        // Убедимся, что классы анимации удалены для чистоты (хотя они уже не используются)
        questionNumberDisplay.classList.remove('hide'); 
        questionContentArea.classList.remove('hide');   
        answerButtonsContainer.classList.remove('hide');
        
        initializeQuizData();
    }
});

backButton.addEventListener("click", () => {
    if (currentQuizQuestionIndex === quizQuestions.length && quizQuestions.length > 0) {
        // Мгновенное скрытие основных элементов викторины, показ incorrect
        questionNumberDisplay.classList.add('hide');
        questionContentArea.classList.add('hide');
        answerButtonsContainer.classList.add('hide');
        mainButtonContainer.classList.add('hide'); // Скрываем кнопки "Далее/Назад"

        questionNumberDisplay.style.display = 'none';
        questionContentArea.style.display = 'none';
        answerButtonsContainer.style.display = 'none';
        mainButtonContainer.style.display = 'none';

        incorrectAnswersTitle.textContent = "Неправильные ответы:";
        incorrectAnswersSection.classList.remove("hide");
        incorrectAnswersSection.style.display = 'block';

        // Кнопка "Вернуться на главную" должна быть видна здесь
        showIncorrectAnswersButton.style.display = 'block';

        displayIncorrectAnswers();
    } else if (currentQuizQuestionIndex > 0) {
        handlePreviousQuestion();
    }
});

// --- Функции для отображения неправильных ответов ---
function displayIncorrectAnswers() {
    allQuestionsContainer.innerHTML = "";

    const storedIncorrects = JSON.parse(localStorage.getItem("incorrects") || "[]");
    if (storedIncorrects.length === 0) {
        allQuestionsContainer.textContent = "Нет неправильных ответов для отображения.";
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
            image.alt = `Вопрос ${index + 1}`;
            image.classList.add("question-image-small");
            questionItemContainer.appendChild(questionTitle);
            questionItemContainer.appendChild(image);
        } else {
            questionTitle.textContent += questionData.question;
            questionItemContainer.appendChild(questionTitle);
        }

        const answersList = document.createElement("div");
        answersList.classList.add("incorrect-answers-list");

        questionData.answers.forEach(answer => {
            const answerButton = document.createElement("button");
            answerButton.classList.add("btn");
            answerButton.disabled = true;

            addMediaToElement(answer.text, answerButton);

            if (answer.correct) {
                answerButton.classList.add("correct");
            }
            if (answer.originalIndex === questionData.userSelectedOriginalIndex && !answer.correct) {
                answerButton.classList.add("incorrect");
            }
            answersList.appendChild(answerButton);
        });
        questionItemContainer.appendChild(answersList);
        allQuestionsContainer.appendChild(questionItemContainer);
    });
}

showIncorrectAnswersButton.addEventListener("click", () => {
    // Мгновенное скрытие incorrect, показ home
    incorrectAnswersSection.classList.add("hide");
    incorrectAnswersSection.style.display = 'none';

    quizPage.classList.add("hide"); // Убедимся, что quizPage тоже скрыта перед возвратом на home
    quizPage.style.display = 'none';

    homePage.classList.remove("hide");
    homePage.style.display = 'block';

    mainButtonContainer.classList.add("hide"); // mainButtonContainer должен быть скрыт на главной странице
    mainButtonContainer.style.display = 'none';
    
    // Сбрасываем display у элементов вопросов
    questionNumberDisplay.style.display = 'none';
    questionContentArea.style.display = 'none';
    answerButtonsContainer.style.display = 'none';

    // Убедимся, что классы hide удалены для чистоты
    questionNumberDisplay.classList.remove('hide');
    questionContentArea.classList.remove('hide');
    answerButtonsContainer.classList.remove('hide');
    
    initializeQuizData();
});