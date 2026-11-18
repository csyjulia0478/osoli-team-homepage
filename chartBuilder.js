/**
 * 공통 state를 받아 ECharts 옵션을 반환합니다.
 * 현재는 막대 차트 옵션의 기본 구조만 작성한 상태입니다.
 * 로컬 테스트 페이지에서 샘플 데이터로 렌더링을 확인했습니다. -> 혹시 필요하시면 테스트 페이지도 올려둘게요!
 * 실제 입력 데이터 연결 및 나머지 차트는 추후 구현할 예정입니다. 
 * 
 * <실제 생성 화면 연결 시 필요한 작업>
 * 
 * 1. generate.html에서 ECharts를 로드 (generate.html의 </head> 보다 윗 부분에 아래 코드 추가가 필요합니다)
 * <script src="https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js"></script>
 * 
 * 2. generate.html의 chart-preview 부분에 차트 높이/너비 지정 필요! 특히 높이
 * 
 * 3. 나중에 generate.js 코드가 만들어지면 generate.html의 </body> 보다 윗 부분에 아래 코드로 js 연결해줍니다
 * <script type="module" src="./generate.js"></script>
 * 
 * 4. generate.js에서 이 함수의 반환값을 chart.setOption()에 전달합니다.
 */
export function buildChartOption(state) {
  switch (state.chartType) {
    case "bar":
      return buildBarOption();

    default:
      throw new Error(
        `아직 구현되지 않은 차트 종류입니다: ${state.chartType}`
      );
  }
}

function buildBarOption() {
  return {
    xAxis: {
      type: "category",
      data: []
    },

    yAxis: {
      type: "value"
    },

    series: [
      {
        type: "bar",
        data: []
      }
    ]
  };
}