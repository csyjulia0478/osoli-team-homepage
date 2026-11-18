/**
 * dataInput.js - 데이터 입력 표 (input.html)
 *
 * 기능: 행·열 추가/삭제, 열 이름 수정, 숫자 검증, 빈 칸 경고, state 저장
 * Tabulator 6.x 를 이 모듈보다 먼저 로드해야 한다.
 *
 * 사용:
 *   import { initDataInput } from './js/dataInput.js';
 *   initDataInput();
 *
 * 저장: Next 링크를 누르면 검증하고, 오류가 없을 때만 state.data 에 저장한다.
 *   data = { columns: ['Label', 'Sales'], rows: [['Jan', 120], ['Feb', '']] }
 *   첫 열은 문자열, 나머지 열은 숫자, 빈 칸은 '' 로 저장한다.
 *
 * 마크업에 있어야 하는 id: data-input-help
 * (next-step 이 있으면 Next 클릭 시 저장). 행/열 버튼, 표, 안내/오류/경고 문구는
 * 마크업에 없으면 data-input-help 뒤에 JS 가 만든다. (오류/경고는 표 바로 아래에 함께 표시)
 *
 * 스타일용 클래스: cell-error, cell-empty, cell-placeholder
 */
import { getState, updateState } from './state.js';

const MAX_LINES = 6;

let table = null;
let colCounter = 0;
let lastCol = null;
const el = {};

/* ---------- 유틸 ---------- */

// 빈 값 판별 (null, 공백)
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';

// 숫자 변환 (실패 시 null, "1,234"·"12%" 허용)
function toNumber(v) {
  if (v === null || v === undefined || typeof v === 'boolean') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim().replace(/,/g, '').replace(/%$/, '');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) return null;
  return Number(s);
}

// HTML 특수문자 치환
const escapeHtml = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// 빈 열 이름의 기본값
const defaultHeader = (i) => (i === 0 ? 'Label' : `Series ${i}`);

/* ---------- 메시지 ---------- */

// 메시지 영역 출력 (최대 6줄)
function render(node, lines) {
  node.replaceChildren();
  const list = Array.isArray(lines) ? lines : lines ? [lines] : [];
  list.slice(0, MAX_LINES).forEach((t, i) => {
    if (i) node.append(document.createElement('br'));
    node.append(t);
  });
  if (list.length > MAX_LINES) {
    node.append(document.createElement('br'), `… and ${list.length - MAX_LINES} more`);
  }
}

// 메시지 종류: 안내 / 오류 / 경고
const showStatus = (lines) => render(el.status, lines);
const showError = (lines) => render(el.error, lines);
const showWarning = (lines) => render(el.warning, lines);

/* ---------- 표 ---------- */

// 셀 표시 (빈 칸 / ⚠ 오류 / 정상)
function makeFormatter(isValueCol) {
  return (cell) => {
    const v = cell.getValue();
    const node = cell.getElement();
    node.classList.remove('cell-error', 'cell-empty');
    if (isEmpty(v)) {
      node.classList.add('cell-empty');
      return '<span class="cell-placeholder">(empty)</span>';
    }
    if (isValueCol && toNumber(v) === null) {
      node.classList.add('cell-error');
      return '⚠ ' + escapeHtml(v);
    }
    return escapeHtml(v);
  };
}

// 열 설정 (셀 편집, 제목 더블클릭으로 이름 수정)
function colDef(field, title, isValueCol) {
  return {
    title, field, editor: 'input', editableTitle: true, headerSort: false, minWidth: 100,
    hozAlign: isValueCol ? 'right' : 'left', formatter: makeFormatter(isValueCol)
  };
}

// 전체 열 구성 (체크박스 + 행 번호 + 데이터 열)
function buildColumns(headers) {
  return [
    { formatter: 'rowSelection', titleFormatter: 'rowSelection', hozAlign: 'center',
      headerSort: false, width: 44, resizable: false,
      cellClick: (e, cell) => cell.getRow().toggleSelect() },
    { title: '#', formatter: 'rownum', hozAlign: 'center', headerSort: false, width: 50, resizable: false },
    ...headers.map((h, i) => colDef('c' + i, h, i > 0))
  ];
}

// 데이터 열만 추출
const dataColumns = () => table.getColumns().filter((c) => /^c\d+$/.test(c.getField() || ''));

// 표 전체 교체 (열 이름 + 행)
function setTable(headers, rows) {
  colCounter = headers.length;
  lastCol = null;
  table.setColumns(buildColumns(headers));
  return table.setData(rows.map((r) => {
    const o = {};
    headers.forEach((_, i) => { o['c' + i] = r[i] === undefined ? '' : r[i]; });
    return o;
  }));
}

/* ---------- 검증 / 저장 ---------- */

// 검증 (오류: 숫자 아님 / 경고: 빈 칸), state 변경 없음
function check() {
  const cols = dataColumns();
  const fields = cols.map((c) => c.getField());
  const columns = cols.map((c, i) => String(c.getDefinition().title || '').trim() || defaultHeader(i));
  const errors = [];
  const warnings = [];
  const rows = [];

  table.getData().forEach((obj, r) => {
    const raw = fields.map((f) => obj[f]);
    if (raw.every(isEmpty)) return;
    rows.push(raw.map((v, c) => {
      if (isEmpty(v)) {
        warnings.push(`Warning: row ${r + 1}, "${columns[c]}" is empty.`);
        return '';
      }
      if (c === 0) return String(v).trim();
      const n = toNumber(v);
      if (n === null) errors.push(`Row ${r + 1}, "${columns[c]}": "${String(v).slice(0, 20)}" is not a number.`);
      return n === null ? String(v) : n;
    }));
  });

  if (columns.length < 2) errors.push('At least one number column is required.');
  if (rows.length === 0) errors.push('There is no data to use.');
  return { columns, rows, errors, warnings };
}

// 오류 없을 때만 state 저장
function saveData() {
  const r = check();
  showWarning(r.warnings);
  if (r.errors.length) {
    showError(['Please fix these problems before continuing:', ...r.errors]);
    return false;
  }
  showError('');
  updateState({ data: { columns: r.columns, rows: r.rows } });
  return true;
}

/* ---------- 화면 연결 ---------- */

// id 요소 조회, 없으면 생성
function ensure(id, tag, anchor, { text = '', role = '' } = {}) {
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement(tag);
    node.id = id;
    if (text) node.textContent = text;
    if (tag === 'button') node.type = 'button';
    if (role) node.setAttribute('role', role);
    anchor.after(node);
  }
  return node;
}

// 버튼·표·안내 영역 배치
function buildControls() {
  let a = el.help;
  a = el.addRow = ensure('add-row', 'button', a, { text: 'Add row' });
  a = el.deleteRow = ensure('delete-row', 'button', a, { text: 'Delete checked rows' });
  a = el.addCol = ensure('add-column', 'button', a, { text: 'Add column' });
  a = el.deleteCol = ensure('delete-column', 'button', a, { text: 'Delete column of the clicked cell' });
  a = el.tableEl = ensure('data-table', 'div', a);
  a = el.status = ensure('data-table-status', 'p', a, { role: 'status' });
  a = el.error = ensure('data-table-error', 'p', a, { role: 'alert' });
  el.warning = ensure('data-input-warning', 'p', a, { role: 'status' });
}

// 행·열 버튼, Next 이벤트 연결
function bindEvents() {
  el.addRow.addEventListener('click', () => table.addRow({}, false));

  el.deleteRow.addEventListener('click', () => {
    const selected = table.getSelectedRows();
    if (!selected.length) return showStatus('Check the rows you want to delete first.');
    selected.forEach((r) => r.delete());
  });

  el.addCol.addEventListener('click', () => {
    table.addColumn(colDef('c' + colCounter++, defaultHeader(dataColumns().length), true));
  });

  el.deleteCol.addEventListener('click', () => {
    if (!lastCol) return showStatus('Click a cell in the column you want to delete first.');
    if (lastCol.getField() === 'c0') return showStatus('The first column (labels) cannot be deleted.');
    if (dataColumns().length <= 2) return showStatus('At least one number column must remain.');
    lastCol.delete();
    lastCol = null;
  });

  table.on('cellClick', (e, cell) => { lastCol = cell.getColumn(); });

  if (el.next) {
    el.next.addEventListener('click', (e) => {
      if (saveData()) return;
      e.preventDefault();
      el.error.setAttribute('tabindex', '-1');
      el.error.focus();
    });
  }
}

/* ---------- 시작 ---------- */

// 시작 (표 생성, 저장된 데이터 복원)
export async function initDataInput() {
  if (typeof Tabulator === 'undefined') {
    throw new Error('dataInput.js: load Tabulator before this module.');
  }
  el.help = document.getElementById('data-input-help');
  el.next = document.getElementById('next-step');
  if (!el.help) {
    throw new Error('dataInput.js: required elements are missing in the page.');
  }

  buildControls();

  table = new Tabulator(el.tableEl, {
    data: [],
    columns: buildColumns([defaultHeader(0), defaultHeader(1)]),
    layout: 'fitDataStretch',
    maxHeight: '420px',
    selectableRows: 'highlight',
    placeholder: 'Click "Add row" to start entering data.'
  });
  await new Promise((resolve) => table.on('tableBuilt', resolve));

  const saved = getState().data;
  if (saved && saved.columns.length >= 2) await setTable(saved.columns, saved.rows);
  else await setTable([defaultHeader(0), defaultHeader(1)], [[], [], []]);

  bindEvents();
}
