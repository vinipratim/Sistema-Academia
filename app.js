const STORAGE_KEY = "sistema-treinos-v2";
const AUTH_TOKEN_KEY = "sistema-treinos-auth-token";
const API_STATE_URL = "/api/state";
const API_LOGIN_URL = "/api/login";
let remotePersistenceAvailable = false;
let persistTimer;
let authToken = localStorage.getItem(AUTH_TOKEN_KEY) || "";

const defaultExerciseCatalog = [
  "MOBILIDADE DE QUADRIL",
  "SUPINO INCLINADO",
  "VOADOR",
  "SUPINO MAQUINA PEGADA NEUTRA",
  "DESENVOLVIMENTO ARTICULADO",
  "DESENVOLVIMENTO ARNOLD",
  "ELEVACAO LATERAL",
  "TRICEPS PULLEY",
  "TRICEPS CORDA",
  "MERGULHO",
  "AGACHAMENTO HACK",
  "AGACHAMENTO HACK INVERSO",
  "LEG PRESS",
  "AFUNDO",
  "AFUNDO C/ HALTER",
  "AFUNDO BULGARO",
  "EXTENSORA",
  "CADEIRA EXTENSORA",
  "FLEXORA",
  "MESA FLEXORA",
  "ADUTORA",
  "ABDUTORA",
  "ELEVACAO PELVICA",
  "STIF",
  "COICE NA POLIA",
  "AGACHAMENTO SUMO NA MAQUINA",
  "ABDOMINAL NA PRANCHA DECLINADA",
  "ABDOMINAL CRUNCH CRUZADO",
  "ABDOMINAL SUPRA",
  "PRANCHA ISOMETRICA",
  "ELEVACAO DE PERNAS",
  "PUXADA HAMMER",
  "PUXADA FRENTE SUPINADA",
  "PUXADA SUPINADA",
  "REMADA BAIXA",
  "REMADA CAVALO",
  "REMADA UNILATERAL",
  "CRUCIFIXO INVERTIDO",
  "ROSCA DIRETA",
  "ROSCA BICEPS ALTERNADO",
  "BANCO SCOTH",
  "PANTURRILHA UNILATERAL",
  "PANTURRILHA SENTADO",
  "PANTURRILHA EM PE UNILATERAL",
];

const focusOptions = [
  "Peito, ombros e triceps",
  "Pernas e abdomen",
  "Costas e biceps",
  "Superiores",
  "Posterior e gluteos",
  "Pernas completo",
  "Quadriceps",
  "Posterior",
  "Gluteos",
  "Abdomen",
  "Personalizado",
];

const seriesOptions = ["1", "2", "3", "4", "5", "6", "BI-SET", "TRI-SET", "DROP-SET"];
const repsOptions = ["6", "8", "10", "10 A 12", "12", "12 A 15", "15", "16", "20", "FALHA", "30 SEG", "45 SEG", "60 SEG"];
const muscleGroups = ["Peito", "Costas", "Pernas", "Ombros", "Bracos", "Abdomen", "Gluteos", "Panturrilha", "Mobilidade", "Outros"];
const equipmentOptions = ["Maquina", "Halter", "Barra", "Polia", "Peso corporal", "Cardio", "Livre", "Outros"];

const initialDays = [
  {
    name: "01",
    focus: "Peito, ombros e triceps",
    exercises: [
      ["SUPINO INCLINADO", "3", "12", "", ""],
      ["VOADOR", "3", "12", "", ""],
      ["SUPINO MAQUINA PEGADA NEUTRA", "3", "12", "", ""],
      ["DESENVOLVIMENTO ARTICULADO", "3", "12", "", ""],
      ["ELEVACAO LATERAL", "3", "15", "", ""],
      ["TRICEPS PULLEY", "3", "12", "", ""],
      ["MERGULHO", "3", "12", "", ""],
    ],
  },
  {
    name: "02",
    focus: "Pernas e abdomen",
    exercises: [
      ["AGACHAMENTO HACK", "3", "12", "", ""],
      ["LEG PRESS", "3", "12", "", ""],
      ["AFUNDO", "3", "12", "", ""],
      ["EXTENSORA", "3", "12", "", ""],
      ["FLEXORA", "3", "12", "", ""],
      ["ABDOMINAL NA PRANCHA DECLINADA", "3", "12", "", ""],
    ],
  },
  {
    name: "03",
    focus: "Costas e biceps",
    exercises: [
      ["PUXADA HAMMER", "3", "12", "", ""],
      ["REMADA BAIXA", "3", "12", "", ""],
      ["PUXADA FRENTE SUPINADA", "3", "12", "", ""],
      ["REMADA CAVALO", "3", "12", "", ""],
      ["ROSCA DIRETA", "3", "12", "", ""],
      ["BANCO SCOTH", "3", "12", "", ""],
    ],
  },
];

let state = loadState() || {
  students: [],
  savedWorkouts: [],
  exerciseCatalog: clone(defaultExerciseCatalog),
  exerciseGroups: buildDefaultExerciseGroups(),
  exerciseEquipment: buildDefaultExerciseEquipment(),
  selectedStudentId: "",
  selectedWorkoutId: "",
  studentName: "",
  studentContact: "",
  studentGoal: "",
  studentLevel: "iniciante",
  studentNotes: "",
  studentWeight: "",
  studentHeight: "",
  studentBodyFat: "",
  studentAssessmentDate: "",
  studentMeasurements: "",
  teacherName: "",
  title: "Treino personalizado",
  profile: "personalizado",
  docxLayout: "simples",
  workoutStatus: "rascunho",
  workoutStartDate: "",
  workoutEndDate: "",
  cardioType: "",
  cardioDuration: "",
  cardioIntensity: "",
  cardioFrequency: "",
  notes: "3X ENTRE 10 A 15 REPETICOES",
  activeDay: 0,
  showPreview: false,
  days: clone(initialDays),
};

const elements = {
  studentSelect: document.querySelector("#studentSelect"),
  loginOverlay: document.querySelector("#loginOverlay"),
  loginForm: document.querySelector("#loginForm"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  newStudentBtn: document.querySelector("#newStudentBtn"),
  saveStudentBtn: document.querySelector("#saveStudentBtn"),
  deleteStudentBtn: document.querySelector("#deleteStudentBtn"),
  studentName: document.querySelector("#studentName"),
  studentContact: document.querySelector("#studentContact"),
  studentGoal: document.querySelector("#studentGoal"),
  studentLevel: document.querySelector("#studentLevel"),
  studentNotes: document.querySelector("#studentNotes"),
  studentWeight: document.querySelector("#studentWeight"),
  studentHeight: document.querySelector("#studentHeight"),
  studentBodyFat: document.querySelector("#studentBodyFat"),
  studentAssessmentDate: document.querySelector("#studentAssessmentDate"),
  studentMeasurements: document.querySelector("#studentMeasurements"),
  teacherName: document.querySelector("#teacherName"),
  workoutTitle: document.querySelector("#workoutTitle"),
  workoutProfile: document.querySelector("#workoutProfile"),
  docxLayout: document.querySelector("#docxLayout"),
  workoutStatus: document.querySelector("#workoutStatus"),
  workoutStartDate: document.querySelector("#workoutStartDate"),
  workoutEndDate: document.querySelector("#workoutEndDate"),
  cardioType: document.querySelector("#cardioType"),
  cardioDuration: document.querySelector("#cardioDuration"),
  cardioIntensity: document.querySelector("#cardioIntensity"),
  cardioFrequency: document.querySelector("#cardioFrequency"),
  workoutSelect: document.querySelector("#workoutSelect"),
  newWorkoutBtn: document.querySelector("#newWorkoutBtn"),
  saveWorkoutBtn: document.querySelector("#saveWorkoutBtn"),
  duplicateWorkoutBtn: document.querySelector("#duplicateWorkoutBtn"),
  workoutHistory: document.querySelector("#workoutHistory"),
  generalNotes: document.querySelector("#generalNotes"),
  libraryExerciseSearch: document.querySelector("#libraryExerciseSearch"),
  libraryExerciseSelect: document.querySelector("#libraryExerciseSelect"),
  libraryExerciseName: document.querySelector("#libraryExerciseName"),
  libraryExerciseGroup: document.querySelector("#libraryExerciseGroup"),
  libraryExerciseEquipment: document.querySelector("#libraryExerciseEquipment"),
  newExerciseBtn: document.querySelector("#newExerciseBtn"),
  saveExerciseBtn: document.querySelector("#saveExerciseBtn"),
  deleteExerciseBtn: document.querySelector("#deleteExerciseBtn"),
  screenTitle: document.querySelector("#screenTitle"),
  dayTabs: document.querySelector("#dayTabs"),
  daysContainer: document.querySelector("#daysContainer"),
  addDayBtn: document.querySelector("#addDayBtn"),
  increaseDayBtn: document.querySelector("#increaseDayBtn"),
  saveBtn: document.querySelector("#saveBtn"),
  previewBtn: document.querySelector("#previewBtn"),
  pdfBtn: document.querySelector("#pdfBtn"),
  printBtn: document.querySelector("#printBtn"),
  downloadBtn: document.querySelector("#downloadBtn"),
  previewPanel: document.querySelector("#previewPanel"),
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist local state:", error);
  }
  persistRemoteState();
}

async function hydrateRemoteState() {
  try {
    const response = await fetch(API_STATE_URL, { headers: getAuthHeaders() });

    if (response.status === 401) {
      showLogin();
      return;
    }

    if (!response.ok) return;

    const remoteState = await response.json();
    remotePersistenceAvailable = true;

    if (remoteState && Object.keys(remoteState).length) {
      state = remoteState;
      render();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    remotePersistenceAvailable = false;
  }
}

function persistRemoteState() {
  if (!remotePersistenceAvailable) return;

  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    fetch(API_STATE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(state),
    })
      .then((response) => {
        if (response.status === 401) {
          remotePersistenceAvailable = false;
          showLogin();
        }
      })
      .catch(() => {
        remotePersistenceAvailable = false;
      });
  }, 350);
}

function getAuthHeaders() {
  // Use Bearer scheme, matching the server token response { token }
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

function showLogin(message = "") {
  elements.loginOverlay.hidden = false;
  elements.loginError.textContent = message;
  elements.loginPassword.focus();
}

function hideLogin() {
  elements.loginOverlay.hidden = true;
  elements.loginPassword.value = "";
  elements.loginError.textContent = "";
}

function clearStudentForm() {
  state.selectedStudentId = "";
  state.studentName = "";
  state.studentContact = "";
  state.studentGoal = "";
  state.studentLevel = "iniciante";
  state.studentNotes = "";
  state.studentWeight = "";
  state.studentHeight = "";
  state.studentBodyFat = "";
  state.studentAssessmentDate = "";
  state.studentMeasurements = "";
}

function bindStaticEvents() {
  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(API_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: elements.loginPassword.value }),
      });

      if (!response.ok) {
        showLogin("Senha invalida.");
        return;
      }

      const data = await response.json();
      authToken = data.token;
      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      hideLogin();
      hydrateRemoteState();
    } catch {
      showLogin("Nao foi possivel autenticar.");
    }
  });

  elements.studentSelect.addEventListener("change", (event) => {
    selectStudent(event.target.value);
  });

  elements.newStudentBtn.addEventListener("click", () => {
    clearStudentForm();
    render();
    persist();
  });

  elements.saveStudentBtn.addEventListener("click", saveStudent);

  elements.deleteStudentBtn.addEventListener("click", () => {
    if (!state.selectedStudentId) {
      toast("Selecione um aluno para excluir.");
      return;
    }

    state.students = state.students.filter((student) => student.id !== state.selectedStudentId);
    clearStudentForm();
    render();
    persist();
    toast("Aluno excluido.");
  });

  elements.studentName.addEventListener("input", (event) => {
    state.studentName = event.target.value;
    persist();
  });

  elements.studentContact.addEventListener("input", (event) => {
    state.studentContact = event.target.value;
    persist();
  });

  elements.studentGoal.addEventListener("input", (event) => {
    state.studentGoal = event.target.value;
    persist();
  });

  elements.studentLevel.addEventListener("change", (event) => {
    state.studentLevel = event.target.value;
    persist();
  });

  elements.studentNotes.addEventListener("input", (event) => {
    state.studentNotes = event.target.value;
    persist();
  });

  elements.studentWeight.addEventListener("input", (event) => {
    state.studentWeight = event.target.value;
    persist();
  });

  elements.studentHeight.addEventListener("input", (event) => {
    state.studentHeight = event.target.value;
    persist();
  });

  elements.studentBodyFat.addEventListener("input", (event) => {
    state.studentBodyFat = event.target.value;
    persist();
  });

  elements.studentAssessmentDate.addEventListener("input", (event) => {
    state.studentAssessmentDate = event.target.value;
    persist();
  });

  elements.studentMeasurements.addEventListener("input", (event) => {
    state.studentMeasurements = event.target.value;
    persist();
  });

  elements.teacherName.addEventListener("input", (event) => {
    state.teacherName = event.target.value;
    persist();
  });

  elements.workoutTitle.addEventListener("input", (event) => {
    state.title = event.target.value;
    render();
    persist();
  });

  elements.workoutProfile.addEventListener("change", (event) => {
    state.profile = event.target.value;
    persist();
  });

  elements.docxLayout.addEventListener("change", (event) => {
    state.docxLayout = event.target.value;
    persist();
  });

  elements.workoutStatus.addEventListener("change", (event) => {
    state.workoutStatus = event.target.value;
    persist();
  });

  elements.workoutStartDate.addEventListener("input", (event) => {
    state.workoutStartDate = event.target.value;
    persist();
  });

  elements.workoutEndDate.addEventListener("input", (event) => {
    state.workoutEndDate = event.target.value;
    persist();
  });

  elements.cardioType.addEventListener("input", (event) => {
    state.cardioType = event.target.value;
    persist();
  });

  elements.cardioDuration.addEventListener("input", (event) => {
    state.cardioDuration = event.target.value;
    persist();
  });

  elements.cardioIntensity.addEventListener("input", (event) => {
    state.cardioIntensity = event.target.value;
    persist();
  });

  elements.cardioFrequency.addEventListener("input", (event) => {
    state.cardioFrequency = event.target.value;
    persist();
  });

  elements.workoutSelect.addEventListener("change", (event) => {
    selectWorkout(event.target.value);
  });

  elements.newWorkoutBtn.addEventListener("click", newWorkout);
  elements.saveWorkoutBtn.addEventListener("click", saveWorkout);
  elements.duplicateWorkoutBtn.addEventListener("click", duplicateWorkout);

  elements.generalNotes.addEventListener("input", (event) => {
    state.notes = event.target.value;
    persist();
  });

  elements.libraryExerciseSelect.addEventListener("change", (event) => {
    const exerciseName = event.target.value;
    elements.libraryExerciseName.value = exerciseName;
    elements.libraryExerciseGroup.value = state.exerciseGroups[exerciseName] || "Outros";
    elements.libraryExerciseEquipment.value = state.exerciseEquipment[exerciseName] || "Outros";
  });

  elements.libraryExerciseSearch.addEventListener("input", () => {
    renderLibraryExerciseSelect();
  });

  elements.newExerciseBtn.addEventListener("click", () => {
    elements.libraryExerciseSelect.value = "";
    elements.libraryExerciseName.value = "";
    elements.libraryExerciseGroup.value = "Outros";
    elements.libraryExerciseEquipment.value = "Outros";
    elements.libraryExerciseName.focus();
  });

  elements.saveExerciseBtn.addEventListener("click", saveLibraryExercise);
  elements.deleteExerciseBtn.addEventListener("click", deleteLibraryExercise);

  elements.addDayBtn.addEventListener("click", addDay);
  elements.increaseDayBtn.addEventListener("click", addDay);

  elements.saveBtn.addEventListener("click", () => {
    persist();
    toast("Treino salvo no navegador.");
  });

  elements.previewBtn.addEventListener("click", () => {
    state.showPreview = !state.showPreview;
    render();
    persist();
  });

  elements.downloadBtn.addEventListener("click", downloadDocx);
  elements.pdfBtn.addEventListener("click", downloadPdf);
  elements.printBtn.addEventListener("click", () => {
    state.showPreview = true;
    render();
    window.print();
  });
}

function selectStudent(studentId) {
  const student = state.students.find((item) => item.id === studentId);
  state.selectedStudentId = studentId;
  state.selectedWorkoutId = "";

  if (student) {
    state.studentName = student.name;
    state.studentContact = student.contact;
    state.studentGoal = student.goal;
    state.studentLevel = student.level;
    state.studentNotes = student.notes;
    state.studentWeight = student.weight;
    state.studentHeight = student.height;
    state.studentBodyFat = student.bodyFat;
    state.studentAssessmentDate = student.assessmentDate;
    state.studentMeasurements = student.measurements;
  }

  render();
  persist();
}

function saveStudent() {
  const name = state.studentName.trim();

  if (!name) {
    toast("Informe o nome do aluno.");
    return;
  }

  const student = {
    id: state.selectedStudentId || createId(),
    name,
    contact: state.studentContact.trim(),
    goal: state.studentGoal.trim(),
    level: state.studentLevel,
    notes: state.studentNotes.trim(),
    weight: state.studentWeight.trim(),
    height: state.studentHeight.trim(),
    bodyFat: state.studentBodyFat.trim(),
    assessmentDate: state.studentAssessmentDate,
    measurements: state.studentMeasurements.trim(),
  };
  const currentIndex = state.students.findIndex((item) => item.id === student.id);

  if (currentIndex >= 0) {
    state.students[currentIndex] = student;
  } else {
    state.students.push(student);
  }

  state.selectedStudentId = student.id;
  render();
  persist();
  toast("Aluno salvo.");
}

function newWorkout() {
  state.selectedWorkoutId = "";
  state.title = "Treino personalizado";
  state.profile = "personalizado";
  state.docxLayout = "simples";
  state.workoutStatus = "rascunho";
  state.workoutStartDate = "";
  state.workoutEndDate = "";
  state.cardioType = "";
  state.cardioDuration = "";
  state.cardioIntensity = "";
  state.cardioFrequency = "";
  state.notes = "3X ENTRE 10 A 15 REPETICOES";
  state.activeDay = 0;
  state.days = clone(initialDays);
  render();
  persist();
}

function saveWorkout() {
  if (!state.selectedStudentId) {
    toast("Selecione ou salve um aluno antes do treino.");
    return;
  }

  const workout = {
    id: state.selectedWorkoutId || createId(),
    studentId: state.selectedStudentId,
    title: state.title.trim() || "Treino sem titulo",
    profile: state.profile,
    docxLayout: state.docxLayout,
    status: state.workoutStatus,
    startDate: state.workoutStartDate,
    endDate: state.workoutEndDate,
    cardio: getCardioState(),
    notes: state.notes,
    days: clone(state.days),
    updatedAt: new Date().toISOString(),
  };
  const currentIndex = state.savedWorkouts.findIndex((item) => item.id === workout.id);

  if (currentIndex >= 0) {
    state.savedWorkouts[currentIndex] = workout;
  } else {
    state.savedWorkouts.push(workout);
  }

  state.selectedWorkoutId = workout.id;
  render();
  persist();
  toast("Treino salvo para o aluno.");
}

function duplicateWorkout() {
  if (!state.selectedStudentId) {
    toast("Selecione ou salve um aluno antes de duplicar.");
    return;
  }

  const title = state.title.trim() || "Treino sem titulo";
  const workout = {
    id: createId(),
    studentId: state.selectedStudentId,
    title: `Copia - ${title}`,
    profile: state.profile,
    docxLayout: state.docxLayout,
    status: state.workoutStatus,
    startDate: state.workoutStartDate,
    endDate: state.workoutEndDate,
    cardio: getCardioState(),
    notes: state.notes,
    days: clone(state.days),
    updatedAt: new Date().toISOString(),
  };

  state.savedWorkouts.push(workout);
  state.selectedWorkoutId = workout.id;
    state.title = workout.title;
    state.profile = workout.profile;
    state.docxLayout = workout.docxLayout || "simples";
    state.workoutStatus = workout.status || "rascunho";
    state.workoutStartDate = workout.startDate || "";
    state.workoutEndDate = workout.endDate || "";
    applyCardioState(workout.cardio);
    state.notes = workout.notes;
  state.days = clone(workout.days);
  state.activeDay = 0;
  render();
  persist();
  toast("Treino duplicado.");
}

function selectWorkout(workoutId) {
  const workout = state.savedWorkouts.find((item) => item.id === workoutId);
  state.selectedWorkoutId = workoutId;

  if (workout) {
    state.title = workout.title;
    state.profile = workout.profile;
    state.notes = workout.notes;
    state.days = clone(workout.days);
    state.activeDay = 0;
  }

  render();
  persist();
}

function saveLibraryExercise() {
  const previousName = elements.libraryExerciseSelect.value;
  const nextName = normalizeExerciseName(elements.libraryExerciseName.value);
  const group = elements.libraryExerciseGroup.value || "Outros";
  const equipment = elements.libraryExerciseEquipment.value || "Outros";

  if (!nextName) {
    toast("Informe o nome do exercicio.");
    return;
  }

  if (previousName && previousName !== nextName) {
    state.exerciseCatalog = state.exerciseCatalog.filter((exercise) => exercise !== previousName);
    delete state.exerciseGroups[previousName];
    delete state.exerciseEquipment[previousName];
    replaceExerciseName(previousName, nextName);
  }

  if (!state.exerciseCatalog.includes(nextName)) {
    state.exerciseCatalog.push(nextName);
  }

  state.exerciseCatalog.sort((a, b) => a.localeCompare(b, "pt-BR"));
  state.exerciseGroups[nextName] = group;
  state.exerciseEquipment[nextName] = equipment;
  render();
  elements.libraryExerciseSelect.value = nextName;
  elements.libraryExerciseName.value = nextName;
  elements.libraryExerciseGroup.value = group;
  elements.libraryExerciseEquipment.value = equipment;
  persist();
  toast("Exercicio salvo.");
}

function deleteLibraryExercise() {
  const exerciseName = elements.libraryExerciseSelect.value;

  if (!exerciseName) {
    toast("Selecione um exercicio para excluir.");
    return;
  }

  state.exerciseCatalog = state.exerciseCatalog.filter((exercise) => exercise !== exerciseName);
  delete state.exerciseGroups[exerciseName];
  delete state.exerciseEquipment[exerciseName];
  render();
  elements.libraryExerciseName.value = "";
  elements.libraryExerciseGroup.value = "Outros";
  elements.libraryExerciseEquipment.value = "Outros";
  persist();
  toast("Exercicio excluido da biblioteca.");
}

function replaceExerciseName(previousName, nextName) {
  state.days.forEach((day) => {
    day.exercises.forEach((exercise) => {
      if (exercise[0] === previousName) {
        exercise[0] = nextName;
      }
    });
  });

  state.savedWorkouts.forEach((workout) => {
    workout.days.forEach((day) => {
      day.exercises.forEach((exercise) => {
        if (exercise[0] === previousName) {
          exercise[0] = nextName;
        }
      });
    });
  });
}

function normalizeExerciseName(value) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

function addDay() {
  state.days.push({
    name: String(state.days.length + 1).padStart(2, "0"),
    focus: "Personalizado",
    exercises: [["", "3", "12", "", "", ""]],
  });
  state.activeDay = state.days.length - 1;
  render();
  persist();
}

function render() {
  normalizeState();
  renderStudentSelect();
  renderLibraryExerciseSelect();
  elements.studentSelect.value = state.selectedStudentId || "";
  elements.studentName.value = state.studentName;
  elements.studentContact.value = state.studentContact;
  elements.studentGoal.value = state.studentGoal;
  elements.studentLevel.value = state.studentLevel;
  elements.studentNotes.value = state.studentNotes;
  elements.studentWeight.value = state.studentWeight;
  elements.studentHeight.value = state.studentHeight;
  elements.studentBodyFat.value = state.studentBodyFat;
  elements.studentAssessmentDate.value = state.studentAssessmentDate;
  elements.studentMeasurements.value = state.studentMeasurements;
  elements.teacherName.value = state.teacherName;
  elements.workoutTitle.value = state.title;
  elements.workoutProfile.value = state.profile || "personalizado";
  elements.docxLayout.value = state.docxLayout || "simples";
  elements.workoutStatus.value = state.workoutStatus || "rascunho";
  elements.workoutStartDate.value = state.workoutStartDate;
  elements.workoutEndDate.value = state.workoutEndDate;
  elements.cardioType.value = state.cardioType;
  elements.cardioDuration.value = state.cardioDuration;
  elements.cardioIntensity.value = state.cardioIntensity;
  elements.cardioFrequency.value = state.cardioFrequency;
  renderWorkoutSelect();
  renderWorkoutHistory();
  elements.workoutSelect.value = state.selectedWorkoutId || "";
  elements.generalNotes.value = state.notes;
  elements.screenTitle.textContent = state.title || "Treino sem titulo";

  renderTabs();
  renderDays();
  renderPreview();
  window.lucide?.createIcons();
}

function renderStudentSelect() {
  elements.studentSelect.innerHTML = '<option value="">Selecionar aluno</option>';

  state.students
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .forEach((student) => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = student.name;
      elements.studentSelect.append(option);
    });
}

function renderWorkoutSelect() {
  elements.workoutSelect.innerHTML = '<option value="">Treino atual</option>';

  state.savedWorkouts
    .filter((workout) => workout.studentId === state.selectedStudentId)
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))
    .forEach((workout) => {
      const option = document.createElement("option");
      option.value = workout.id;
      option.textContent = workout.title;
      elements.workoutSelect.append(option);
    });
}

function renderWorkoutHistory() {
  const workouts = state.savedWorkouts
    .filter((workout) => workout.studentId === state.selectedStudentId)
    .slice()
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

  if (!workouts.length) {
    elements.workoutHistory.innerHTML = "";
    return;
  }

  elements.workoutHistory.innerHTML = workouts
    .map(
      (workout) => `
        <button class="history-item" type="button" data-workout-id="${escapeAttr(workout.id)}">
          <strong>${escapeHtml(workout.title)}</strong>
          <span>${escapeHtml(formatDateTime(workout.updatedAt))}</span>
        </button>
      `,
    )
    .join("");

  elements.workoutHistory.querySelectorAll("[data-workout-id]").forEach((button) => {
    button.addEventListener("click", () => selectWorkout(button.dataset.workoutId));
  });
}

function renderPreview() {
  elements.previewPanel.hidden = !state.showPreview;

  if (!state.showPreview) {
    elements.previewPanel.innerHTML = "";
    return;
  }

  elements.previewPanel.innerHTML = `
    <div class="preview-header">
      <p class="eyebrow">Preview DOCX</p>
      <h2>${escapeHtml(state.title || "Treino")}</h2>
      <p><strong>Aluno:</strong> ${escapeHtml(state.studentName || "-")}</p>
      <p><strong>Professor:</strong> ${escapeHtml(state.teacherName || "-")}</p>
      <p><strong>Divisao:</strong> ${escapeHtml(getProfileLabel(state.profile))}</p>
      <p><strong>Status:</strong> ${escapeHtml(getWorkoutStatusLabel(state.workoutStatus))}</p>
      <p><strong>Nivel:</strong> ${escapeHtml(getStudentLevelLabel(state.studentLevel))}</p>
      ${state.workoutStartDate ? `<p><strong>Inicio:</strong> ${escapeHtml(formatDate(state.workoutStartDate))}</p>` : ""}
      ${state.workoutEndDate ? `<p><strong>Fim:</strong> ${escapeHtml(formatDate(state.workoutEndDate))}</p>` : ""}
      ${hasCardio() ? `<p><strong>Cardio:</strong> ${escapeHtml(formatCardio())}</p>` : ""}
      ${state.studentGoal ? `<p><strong>Objetivo:</strong> ${escapeHtml(state.studentGoal)}</p>` : ""}
      ${state.studentWeight ? `<p><strong>Peso:</strong> ${escapeHtml(state.studentWeight)}</p>` : ""}
      ${state.studentHeight ? `<p><strong>Altura:</strong> ${escapeHtml(state.studentHeight)}</p>` : ""}
      ${state.studentBodyFat ? `<p><strong>Gordura:</strong> ${escapeHtml(state.studentBodyFat)}</p>` : ""}
      ${state.studentAssessmentDate ? `<p><strong>Avaliacao:</strong> ${escapeHtml(formatDate(state.studentAssessmentDate))}</p>` : ""}
      ${state.studentMeasurements ? `<p><strong>Medidas:</strong> ${escapeHtml(state.studentMeasurements)}</p>` : ""}
      ${state.notes ? `<p><strong>Observacoes:</strong> ${escapeHtml(state.notes)}</p>` : ""}
    </div>
    ${state.days.map(renderPreviewDay).join("")}
  `;
}

function renderPreviewDay(day) {
  const focus = day.focus && day.focus !== "Personalizado" ? ` - ${day.focus}` : "";

  return `
    <section class="preview-day">
      <h3>Dia ${escapeHtml(day.name)}${escapeHtml(focus)}</h3>
      ${day.warmup ? `<p><strong>Aquecimento:</strong> ${escapeHtml(day.warmup)}</p>` : ""}
      ${day.notes ? `<p>${escapeHtml(day.notes)}</p>` : ""}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Exercicio</th>
            <th>Series</th>
            <th>Reps</th>
            <th>Descanso</th>
            <th>Carga</th>
            <th>Obs.</th>
          </tr>
        </thead>
        <tbody>
          ${day.exercises
            .map(
              (exercise, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${escapeHtml(exercise[0])}</td>
                  <td>${escapeHtml(exercise[1])}</td>
                  <td>${escapeHtml(exercise[2])}</td>
                  <td>${escapeHtml(exercise[3])}</td>
                  <td>${escapeHtml(exercise[4])}</td>
                  <td>${escapeHtml(exercise[5])}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderLibraryExerciseSelect() {
  elements.libraryExerciseSelect.innerHTML = '<option value="">Novo exercicio</option>';
  const search = elements.libraryExerciseSearch.value.trim().toUpperCase();

  state.exerciseCatalog
    .filter(
      (exercise) =>
        !search ||
        exercise.includes(search) ||
        (state.exerciseGroups[exercise] || "").toUpperCase().includes(search) ||
        (state.exerciseEquipment[exercise] || "").toUpperCase().includes(search),
    )
    .forEach((exercise) => {
    const option = document.createElement("option");
    option.value = exercise;
    option.textContent = `${exercise} - ${state.exerciseGroups[exercise] || "Outros"} - ${state.exerciseEquipment[exercise] || "Outros"}`;
    elements.libraryExerciseSelect.append(option);
    });
}

function renderTabs() {
  elements.dayTabs.innerHTML = "";

  state.days.forEach((day, dayIndex) => {
    const tab = document.createElement("button");
    tab.className = `day-tab ${dayIndex === state.activeDay ? "active" : ""}`;
    tab.type = "button";
    tab.textContent = `Dia ${day.name || dayIndex + 1}`;
    tab.addEventListener("click", () => {
      state.activeDay = dayIndex;
      render();
      persist();
    });
    elements.dayTabs.append(tab);
  });
}

function renderDays() {
  elements.daysContainer.innerHTML = "";

  if (!state.days.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Adicione um dia para comecar o treino.";
    elements.daysContainer.append(empty);
    return;
  }

  state.days.forEach((day, dayIndex) => {
    const card = document.createElement("article");
    card.className = `day-card ${dayIndex === state.activeDay ? "active" : ""}`;

    card.innerHTML = `
      <div class="day-header">
        <label>
          Dia
          <select data-field="name">
            ${buildOptions(["01", "02", "03", "04", "05", "06", "07"], day.name, true)}
          </select>
        </label>
        <label>
          Foco
          <select data-field="focus">
            ${buildOptions(focusOptions, day.focus, true)}
          </select>
        </label>
        <button class="danger" data-action="remove-day" type="button">
          <i data-lucide="trash-2"></i>
          Remover
        </button>
        <label class="day-notes">
          Aquecimento
          <textarea data-field="warmup" rows="2" placeholder="Mobilidade, cardio leve, series de aquecimento...">${escapeHtml(day.warmup || "")}</textarea>
        </label>
        <label class="day-notes">
          Observacoes do dia
          <textarea data-field="notes" rows="2" placeholder="Orientacoes especificas deste dia">${escapeHtml(day.notes || "")}</textarea>
        </label>
      </div>
      <table class="exercise-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Exercicio</th>
            <th>Series</th>
            <th>Repeticoes</th>
            <th>Descanso</th>
            <th>Carga</th>
            <th>Obs.</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <div class="day-footer">
        <button class="secondary" data-action="add-exercise" type="button">
          <i data-lucide="plus"></i>
          Exercicio
        </button>
        <button class="secondary" data-action="duplicate-day" type="button">
          <i data-lucide="copy-plus"></i>
          Duplicar dia
        </button>
      </div>
    `;

    card.querySelectorAll("[data-field]").forEach((input) => {
      const eventName = input.tagName === "TEXTAREA" ? "input" : "change";
      input.addEventListener(eventName, (event) => {
        day[event.target.dataset.field] = event.target.value;
        if (event.target.dataset.field === "focus") {
          render();
        } else {
          renderTabs();
        }
        persist();
      });
    });

    card.querySelector("[data-action='remove-day']").addEventListener("click", () => {
      state.days.splice(dayIndex, 1);
      state.activeDay = Math.max(0, Math.min(state.activeDay, state.days.length - 1));
      render();
      persist();
    });

    card.querySelector("[data-action='add-exercise']").addEventListener("click", () => {
      day.exercises.push(["", "3", "12", "", "", ""]);
      render();
      persist();
    });

    card.querySelector("[data-action='duplicate-day']").addEventListener("click", () => {
      duplicateDay(dayIndex);
    });

    renderExerciseRows(card.querySelector("tbody"), day, dayIndex);
    elements.daysContainer.append(card);
  });
}

function duplicateDay(dayIndex) {
  const sourceDay = state.days[dayIndex];
  const duplicatedDay = clone(sourceDay);

  duplicatedDay.name = String(state.days.length + 1).padStart(2, "0");
  state.days.splice(dayIndex + 1, 0, duplicatedDay);
  state.activeDay = dayIndex + 1;
  render();
  persist();
}

function renderExerciseRows(tbody, day) {
  const exerciseCatalog = getExerciseCatalog();

  day.exercises.forEach((exercise, exerciseIndex) => {
    const selectedExercise = exercise[0] || "";
    const customExercise = selectedExercise && !exerciseCatalog.includes(selectedExercise);
    const customSeries = exercise[1] && !seriesOptions.includes(exercise[1]);
    const customReps = exercise[2] && !repsOptions.includes(exercise[2]);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exerciseIndex + 1}</td>
      <td>
        <select data-column="0" data-kind="exercise">
          ${buildExerciseOptions(exerciseCatalog, selectedExercise, day.focus)}
          <option value="__custom__" ${customExercise ? "selected" : ""}>Outro exercicio</option>
        </select>
        <input class="custom-exercise ${customExercise ? "visible" : ""}" data-kind="custom-exercise" value="${customExercise ? escapeAttr(selectedExercise) : ""}" placeholder="Digite o exercicio" />
      </td>
      <td>
        <select data-column="1" data-kind="quick-value">
          ${buildOptions(seriesOptions, exercise[1] || "3")}
          <option value="__custom__" ${customSeries ? "selected" : ""}>Outro valor</option>
        </select>
        <input class="custom-field ${customSeries ? "visible" : ""}" data-column="1" data-kind="custom-value" value="${customSeries ? escapeAttr(exercise[1]) : ""}" placeholder="Ex.: 4 + drop" />
      </td>
      <td>
        <select data-column="2" data-kind="quick-value">
          ${buildOptions(repsOptions, exercise[2] || "12")}
          <option value="__custom__" ${customReps ? "selected" : ""}>Outro valor</option>
        </select>
        <input class="custom-field ${customReps ? "visible" : ""}" data-column="2" data-kind="custom-value" value="${customReps ? escapeAttr(exercise[2]) : ""}" placeholder="Ex.: 8 + isometria" />
      </td>
      <td><input data-column="3" value="${escapeAttr(exercise[3])}" placeholder="Ex.: 60 seg" /></td>
      <td><input data-column="4" value="${escapeAttr(exercise[4])}" placeholder="Ex.: 20 kg" /></td>
      <td><input data-column="5" value="${escapeAttr(exercise[5])}" placeholder="Ajustes, tecnica..." /></td>
      <td>
        <div class="row-actions">
          <button class="icon-button" data-action="move-up" type="button" title="Mover para cima" ${exerciseIndex === 0 ? "disabled" : ""}>
            <i data-lucide="arrow-up"></i>
          </button>
          <button class="icon-button" data-action="move-down" type="button" title="Mover para baixo" ${exerciseIndex === day.exercises.length - 1 ? "disabled" : ""}>
            <i data-lucide="arrow-down"></i>
          </button>
          <button class="icon-button" data-action="remove-exercise" type="button" title="Remover exercicio">
            <i data-lucide="x"></i>
          </button>
        </div>
      </td>
    `;

    row.querySelectorAll("select[data-column]").forEach((select) => {
      select.addEventListener("change", (event) => {
        const column = Number(event.target.dataset.column);

        if (event.target.dataset.kind === "exercise" && event.target.value === "__custom__") {
          const customInput = row.querySelector("[data-kind='custom-exercise']");
          customInput.classList.add("visible");
          customInput.focus();
          exercise[column] = customInput.value;
          persist();
          return;
        }

        if (event.target.dataset.kind === "quick-value" && event.target.value === "__custom__") {
          const customInput = row.querySelector(`[data-kind='custom-value'][data-column='${column}']`);
          customInput.classList.add("visible");
          customInput.focus();
          exercise[column] = customInput.value;
          persist();
          return;
        }

        exercise[column] = event.target.value;
        if (event.target.dataset.kind === "exercise") {
          row.querySelector("[data-kind='custom-exercise']").classList.remove("visible");
        }
        if (event.target.dataset.kind === "quick-value") {
          row.querySelector(`[data-kind='custom-value'][data-column='${column}']`).classList.remove("visible");
        }
        persist();
      });
    });

    row.querySelectorAll("input[data-column]").forEach((input) => {
      input.addEventListener("input", (event) => {
        exercise[Number(event.target.dataset.column)] = event.target.value;
        persist();
      });
    });

    row.querySelector("[data-kind='custom-exercise']").addEventListener("input", (event) => {
      exercise[0] = event.target.value;
      persist();
    });

    row.querySelector("[data-action='move-up']").addEventListener("click", () => {
      moveExercise(day, exerciseIndex, exerciseIndex - 1);
    });

    row.querySelector("[data-action='move-down']").addEventListener("click", () => {
      moveExercise(day, exerciseIndex, exerciseIndex + 1);
    });

    row.querySelector("[data-action='remove-exercise']").addEventListener("click", () => {
      day.exercises.splice(exerciseIndex, 1);
      render();
      persist();
    });

    tbody.append(row);
  });
}

function moveExercise(day, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= day.exercises.length) {
    return;
  }

  const [exercise] = day.exercises.splice(fromIndex, 1);
  day.exercises.splice(toIndex, 0, exercise);
  render();
  persist();
}

function normalizeState() {
  state.students ||= [];
  state.savedWorkouts ||= [];
  if (!Array.isArray(state.exerciseCatalog) || !state.exerciseCatalog.length) {
    state.exerciseCatalog = clone(defaultExerciseCatalog);
  }
  state.exerciseCatalog = [...new Set(state.exerciseCatalog.map(normalizeExerciseName).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  state.exerciseGroups = {
    ...buildDefaultExerciseGroups(),
    ...(state.exerciseGroups || {}),
  };
  state.exerciseEquipment = {
    ...buildDefaultExerciseEquipment(),
    ...(state.exerciseEquipment || {}),
  };
  state.exerciseCatalog.forEach((exercise) => {
    if (!muscleGroups.includes(state.exerciseGroups[exercise])) {
      state.exerciseGroups[exercise] = inferMuscleGroup(exercise);
    }
    if (!equipmentOptions.includes(state.exerciseEquipment[exercise])) {
      state.exerciseEquipment[exercise] = inferEquipment(exercise);
    }
  });
  state.selectedStudentId ||= "";
  state.selectedWorkoutId ||= "";
  state.showPreview ||= false;
  state.studentContact ||= "";
  state.studentGoal ||= "";
  state.studentLevel ||= "iniciante";
  state.studentNotes ||= "";
  state.studentWeight ||= "";
  state.studentHeight ||= "";
  state.studentBodyFat ||= "";
  state.studentAssessmentDate ||= "";
  state.studentMeasurements ||= "";
  state.students = state.students.map((student) => ({
    id: student.id || createId(),
    name: student.name || "",
    contact: student.contact || "",
    goal: student.goal || "",
    level: student.level || "iniciante",
    notes: student.notes || "",
    weight: student.weight || "",
    height: student.height || "",
    bodyFat: student.bodyFat || "",
    assessmentDate: student.assessmentDate || "",
    measurements: student.measurements || "",
  }));
  state.savedWorkouts = state.savedWorkouts.map((workout) => ({
    id: workout.id || createId(),
    studentId: workout.studentId || "",
    title: workout.title || "Treino sem titulo",
    profile: workout.profile || "personalizado",
    docxLayout: workout.docxLayout || "simples",
    status: workout.status || "rascunho",
    startDate: workout.startDate || "",
    endDate: workout.endDate || "",
    cardio: normalizeCardio(workout.cardio),
    notes: workout.notes || "",
    days: normalizeDays(workout.days || initialDays),
    updatedAt: workout.updatedAt || "",
  }));
  state.profile ||= "personalizado";
  state.docxLayout ||= "simples";
  state.workoutStatus ||= "rascunho";
  state.workoutStartDate ||= "";
  state.workoutEndDate ||= "";
  applyCardioState(normalizeCardio(state.cardio || getCardioState()));
  state.days ||= clone(initialDays);
  state.days.forEach((day) => {
    day.name ||= "01";
    day.focus ||= "Personalizado";
    day.warmup ||= "";
    day.notes ||= "";
    day.exercises ||= [];
    day.exercises = day.exercises.map(normalizeExercise);
  });
}

function normalizeDays(days) {
  return clone(days).map((day) => ({
    ...day,
    warmup: day.warmup || "",
    notes: day.notes || "",
    exercises: (day.exercises || []).map(normalizeExercise),
  }));
}

function normalizeExercise(exercise) {
  if (exercise.length >= 6) {
    return [
      exercise[0] || "",
      exercise[1] || "3",
      exercise[2] || "12",
      exercise[3] || "",
      exercise[4] || "",
      exercise[5] || "",
    ];
  }

  if (exercise.length >= 5) {
    return [exercise[0] || "", exercise[1] || "3", exercise[2] || "12", exercise[3] || "", "", exercise[4] || ""];
  }

  return [exercise[0] || "", exercise[1] || "3", exercise[2] || "12", "", "", exercise[3] || ""];
}

function getExerciseCatalog() {
  return state.exerciseCatalog?.length ? state.exerciseCatalog : defaultExerciseCatalog;
}

function buildExerciseOptions(options, selectedValue, focus) {
  const selected = String(selectedValue || "");
  const suggestedGroups = getSuggestedGroupsForFocus(focus);
  const suggested = options.filter((exercise) => suggestedGroups.includes(state.exerciseGroups[exercise]));
  const others = options.filter((exercise) => !suggested.includes(exercise));
  const blank = `<option value="">Selecionar exercicio</option>`;

  return [blank, buildOptionGroup("Sugeridos", suggested, selected), buildOptionGroup("Outros exercicios", others, selected)].join("");
}

function buildOptionGroup(label, options, selectedValue) {
  if (!options.length) return "";

  return `<optgroup label="${escapeAttr(label)}">${buildOptions(options, selectedValue)}</optgroup>`;
}

function getSuggestedGroupsForFocus(focus) {
  const value = (focus || "").toLowerCase();

  if (value.includes("peito")) return ["Peito", "Ombros", "Bracos"];
  if (value.includes("costas")) return ["Costas", "Bracos"];
  if (value.includes("superiores")) return ["Peito", "Costas", "Ombros", "Bracos"];
  if (value.includes("posterior")) return ["Pernas", "Gluteos", "Panturrilha"];
  if (value.includes("glute")) return ["Gluteos", "Pernas"];
  if (value.includes("quadriceps")) return ["Pernas"];
  if (value.includes("pernas")) return ["Pernas", "Gluteos", "Panturrilha", "Abdomen", "Mobilidade"];
  if (value.includes("abdomen")) return ["Abdomen"];

  return muscleGroups;
}

function buildDefaultExerciseGroups() {
  return Object.fromEntries(defaultExerciseCatalog.map((exercise) => [exercise, inferMuscleGroup(exercise)]));
}

function buildDefaultExerciseEquipment() {
  return Object.fromEntries(defaultExerciseCatalog.map((exercise) => [exercise, inferEquipment(exercise)]));
}

function inferMuscleGroup(exerciseName) {
  const name = exerciseName.toUpperCase();

  if (name.includes("MOBILIDADE")) return "Mobilidade";
  if (name.includes("SUPINO") || name.includes("VOADOR")) return "Peito";
  if (name.includes("PUXADA") || name.includes("REMADA") || name.includes("CRUCIFIXO INVERTIDO")) return "Costas";
  if (name.includes("DESENVOLVIMENTO") || name.includes("ELEVACAO LATERAL")) return "Ombros";
  if (name.includes("TRICEPS") || name.includes("ROSCA") || name.includes("SCOTH")) return "Bracos";
  if (name.includes("ABDOMINAL") || name.includes("PRANCHA") || name.includes("ELEVACAO DE PERNAS")) return "Abdomen";
  if (name.includes("GLUTEO") || name.includes("PELVICA") || name.includes("COICE") || name.includes("ABDUTORA")) return "Gluteos";
  if (name.includes("PANTURRILHA")) return "Panturrilha";
  if (
    name.includes("AGACHAMENTO") ||
    name.includes("LEG") ||
    name.includes("AFUNDO") ||
    name.includes("EXTENSORA") ||
    name.includes("FLEXORA") ||
    name.includes("ADUTORA") ||
    name.includes("STIF")
  ) {
    return "Pernas";
  }

  return "Outros";
}

function inferEquipment(exerciseName) {
  const name = exerciseName.toUpperCase();

  if (name.includes("HALTER")) return "Halter";
  if (name.includes("BARRA")) return "Barra";
  if (name.includes("POLIA") || name.includes("PULLEY") || name.includes("CORDA")) return "Polia";
  if (name.includes("PRANCHA") || name.includes("MERGULHO") || name.includes("ABDOMINAL")) return "Peso corporal";
  if (name.includes("MAQUINA") || name.includes("HACK") || name.includes("LEG") || name.includes("CADEIRA") || name.includes("MESA")) return "Maquina";
  if (name.includes("MOBILIDADE")) return "Livre";

  return "Outros";
}

function buildOptions(options, selectedValue, includeMissing = false) {
  const selected = String(selectedValue || "");
  const normalizedOptions = includeMissing && selected && !options.includes(selected) ? [selected, ...options] : options;

  return normalizedOptions
    .map((option) => {
      const value = escapeAttr(option);
      return `<option value="${value}" ${option === selected ? "selected" : ""}>${value}</option>`;
    })
    .join("");
}

function escapeAttr(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value = "") {
  return escapeAttr(value).replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatDateTime(value) {
  if (!value) return "Sem data";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildStudentAssessmentParagraphs(Paragraph, TextRun, layout) {
  if (!layout.includeStudentDetails) return [];

  const lines = [
    ["Peso", state.studentWeight],
    ["Altura", state.studentHeight],
    ["Gordura", state.studentBodyFat],
    ["Data da avaliacao", formatDate(state.studentAssessmentDate)],
    ["Medidas", state.studentMeasurements],
  ].filter(([, value]) => value);

  return lines.map(
    ([label, value]) =>
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value)],
      }),
  );
}

function buildWorkoutPeriodParagraphs(Paragraph, TextRun) {
  const lines = [
    ["Inicio", formatDate(state.workoutStartDate)],
    ["Fim", formatDate(state.workoutEndDate)],
  ].filter(([, value]) => value);

  return lines.map(
    ([label, value]) =>
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value)],
      }),
  );
}

function getCardioState() {
  return {
    type: state.cardioType || "",
    duration: state.cardioDuration || "",
    intensity: state.cardioIntensity || "",
    frequency: state.cardioFrequency || "",
  };
}

function normalizeCardio(cardio = {}) {
  return {
    type: cardio.type || "",
    duration: cardio.duration || "",
    intensity: cardio.intensity || "",
    frequency: cardio.frequency || "",
  };
}

function applyCardioState(cardio = {}) {
  const normalized = normalizeCardio(cardio);
  state.cardioType = normalized.type;
  state.cardioDuration = normalized.duration;
  state.cardioIntensity = normalized.intensity;
  state.cardioFrequency = normalized.frequency;
  state.cardio = normalized;
}

function hasCardio() {
  return Boolean(state.cardioType || state.cardioDuration || state.cardioIntensity || state.cardioFrequency);
}

function formatCardio() {
  return [
    state.cardioType,
    state.cardioDuration,
    state.cardioIntensity,
    state.cardioFrequency,
  ]
    .filter(Boolean)
    .join(" - ");
}

function downloadPdf() {
  if (!window.jspdf?.jsPDF) {
    toast("A biblioteca de PDF ainda nao carregou. Tente novamente em alguns segundos.");
    return;
  }

  const pdf = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
  const margin = 15;
  const width = 180;
  let y = 18;
  const write = (text, options = {}) => {
    const { bold = false, size = 10, gap = 3 } = options;
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(String(text), width);
    if (y + lines.length * (size * 0.42) > 280) {
      pdf.addPage();
      y = 18;
    }
    pdf.text(lines, margin, y);
    y += lines.length * (size * 0.42) + gap;
  };

  write(state.title || "Treino", { bold: true, size: 18, gap: 7 });
  write(`Aluno: ${state.studentName || "-"}`);
  write(`Professor: ${state.teacherName || "-"}`);
  write(`Divisao: ${getProfileLabel(state.profile)} | Status: ${getWorkoutStatusLabel(state.workoutStatus)}`, { gap: 5 });
  if (state.workoutStartDate || state.workoutEndDate) write(`Periodo: ${state.workoutStartDate || "-"} a ${state.workoutEndDate || "-"}`);
  if (state.notes.trim()) write(`Observacoes: ${state.notes.trim()}`, { gap: 5 });
  if (hasCardio()) write(`Cardio: ${formatCardio()}`, { gap: 5 });

  state.days.forEach((day) => {
    write(`Dia ${day.name}${day.focus && day.focus !== "Personalizado" ? ` — ${day.focus}` : ""}`, { bold: true, size: 13, gap: 3 });
    if (day.warmup) write(`Aquecimento: ${day.warmup}`);
    if (day.notes) write(`Observacoes do dia: ${day.notes}`);
    day.exercises.forEach((exercise, index) => {
      const [name, sets, reps, load, rest, notes] = exercise;
      write(`${index + 1}. ${name || "Exercicio"} — ${sets || "-"} series x ${reps || "-"} reps${load ? ` | Carga: ${load}` : ""}${rest ? ` | Descanso: ${rest}` : ""}${notes ? ` | ${notes}` : ""}`);
    });
    y += 2;
  });

  pdf.save(`${slugify(state.title || "treino")}.pdf`);
  toast("PDF gerado.");
}

async function downloadDocx() {
  if (!window.docx) {
    toast("A biblioteca de DOCX ainda nao carregou. Tente novamente em alguns segundos.");
    return;
  }

  const {
    AlignmentType,
    BorderStyle,
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
  } = window.docx;

  const docxApi = { AlignmentType, BorderStyle, Table, TableRow, TableCell, Paragraph, TextRun, WidthType };
  const layout = getDocxLayoutConfig();
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: layout.titleSpacing },
      children: [
        new TextRun({
          text: state.title || "Treino",
          bold: true,
          size: layout.titleSize,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "Aluno: ", bold: true }),
        new TextRun(state.studentName || "-"),
      ],
    }),
    ...(layout.includeStudentDetails && state.studentContact
      ? [
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: "Contato: ", bold: true }),
              new TextRun(state.studentContact),
            ],
          }),
        ]
      : []),
    ...(layout.includeStudentDetails && state.studentGoal
      ? [
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: "Objetivo: ", bold: true }),
              new TextRun(state.studentGoal),
            ],
          }),
        ]
      : []),
    ...(layout.includeStudentDetails
      ? [
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: "Nivel: ", bold: true }),
              new TextRun(getStudentLevelLabel(state.studentLevel)),
            ],
          }),
        ]
      : []),
    ...buildStudentAssessmentParagraphs(Paragraph, TextRun, layout),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "Professor: ", bold: true }),
        new TextRun(state.teacherName || "-"),
      ],
    }),
    new Paragraph({
      spacing: { after: 180 },
      children: [
        new TextRun({ text: "Divisao: ", bold: true }),
        new TextRun(getProfileLabel(state.profile)),
      ],
    }),
    new Paragraph({
      spacing: { after: 180 },
      children: [
        new TextRun({ text: "Status: ", bold: true }),
        new TextRun(getWorkoutStatusLabel(state.workoutStatus)),
      ],
    }),
    ...buildWorkoutPeriodParagraphs(Paragraph, TextRun),
  ];

  if (state.notes.trim()) {
    children.push(
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({ text: "Observacoes: ", bold: true }),
          new TextRun(state.notes.trim()),
        ],
      }),
    );
  }

  if (hasCardio()) {
    children.push(
      new Paragraph({
        spacing: { after: 180 },
        children: [new TextRun({ text: "Cardio: ", bold: true }), new TextRun(formatCardio())],
      }),
    );
  }

  if (layout.includeStudentDetails && state.studentNotes.trim()) {
    children.push(
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({ text: "Observacoes do aluno: ", bold: true }),
          new TextRun(state.studentNotes.trim()),
        ],
      }),
    );
  }

  state.days.forEach((day) => {
    const focus = day.focus && day.focus !== "Personalizado" ? ` - ${day.focus}` : "";
    children.push(
      new Paragraph({
        spacing: { before: 160, after: 90 },
        children: [
          new TextRun({
            text: `Dia ${day.name}${focus}`,
            bold: true,
            size: 24,
          }),
        ],
      }),
      ...(day.warmup
        ? [
            new Paragraph({
              spacing: { after: 80 },
              children: [new TextRun({ text: "Aquecimento: ", bold: true }), new TextRun(day.warmup)],
            }),
          ]
        : []),
      ...(day.notes
        ? [
            new Paragraph({
              spacing: { after: 80 },
              children: [new TextRun({ text: day.notes })],
            }),
          ]
        : []),
      buildExerciseTable(day, docxApi),
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: layout.margin,
              right: layout.margin,
              bottom: layout.margin,
              left: layout.margin,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(state.title || "treino")}.docx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 500);
}

function getDocxLayoutConfig() {
  const layouts = {
    simples: {
      titleSize: 30,
      titleSpacing: 220,
      margin: 720,
      tableFontSize: 20,
      headerFontSize: 18,
      cellMargin: 90,
      includeStudentDetails: false,
    },
    compacto: {
      titleSize: 26,
      titleSpacing: 140,
      margin: 500,
      tableFontSize: 16,
      headerFontSize: 14,
      cellMargin: 55,
      includeStudentDetails: false,
    },
    detalhado: {
      titleSize: 30,
      titleSpacing: 220,
      margin: 720,
      tableFontSize: 20,
      headerFontSize: 18,
      cellMargin: 90,
      includeStudentDetails: true,
    },
  };

  return layouts[state.docxLayout] || layouts.simples;
}

function buildExerciseTable(day, api) {
  const { AlignmentType, Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle } = api;
  const layout = getDocxLayoutConfig();
  const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
  const columnWidths = [5, 29, 10, 12, 11, 13, 20];
  const headerCell = (text, width) =>
    new TableCell({
      borders: { top: border, bottom: border, left: border, right: border },
      margins: { top: layout.cellMargin, bottom: layout.cellMargin, left: layout.cellMargin, right: layout.cellMargin },
      width: { size: width, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, bold: true, size: layout.headerFontSize })],
        }),
      ],
    });
  const cell = (text, width, align = AlignmentType.LEFT) =>
    new TableCell({
      borders: { top: border, bottom: border, left: border, right: border },
      margins: { top: layout.cellMargin, bottom: layout.cellMargin, left: layout.cellMargin, right: layout.cellMargin },
      width: { size: width, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: String(text || ""), size: layout.tableFontSize })],
        }),
      ],
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["#", "EXERCICIO", "SERIES", "REPETICOES", "DESCANSO", "CARGA", "OBS."].map((text, index) =>
          headerCell(text, columnWidths[index]),
        ),
      }),
      ...day.exercises.map(
        (exercise, index) =>
          new TableRow({
            children: [
              cell(index + 1, columnWidths[0], AlignmentType.CENTER),
              cell(exercise[0], columnWidths[1], AlignmentType.LEFT),
              cell(exercise[1], columnWidths[2], AlignmentType.CENTER),
              cell(exercise[2], columnWidths[3], AlignmentType.CENTER),
              cell(exercise[3], columnWidths[4], AlignmentType.CENTER),
              cell(exercise[4], columnWidths[5], AlignmentType.CENTER),
              cell(exercise[5], columnWidths[6], AlignmentType.LEFT),
            ],
          }),
      ),
    ],
  });
}

function getProfileLabel(profile) {
  const labels = {
    personalizado: "Personalizado",
    "3-dias": "3 dias",
    "5-dias": "5 dias",
    "superiores-inferiores": "Superiores / inferiores",
    abc: "ABC",
  };

  return labels[profile] || "Personalizado";
}

function getWorkoutStatusLabel(status) {
  const labels = {
    rascunho: "Rascunho",
    ativo: "Ativo",
    pausado: "Pausado",
    encerrado: "Encerrado",
  };

  return labels[status] || "Rascunho";
}

function getStudentLevelLabel(level) {
  const labels = {
    iniciante: "Iniciante",
    intermediario: "Intermediario",
    avancado: "Avancado",
  };

  return labels[level] || "Iniciante";
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toast(message) {
  const existing = document.querySelector(".toast");
  existing?.remove();

  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);

  setTimeout(() => node.remove(), 2200);
}

bindStaticEvents();
render();
hydrateRemoteState();
