const SECURITY_GATEWAYS_SUBJECT = "security_gateways";

const SECURITY_GATEWAYS_MODULES = [
  { file: "questions_security_gateways_module4.txt", label: "Module 4 — Authentication & Access Control" },
  { file: "questions_security_gateways_module5.txt", label: "Module 5 — Private Networks" },
  { file: "questions_security_gateways_module6.txt", label: "Module 6 — Attacks & Defense" },
];

const CLOUD_MODULES = [
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
];

function getSubjectKey() {
  return document.getElementById("subject-select")?.value || "python";
}

function fillModuleSelect(modules, preferredValue = null) {
  const moduleSelect = document.getElementById("module-select");
  if (!moduleSelect) return;

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

function syncModulesForSubject() {
  const subjectSelect = document.getElementById("subject-select");
  const moduleSelection = document.getElementById("module-selection");
  const moduleSelect = document.getElementById("module-select");
  if (!subjectSelect || !moduleSelection || !moduleSelect) return;

  const subject = subjectSelect.value;
  const saved = JSON.parse(localStorage.getItem("quizSettings") || "{}");

  if (subject === SECURITY_GATEWAYS_SUBJECT) {
    fillModuleSelect(SECURITY_GATEWAYS_MODULES, saved.securityGatewaysModule);
    moduleSelection.classList.remove("hide");
  } else if (subject === "python") {
    fillModuleSelect(CLOUD_MODULES, saved.module);
    moduleSelection.classList.remove("hide");
  }
}

// app.js currently treats unknown subjects as a direct file path. Redirect the
// Security Gateways subject key to whichever Security Gateways module is selected.
const nativeFetch = window.fetch.bind(window);
window.fetch = function patchedFetch(resource, init) {
  const subject = getSubjectKey();
  const moduleSelect = document.getElementById("module-select");

  if (
    subject === SECURITY_GATEWAYS_SUBJECT &&
    typeof resource === "string" &&
    resource === SECURITY_GATEWAYS_SUBJECT &&
    moduleSelect?.value
  ) {
    return nativeFetch(moduleSelect.value, init);
  }

  return nativeFetch(resource, init);
};

document.addEventListener("DOMContentLoaded", () => {
  const subjectSelect = document.getElementById("subject-select");
  const moduleSelect = document.getElementById("module-select");
  if (!subjectSelect || !moduleSelect) return;

  subjectSelect.addEventListener("change", () => {
    // app.js also handles this event and may hide #module-selection for subjects
    // it does not know. Run after its handler so our final UI state is correct.
    setTimeout(syncModulesForSubject, 0);
  });

  moduleSelect.addEventListener("change", () => {
    if (subjectSelect.value !== SECURITY_GATEWAYS_SUBJECT) return;

    const settings = JSON.parse(localStorage.getItem("quizSettings") || "{}");
    settings.securityGatewaysModule = moduleSelect.value;
    localStorage.setItem("quizSettings", JSON.stringify(settings));
  });

  // app.js restores quizSettings in its own DOMContentLoaded handler. Wait until
  // that finishes, then rebuild the correct module list and trigger one reload.
  setTimeout(() => {
    syncModulesForSubject();
    if (subjectSelect.value === SECURITY_GATEWAYS_SUBJECT) {
      moduleSelect.dispatchEvent(new Event("change"));
    }
  }, 0);
});
