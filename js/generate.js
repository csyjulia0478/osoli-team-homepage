import {
  getState,
  updateState,
  subscribe
} from "./state.js";

import { buildChartOption } from "./chartBuilder.js";

const PREVIEW_DELAY = 200;

const CHART_LABELS = {
  bar: "bar",
  line: "line",
  pie: "pie",
  scatter: "scatter",
  bubble: "bubble"
};

const HIGH_CONTRAST_CONTROL_IDS = [
  "high-contrast",
  "bold-borders",
  "patterns",
  "value-labels"
];

let chart = null;
let renderTimer = null;
let renderVersion = 0;
let unsubscribe = null;
let resizeObserver = null;

let paletteGetterPromise = null;
let summarizerPromise = null;

const ui = {};

function byId(id) {
  return document.getElementById(id);
}

/*
 * PR #39가 병합되면 getPalette()를 자동으로 사용
 */
function loadPaletteGetter() {
  if (!paletteGetterPromise) {
    paletteGetterPromise = import("./palettes.js")
      .then(module => {
        return typeof module.getPalette === "function"
          ? module.getPalette
          : null;
      })
      .catch(error => {
        console.info(
          "palettes.js is not connected yet. Using chartBuilder default colors.",
          error
        );
        return null;
      });
  }

  return paletteGetterPromise;
}

/*
 * 나중에 caption.js가 추가되고 summarize(state)를 export하면
 * generate.js 수정 없이 자동 연결
 */
function loadSummarizer() {
  if (!summarizerPromise) {
    summarizerPromise = import("./caption.js")
      .then(module => {
        return typeof module.summarize === "function"
          ? module.summarize
          : null;
      })
      .catch(error => {
        console.info(
          "caption.js is not connected yet. Using a basic caption.",
          error
        );
        return null;
      });
  }

  return summarizerPromise;
}

function hasChartData(state) {
  return (
    Array.isArray(state.data?.columns) &&
    state.data.columns.length >= 2 &&
    Array.isArray(state.data?.rows) &&
    state.data.rows.length > 0
  );
}

function createFallbackSummary(state) {
  const chartName = CHART_LABELS[state.chartType] ?? "chart";
  const rowCount = state.data?.rows?.length ?? 0;

  const selectedSeriesCount = state.selectedColumns?.y?.length;
  const defaultSeriesCount = Math.max(
    (state.data?.columns?.length ?? 1) - 1,
    1
  );

  const seriesCount = selectedSeriesCount || defaultSeriesCount;

  return {
    short:
      `A ${chartName} chart was generated with ` +
      `${rowCount} data rows and ${seriesCount} value series.`,
    details: []
  };
}

function setHighContrastState(state) {
  const enabled = Boolean(state.highContrast);

  /*
   * contrast.css의 선택자:
   * [data-high-contrast="true"]
   */
  document.documentElement.dataset.highContrast = String(enabled);

  ui.highContrastControls.forEach(control => {
    control.checked = enabled;
  });
}

function clearSummary() {
  if (ui.caption) {
    ui.caption.textContent = "Chart preview";
  }

  if (ui.summaryText) {
    ui.summaryText.textContent = "";
  }

  if (ui.statistics) {
    ui.statistics.hidden = true;
  }

  if (ui.detailsContent) {
    ui.detailsContent.replaceChildren();
  }

  if (ui.details) {
    ui.details.hidden = true;
    ui.details.open = false;
  }
}

function renderStatistics(summary) {
  if (!ui.statistics) return;

  /*
   * 현재 약속된 summarize() 반환값은 short/details뿐
   * 나중에 stats 또는 statistics가 추가될 경우에도 대응
   */
  const stats = summary?.stats ?? summary?.statistics;

  if (!stats || typeof stats !== "object") {
    ui.statistics.hidden = true;
    return;
  }

  const values = [
    ["summaryMaximum", stats.maximum ?? stats.max],
    ["summaryMinimum", stats.minimum ?? stats.min],
    ["summaryDifference", stats.difference],
    ["summaryAverage", stats.average ?? stats.mean]
  ];

  const hasStatistics = values.some(([, value]) => value != null);
  ui.statistics.hidden = !hasStatistics;

  values.forEach(([key, value]) => {
    if (ui[key]) {
      ui[key].textContent = value == null ? "-" : String(value);
    }
  });
}

function renderDetails(details) {
  if (!ui.details || !ui.detailsContent) return;

  const lines = Array.isArray(details)
    ? details
        .filter(detail => detail != null && String(detail).trim() !== "")
        .map(String)
    : [];

  ui.details.hidden = lines.length === 0;
  ui.detailsContent.replaceChildren();

  lines.forEach((line, index) => {
    if (index > 0) {
      ui.detailsContent.appendChild(document.createElement("br"));
    }

    ui.detailsContent.appendChild(document.createTextNode(line));
  });
}

function renderSummary(summary, state) {
  const fallback = createFallbackSummary(state);

  const short =
    typeof summary?.short === "string" && summary.short.trim()
      ? summary.short.trim()
      : fallback.short;

  const chartName = CHART_LABELS[state.chartType] ?? "chart";

  if (ui.caption) {
    ui.caption.textContent = `Generated ${chartName} chart preview.`;
  }

  if (ui.summaryText) {
    ui.summaryText.textContent = short;
  }

  renderStatistics(summary);
  renderDetails(summary?.details);

  return short;
}

async function createSummary(state, summarizer) {
  const fallback = createFallbackSummary(state);

  if (!summarizer) {
    return fallback;
  }

  try {
    const result = await summarizer(state);

    if (!result || typeof result !== "object") {
      return fallback;
    }

    return result;
  } catch (error) {
    /*
     * 캡션 생성 실패가 차트 생성까지 막지는 않도록 분리
     */
    console.warn("Failed to create chart summary:", error);
    return fallback;
  }
}

async function renderChart(requestVersion) {
  const state = getState();

  setHighContrastState(state);
  ui.error.textContent = "";

  if (!hasChartData(state)) {
    if (requestVersion !== renderVersion) return;

    chart.clear();
    clearSummary();

    ui.status.textContent =
      "Enter data on the Input page to generate a chart.";
    return;
  }

  ui.status.textContent = "Generating chart...";

  try {
    const [getPalette, summarizer] = await Promise.all([
      loadPaletteGetter(),
      loadSummarizer()
    ]);

    if (requestVersion !== renderVersion) return;

    let colors;

    if (getPalette) {
      try {
        colors = getPalette(state.cvdType, state.paletteId);
      } catch (error) {
        console.warn("Failed to load the selected palette:", error);
      }
    }

    const option =
      Array.isArray(colors) && colors.length > 0
        ? buildChartOption(state, colors)
        : buildChartOption(state);

    const summary = await createSummary(state, summarizer);

    if (requestVersion !== renderVersion) return;

    const shortSummary = renderSummary(summary, state);
    const chartName = CHART_LABELS[state.chartType] ?? "chart";

    /*
     * ECharts의 접근성 설명도 캡션과 같은 내용을 사용
     * 고대비 패턴은 chartBuilder.js에서 직접 적용하므로
     * ECharts의 자동 decal은 사용 X
     */
    option.aria = {
      enabled: true,
      decal: {
        show: false
      },
      label: {
        description:
          `Generated ${chartName} chart. ${shortSummary}`
      }
    };

    chart.clear();
    chart.setOption(option, {
      notMerge: true,
      lazyUpdate: false
    });
    chart.resize();

    ui.status.textContent = "Chart generated.";
  } catch (error) {
    if (requestVersion !== renderVersion) return;

    chart.clear();
    clearSummary();

    ui.status.textContent = "";
    ui.error.textContent =
      error instanceof Error
        ? error.message
        : "The chart could not be generated.";
  }
}

function renderNow() {
  window.clearTimeout(renderTimer);

  const requestVersion = ++renderVersion;
  void renderChart(requestVersion);
}

function scheduleRender() {
  window.clearTimeout(renderTimer);

  const requestVersion = ++renderVersion;

  renderTimer = window.setTimeout(() => {
    void renderChart(requestVersion);
  }, PREVIEW_DELAY);
}

function bindHighContrastControls() {
  ui.highContrastControls.forEach(control => {
    control.addEventListener("change", event => {
      /*
       * 현재 state에는 개별 패턴/테두리/라벨 상태가 없고
       * highContrast 하나만 있으므로 세 기존 체크박스도 한 모드로 동기화
       */
      updateState({
        highContrast: event.currentTarget.checked
      });
    });
  });
}

function handleWindowResize() {
  chart?.resize();
}

function cleanup(event) {
  /*
   * 브라우저 뒤로 가기 캐시에 들어가는 경우에는 인스턴스 유지
   */
  if (event?.persisted) return;

  window.clearTimeout(renderTimer);
  renderVersion += 1;

  unsubscribe?.();
  resizeObserver?.disconnect();

  window.removeEventListener("resize", handleWindowResize);

  if (chart && !chart.isDisposed()) {
    chart.dispose();
  }
}

function initGeneratePage() {
  ui.chart = byId("chart-preview");
  ui.status = byId("chart-status");
  ui.error = byId("chart-error");
  ui.caption = byId("chart-caption");

  ui.summaryText = byId("chart-summary-text");
  ui.statistics = byId("chart-statistics");
  ui.summaryMaximum = byId("summary-maximum");
  ui.summaryMinimum = byId("summary-minimum");
  ui.summaryDifference = byId("summary-difference");
  ui.summaryAverage = byId("summary-average");

  ui.details = byId("chart-details");
  ui.detailsContent = byId("chart-details-content");
  ui.generateButton = byId("generate-chart");

  ui.highContrastControls = HIGH_CONTRAST_CONTROL_IDS
    .map(byId)
    .filter(Boolean);

  if (!ui.chart || !ui.status || !ui.error) {
    throw new Error(
      "generate.js: required Generate page elements are missing."
    );
  }

  if (!globalThis.echarts) {
    ui.error.textContent =
      "ECharts is not loaded. Load ECharts before generate.js.";
    return;
  }

  chart = echarts.getInstanceByDom(ui.chart) ?? echarts.init(ui.chart);

  bindHighContrastControls();

  ui.generateButton?.addEventListener("click", renderNow);

  setHighContrastState(getState());

  /*
   * state가 바뀌면 UI 즉시 동기화,
   * 차트는 0.2초 뒤 다시 생성
   */
  unsubscribe = subscribe(nextState => {
    setHighContrastState(nextState);
    scheduleRender();
  });

  if ("ResizeObserver" in globalThis) {
    resizeObserver = new ResizeObserver(() => {
      chart?.resize();
    });

    resizeObserver.observe(ui.chart);
  } else {
    window.addEventListener("resize", handleWindowResize);
  }

  window.addEventListener("pagehide", cleanup);

  clearSummary();
  renderNow();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initGeneratePage,
    { once: true }
  );
} else {
  initGeneratePage();
}
