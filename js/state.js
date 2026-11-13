const STORAGE_KEY = "osoviz-state";

export const DEFAULT_STATE = {
  data: {
    columns: [],
    rows: []
  },

  // bar, line, pie, scatter, bubble
  chartType: "bar",

  // normal, protanopia, deuteranopia, tritanopia
  cvdType: "normal",

  paletteId: "default",

  highContrast: false,

  selectedColumns: {
    x: null,
    y: []
  }
};

function clone(value) {
  return structuredClone(value);
}

function loadState() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return clone(DEFAULT_STATE);
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return clone(DEFAULT_STATE);
    }

    return {
      ...clone(DEFAULT_STATE),
      ...parsed,
      data: {
        ...clone(DEFAULT_STATE.data),
        ...parsed.data
      },
      selectedColumns: {
        ...clone(DEFAULT_STATE.selectedColumns),
        ...parsed.selectedColumns
      }
    };
  } catch (error) {
    console.warn("Failed to load state:", error);
    return clone(DEFAULT_STATE);
  }
}

let state = loadState();

const listeners = new Set();

export function getState() {
  return clone(state);
}

function saveState() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("Failed to save state:", error);
  }
}

export function updateState(updates) {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    throw new TypeError("Updates must be an object.");
  }

  state = {
    ...state,
    ...clone(updates),

    data: updates.data ? { ...state.data, ...clone(updates.data) } : state.data,

    selectedColumns: updates.selectedColumns ? { ...state.selectedColumns, ...clone(updates.selectedColumns) } : state.selectedColumns
  };

  saveState();

  listeners.forEach(listener => listener(getState()));
}

export function subscribe(listener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function resetState() {
  state = clone(DEFAULT_STATE);

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear state:", error);
  }

  listeners.forEach(listener => listener(getState()));
}
