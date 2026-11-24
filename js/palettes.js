// 색각 유형 팔레트 데이터 (FR-04)
// cvdType 값: general, protanopia, deuteranopia, tritanopia (state.js와 동일)
// types: 출처에서 구분 가능하다고 밝힌 유형만 포함. 선정 근거는 Design/PaletteResearch.md

export const PALETTES = [
  // 전 유형
  {
    id: "okabe-ito",
    name: "Okabe-Ito",
    colors: ["#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7", "#000000"],
    types: ["general", "protanopia", "deuteranopia", "tritanopia"],
    note: "Designed for all types of color vision. Use for up to 8 items.",
    source: "Okabe & Ito (2008), Color Universal Design; Wong (2011), Nature Methods"
  },

  // 적색맹·녹색맹 (청색맹은 출처에서 다루지 않음)
  {
    id: "tol-muted",
    name: "Paul Tol Muted",
    colors: ["#CC6677", "#332288", "#DDCC77", "#117733", "#88CCEE", "#882255", "#44AA99", "#999933", "#AA4499"],
    types: ["general", "protanopia", "deuteranopia"],
    note: "Safe for red-green color blindness. Use for many items (up to 9).",
    source: "Tol (2021), Colour Schemes, SRON technical note"
  },
  {
    id: "cividis",
    name: "Cividis",
    colors: ["#00224E", "#35456C", "#666970", "#948E77", "#C8B866", "#FEE838"],
    types: ["general", "protanopia", "deuteranopia"],
    note: "Optimized for red-green color blindness. Dark to light, for ordered values (up to 6 items).",
    source: "Nuñez, Anderton & Renslow (2018), PLOS ONE"
  }
];

export const DEFAULT_PALETTE_ID = "okabe-ito";

// 해당 유형에서 사용 가능한 팔레트 목록 (드롭다운용)
export function getPalettesByType(cvdType) {
  return PALETTES.filter(palette => palette.types.includes(cvdType));
}

// 실제 사용할 팔레트 객체 반환
// 없는 id 또는 해당 유형에서 사용 불가한 id("default" 포함)는 기본 팔레트로 대체
export function getPaletteInfo(cvdType, paletteId) {
  const available = getPalettesByType(cvdType);
  return available.find(palette => palette.id === paletteId)
    ?? PALETTES.find(palette => palette.id === DEFAULT_PALETTE_ID);
}

// 색 배열 반환 (원본 보호를 위해 복사본)
// 사용 예: option.color = getPalette(state.cvdType, state.paletteId);
export function getPalette(cvdType, paletteId) {
  return [...getPaletteInfo(cvdType, paletteId).colors];
}
