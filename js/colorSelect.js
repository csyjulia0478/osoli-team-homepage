// 색각 유형 선택(FR-03), 유형별 팔레트 표시(FR-04)
// input.html: 색각 유형 라디오 → state.cvdType 저장
// generate.html: 유형별 팔레트 드롭다운, 색 견본·설명 표시 → state.paletteId 저장
// 각 페이지에 해당 요소가 있을 때만 동작

import { getState, updateState } from "./state.js";
import { getPalettesByType, getPaletteInfo } from "./palettes.js";

// input.html: 색각 유형 선택
function initColorVisionType() {
  const radios = document.querySelectorAll('input[name="color-vision-type"]');
  if (radios.length === 0) return;

  const { cvdType } = getState();

  radios.forEach(radio => {
    radio.checked = radio.value === cvdType;
    radio.addEventListener("change", () => {
      // 기존 팔레트가 새 유형에서 사용 불가하면 기본 팔레트로 교체
      const paletteId = getPaletteInfo(radio.value, getState().paletteId).id;
      updateState({ cvdType: radio.value, paletteId });
    });
  });
}

// generate.html: 팔레트 드롭다운
function initPaletteSelect() {
  const select = document.getElementById("color-palette");
  if (!select) return;

  const { cvdType, paletteId } = getState();
  const current = getPaletteInfo(cvdType, paletteId);

  select.innerHTML = "";
  getPalettesByType(cvdType).forEach(palette => {
    const option = document.createElement("option");
    option.value = palette.id;
    option.textContent = palette.name;
    option.selected = palette.id === current.id;
    select.appendChild(option);
  });

  // 견본·설명 표시 영역 (안내 문구 아래)
  const preview = document.createElement("div");
  document.getElementById("palette-help").after(preview);
  showPalette(preview, current);

  select.addEventListener("change", () => {
    updateState({ paletteId: select.value });
    showPalette(preview, getPaletteInfo(cvdType, select.value));
  });
}

// 색 견본, 설명 표시
function showPalette(container, palette) {
  const swatches = document.createElement("div");
  swatches.setAttribute("aria-hidden", "true");
  swatches.style.cssText = "display:flex; gap:8px; margin:8px 0;";

  palette.colors.forEach(color => {
    const chip = document.createElement("span");
    chip.style.cssText = `width:32px; height:32px; border:1px solid #595959; border-radius:4px; background:${color};`;
    swatches.appendChild(chip);
  });

  const note = document.createElement("p");
  note.textContent = palette.note;

  container.replaceChildren(swatches, note);
}

initColorVisionType();
initPaletteSelect();
