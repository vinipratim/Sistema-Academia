const STORAGE_KEY = "sistema-treinos-v2";

const exerciseCatalog = [
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

const seriesOptions = ["1", "2", "3", "4", "5", "6"];
const repsOptions = ["8", "10", "12", "15", "16", "20", "30 SEG", "45 SEG", "60 SEG"];

const initialDays = [
  {
    name: "01",
    focus: "Peito, ombros e triceps",
    exercises: [
      ["SUPINO INCLINADO", "3", "12", ""],
      ["VOADOR", "3", "12", ""],
      ["SUPINO MAQUINA PEGADA NEUTRA", "3", "12", ""],
      ["DESENVOLVIMENTO ARTICULADO", "3", "12", ""],
      ["ELEVACAO LATERAL", "3", "15", ""],
      ["TRICEPS PULLEY", "3", "12", ""],
      ["MERGULHO", "3", "12", ""],
    ],
  },
  {
    name: "02",
    focus: "Pernas e abdomen",
    exercises: [
      ["AGACHAMENTO HACK", "3", "12", ""],
      ["LEG PRESS", "3", "12", ""],
      ["AFUNDO", "3", "12", ""],
      ["EXTENSORA", "3", "12", ""],
      ["FLEXORA", "3", "12", ""],
      ["ABDOMINAL NA PRANCHA DECLINADA", "3", "12", ""],
    ],
  },
  {
    name: "03",
    focus: "Costas e biceps",
    exercises: [
      ["PUXADA HAMMER", "3", "12", ""],
      ["REMADA BAIXA", "3", "12", ""],
      ["PUXADA FRENTE SUPINADA", "3", "12", ""],
      ["REMADA CAVALO", "3", "12", ""],
      ["ROSCA DIRETA", "3", "12", ""],
      ["BANCO SCOTH", "3", "12", ""],
    ],
  },
];

let state = loadState() || {
  studentName: "",
  teacherName: "",
  title: "Treino personalizado",
  profile: "personalizado",
  notes: "3X ENTRE 10 A 15 REPETICOES",
  activeDay: 0,
  days: clone(initialDays),
};

const elements = {
  studentName: document.querySelector("#studentName"),
  teacherName: document.querySelector("#teacherName"),
  workoutTitle: document.querySelector("#workoutTitle"),
  workoutProfile: document.querySelector("#workoutProfile"),
  generalNotes: document.querySelector("#generalNotes"),
  screenTitle: document.querySelector("#screenTitle"),
  dayTabs: document.querySelector("#dayTabs"),
  daysContainer: document.querySelector("#daysContainer"),
  addDayBtn: document.querySelector("#addDayBtn"),
  increaseDayBtn: document.querySelector("#increaseDayBtn"),
  saveBtn: document.querySelector("#saveBtn"),
  downloadBtn: document.querySelector("#downloadBtn"),
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindStaticEvents() {
  elements.studentName.addEventListener("input", (event) => {
    state.studentName = event.target.value;
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

  elements.generalNotes.addEventListener("input", (event) => {
    state.notes = event.target.value;
    persist();
  });

  elements.addDayBtn.addEventListener("click", addDay);
  elements.increaseDayBtn.addEventListener("click", addDay);

  elements.saveBtn.addEventListener("click", () => {
    persist();
    toast("Treino salvo no navegador.");
  });

  elements.downloadBtn.addEventListener("click", downloadDocx);
}

function addDay() {
  state.days.push({
    name: String(state.days.length + 1).padStart(2, "0"),
    focus: "Personalizado",
    exercises: [["", "3", "12", ""]],
  });
  state.activeDay = state.days.length - 1;
  render();
  persist();
}

function render() {
  normalizeState();
  elements.studentName.value = state.studentName;
  elements.teacherName.value = state.teacherName;
  elements.workoutTitle.value = state.title;
  elements.workoutProfile.value = state.profile || "personalizado";
  elements.generalNotes.value = state.notes;
  elements.screenTitle.textContent = state.title || "Treino sem titulo";

  renderTabs();
  renderDays();
  window.lucide?.createIcons();
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
            ${buildOptions(["01", "02", "03", "04", "05", "06", "07"], day.name)}
          </select>
        </label>
        <label>
          Foco
          <select data-field="focus">
            ${buildOptions(focusOptions, day.focus)}
          </select>
        </label>
        <button class="danger" data-action="remove-day" type="button">
          <i data-lucide="trash-2"></i>
          Remover
        </button>
      </div>
      <table class="exercise-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Exercicio</th>
            <th>Series</th>
            <th>Repeticoes</th>
            <th>Carga/obs.</th>
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
      </div>
    `;

    card.querySelectorAll("[data-field]").forEach((input) => {
      input.addEventListener("change", (event) => {
        day[event.target.dataset.field] = event.target.value;
        renderTabs();
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
      day.exercises.push(["", "3", "12", ""]);
      render();
      persist();
    });

    renderExerciseRows(card.querySelector("tbody"), day, dayIndex);
    elements.daysContainer.append(card);
  });
}

function renderExerciseRows(tbody, day) {
  day.exercises.forEach((exercise, exerciseIndex) => {
    const selectedExercise = exercise[0] || "";
    const customExercise = selectedExercise && !exerciseCatalog.includes(selectedExercise);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exerciseIndex + 1}</td>
      <td>
        <select data-column="0" data-kind="exercise">
          <option value="">Selecionar exercicio</option>
          ${buildOptions(exerciseCatalog, selectedExercise)}
          <option value="__custom__" ${customExercise ? "selected" : ""}>Outro exercicio</option>
        </select>
        <input class="custom-exercise ${customExercise ? "visible" : ""}" data-kind="custom-exercise" value="${customExercise ? escapeAttr(selectedExercise) : ""}" placeholder="Digite o exercicio" />
      </td>
      <td>
        <select data-column="1">
          ${buildOptions(seriesOptions, exercise[1] || "3")}
        </select>
      </td>
      <td>
        <select data-column="2">
          ${buildOptions(repsOptions, exercise[2] || "12")}
        </select>
      </td>
      <td><input data-column="3" value="${escapeAttr(exercise[3])}" placeholder="Carga, descanso, ajuste..." /></td>
      <td>
        <button class="icon-button" data-action="remove-exercise" type="button" title="Remover exercicio">
          <i data-lucide="x"></i>
        </button>
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

        exercise[column] = event.target.value;
        row.querySelector("[data-kind='custom-exercise']").classList.remove("visible");
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

    row.querySelector("[data-action='remove-exercise']").addEventListener("click", () => {
      day.exercises.splice(exerciseIndex, 1);
      render();
      persist();
    });

    tbody.append(row);
  });
}

function normalizeState() {
  state.profile ||= "personalizado";
  state.days ||= clone(initialDays);
  state.days.forEach((day) => {
    day.name ||= "01";
    day.focus ||= "Personalizado";
    day.exercises ||= [];
    day.exercises = day.exercises.map((exercise) => [
      exercise[0] || "",
      exercise[1] || "3",
      exercise[2] || "12",
      exercise[3] || "",
    ]);
  });
}

function buildOptions(options, selectedValue) {
  const selected = String(selectedValue || "");
  const normalizedOptions = options.includes(selected) || !selected ? options : [selected, ...options];

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
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [
        new TextRun({
          text: state.title || "Treino",
          bold: true,
          size: 30,
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
      buildExerciseTable(day, docxApi),
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
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

function buildExerciseTable(day, api) {
  const { AlignmentType, Table, TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle } = api;
  const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
  const columnWidths = [7, 41, 13, 15, 24];
  const headerCell = (text, width) =>
    new TableCell({
      borders: { top: border, bottom: border, left: border, right: border },
      margins: { top: 90, bottom: 90, left: 100, right: 100 },
      width: { size: width, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, bold: true, size: 18 })],
        }),
      ],
    });
  const cell = (text, width, align = AlignmentType.LEFT) =>
    new TableCell({
      borders: { top: border, bottom: border, left: border, right: border },
      margins: { top: 90, bottom: 90, left: 100, right: 100 },
      width: { size: width, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: String(text || ""), size: 20 })],
        }),
      ],
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["#", "EXERCICIO", "SERIES", "REPETICOES", "CARGA/OBS."].map((text, index) =>
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
              cell(exercise[3], columnWidths[4], AlignmentType.LEFT),
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
A