async function fetchTextData(filePath) {
  try {
    let response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} for ${filePath}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching data from ${filePath}:`, error);
    return ""; // Return empty string on error to prevent further issues
  }
}

async function fetchImageFiles(directoryPath = "./output_images") {
  try {
    // Attempt to fetch directory listing. This might fail on some servers.
    let response = await fetch(directoryPath);
    if (!response.ok) {
      console.warn(`Could not fetch image files from ${directoryPath}. This might be expected if directory listing is not enabled on your server, or if the path is incorrect.`);
      return []; // Return empty array if directory listing fails
    }
    // Assuming the server returns a JSON array of filenames
    // or an object where keys are filenames. Adjust parsing if needed.
    const files = await response.json();
    return Object.keys(files).sort(
      (a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || 0); // Extract number safely
        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
        return numA - numB;
      }
    );
  } catch (error) {
    console.warn(`Error fetching image files from ${directoryPath}:`, error);
    return []; // Return empty array on error
  }
}

function parseQuestionsAndAnswers(lines) {
  const questions = [];
  const answers = [];
  const correctFlags = [];
  const answerCounts = [];

  let i = 0;
  let currentAnswerCount = 0;

  while (i < lines.length) {
    let line = lines[i].trim();
    if (line.match(/^\d+\./)) { // Question line (e.g., "1.")
      if (currentAnswerCount > 0) {
        answerCounts.push(currentAnswerCount);
        currentAnswerCount = 0;
      }
      let questionText = line.slice(line.indexOf(".") + 1).trim(); // Get text after number
      i++;
      // Collect multi-line question text if present
      while (
        i < lines.length &&
        !lines[i].trim().match(/^\d+\./) && // Not a new question
        !lines[i].trim().startsWith("√") && // Not a correct answer
        !lines[i].trim().startsWith("•") // Not an incorrect answer
      ) {
        questionText += " " + lines[i].trim();
        i++;
      }
      questions.push(questionText);
    } else if (line.startsWith("√") || line.startsWith("•")) { // Answer line
      correctFlags.push(line.startsWith("√"));
      answers.push(line.slice(1).trim()); // Get text after '√' or '•'
      currentAnswerCount++;
      i++;
    } else {
      i++; // Skip empty or unrecognized lines
    }
  }
  if (currentAnswerCount > 0) { // Add count for the last question
    answerCounts.push(currentAnswerCount);
  }
  return { questions, answers, correctFlags, answerCounts };
}

// ЭКСПОРТИРУЕМАЯ АСИНХРОННАЯ ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ ДАННЫХ
export async function loadQuizData(questionFilePath, imageDirectoryPath = "./output_images") {
  const rawText = await fetchTextData(questionFilePath);
  const lines = rawText.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
      console.warn(`No content in ${questionFilePath}. Returning empty data.`);
      return { image_question: [], result: [] };
  }

  const { questions, answers, correctFlags, answerCounts } = parseQuestionsAndAnswers(lines);

  // Calculate cumulative counts for slicing answers and flags
  const cumulativeCounts = Array.from(
    { length: answerCounts.length + 1 },
    (_, i) => answerCounts.slice(0, i).reduce((acc, val) => acc + val, 0)
  );

  const questionCorrectFlags = Array.from({ length: answerCounts.length }, (_, i) =>
    correctFlags.slice(cumulativeCounts[i], cumulativeCounts[i + 1])
  );

  const questionAnswersGrouped = Array.from({ length: answerCounts.length }, (_, i) =>
    answers.slice(cumulativeCounts[i], cumulativeCounts[i + 1])
  );

  // Your original logic for handling image files
  let imageCounter = 0;
  const imageFiles = await fetchImageFiles(imageDirectoryPath);

  const finalImageQuestions = [];
  for (let i = 0; i < questions.length; i++) {
    let questionContent = questions[i];
    // Check if question is purely numeric or empty (implies an image placeholder)
    // This regex `!/[a-zA-Zа-яА-Я0-9]/.test(questionContent)` is safer for checking "empty" text questions
    // If it's a number, it could be a question like "1." if not stripped properly
    if (!/[a-zA-Zа-яА-Я]/.test(questionContent) && !/[0-9]/.test(questionContent) && imageCounter < imageFiles.length) {
       // Ensure the path is correct for images
       questionContent = `${imageDirectoryPath}/${imageFiles[imageCounter]}`;
       imageCounter++;
    }
    finalImageQuestions.push([questionContent].concat(questionAnswersGrouped[i] || [])); // Ensure answers are an array
  }
  
  return { image_question: finalImageQuestions, result: questionCorrectFlags };
}