// 팔레트 색과 차트 배경의 대비율 검사 (chroma.js 사용)
// 기준: WCAG 1.4.11, 그래픽 요소는 배경과 3:1 이상

export const MIN_GRAPHIC_CONTRAST = 3;

// 반환값: { lowest: { color, ratio }, failing: [3:1 미만 색], total: 전체 색 수 }
export function checkContrast(colors, background = "#FFFFFF") {
  const results = colors.map(color => ({
    color,
    ratio: chroma.contrast(color, background)
  }));

  const lowest = results.reduce((min, result) => (result.ratio < min.ratio ? result : min));
  const failing = results
    .filter(result => result.ratio < MIN_GRAPHIC_CONTRAST)
    .map(result => result.color);

  return { lowest, failing, total: colors.length };
}
