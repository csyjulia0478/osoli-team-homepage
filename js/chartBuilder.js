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
// 팔레트 모듈 연결 전 테스트에 사용할 기본 색상
const DEFAULT_COLORS = [
  '#5470C6', '#91CC75', '#FAC858',
  '#EE6666', '#73C0DE', '#3BA272',
  '#FC8452', '#9A60B4', '#EA7CCC'
];

const INK = '#111111';
const WHITE = '#FFFFFF';

const MARKERS = ['circle', 'rect', 'triangle', 'diamond', 'roundRect', 'arrow'];
const LINE_TYPES = ['solid', [16, 8], [8, 4]];

// 빈칸은 0과 구분하기 위해 null로 처리한다.
function toNumber(value) {
  if (typeof value === 'string' && value.trim() !== '') {
    value = Number(value);
  }

  return Number.isFinite(value) ? value : null;
}

// 선택한 열은 열 번호 또는 열 이름으로 받을 수 있다.
function getColumnIndex(column, columns) {
  return typeof column === 'number' ? column : columns.indexOf(column);
}

function getRGB(hexColor) {
  return [1, 3, 5].map(start =>
    parseInt(hexColor.slice(start, start + 2), 16)
  );
}

function getLuminance(rgb) {
  const [r, g, b] = rgb.map(value => {
    const channel = value / 255;

    if (channel <= 0.04045) return channel / 12.92;
    return ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 선 차트에서는 밝은 선만 어둡게 조정한다. 마커는 원래 색을 사용한다.
function getLineColor(fillColor) {
  let rgb = getRGB(fillColor);

  while (1.05 / (getLuminance(rgb) + 0.05) < 4.5) {
    rgb = rgb.map(channel => Math.floor(channel * 0.95));
  }

  return `rgb(${rgb.join(',')})`;
}

// 막대, 파이 조각, 버블 안쪽을 채울 반복 무늬를 만든다.
// 순서: 단색 → 대각선 → 점 → 가로줄 → 삼각형 → 세로줄
function getPatternFill(fillColor, index) {
  const pattern = index % 6;
  if (pattern === 0) return fillColor;

  const sizes = [0, 11, 10, 8, 12, 8];
  const size = sizes[pattern];

  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;

  const ctx = tile.getContext('2d');
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, size, size);

  const fillLight = getLuminance(getRGB(fillColor));
  const inkLight = getLuminance(getRGB(INK));
  const darkContrast =
    (Math.max(fillLight, inkLight) + 0.05) /
    (Math.min(fillLight, inkLight) + 0.05);
  const whiteContrast = 1.05 / (fillLight + 0.05);

  const patternColor = darkContrast >= whiteContrast ? INK : WHITE;
  ctx.fillStyle = patternColor;
  ctx.strokeStyle = patternColor;

  switch (pattern) {
    case 1:
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (const offset of [-size, 0, size]) {
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset + size, size);
      }
      ctx.stroke();
      break;

    case 2:
      ctx.beginPath();
      ctx.arc(5, 5, 2.25, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 3:
      ctx.fillRect(0, 0, size, 3);
      break;

    case 4:
      ctx.beginPath();
      ctx.moveTo(6, 3);
      ctx.lineTo(9, 8);
      ctx.lineTo(3, 8);
      ctx.closePath();
      ctx.fill();
      break;

    case 5:
      ctx.fillRect(0, 0, 3, size);
      break;
  }

  return { image: tile, repeat: 'repeat' };
}

function makeValueLabel(highContrast) {
  return {
    show: highContrast,
    position: 'top',
    color: INK,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: WHITE,
    borderColor: INK,
    borderWidth: 2,
    padding: [2, 4]
  };
}

function makeItemStyle(color, index, highContrast, usePattern, borderWidth) {
  return {
    color: highContrast && usePattern ? getPatternFill(color, index) : color,
    borderColor: INK,
    borderWidth: highContrast ? borderWidth : 0,
    opacity: 1
  };
}

// 16개 이상의 점이 있으면 전체 점 중 Y 최솟값과 최댓값에만 라벨을 붙인다.
function limitPointLabels(points) {
  if (points.length <= 15) return;

  let min = points[0];
  let max = points[0];

  for (const point of points) {
    if (point.value[1] < min.value[1]) min = point;
    if (point.value[1] >= max.value[1]) max = point;
  }

  for (const point of points) {
    point.label = { show: point === min || point === max };
  }
}

/**
 * 공통 state를 받아 ECharts 옵션을 반환한다.
 * colors는 통합 시 선택한 팔레트의 #RRGGBB 배열을 전달하는 선택 인자다.
 * buildChartOption(state)만 호출해도 기본 팔레트로 동작한다.
 */
export function buildChartOption(state, colors = DEFAULT_COLORS) {
  const { columns, rows } = state.data;
  const type = state.chartType;
  const highContrast = Boolean(state.highContrast);

  if (columns.length < 2 || rows.length === 0) {
    throw new Error('Enter at least two columns and one row of data.');
  }

  if (!['bar', 'line', 'pie', 'scatter', 'bubble'].includes(type)) {
    throw new Error('Choose a supported chart type.');
  }

  const isPie = type === 'pie';
  const isLine = type === 'line';
  const isBubble = type === 'bubble';
  const isPointChart = type === 'scatter' || isBubble;

  const selected = state.selectedColumns || {};
  const x = selected.x == null ? 0 : getColumnIndex(selected.x, columns);

  const remainingColumns = columns.map((_, i) => i).filter(i => i !== x);
  let ys = selected.y?.length
    ? selected.y.map(column => getColumnIndex(column, columns))
    : remainingColumns;

  if (
    !ys.length ||
    ys.includes(x) ||
    ![x, ...ys].every(i => Number.isInteger(i) && i >= 0 && i < columns.length)
  ) {
    throw new Error('Choose an X column and a different value column.');
  }

  if (isPie) {
    if (selected.y?.length > 1) {
      throw new Error('Choose one value column for a pie chart.');
    }
    ys = ys.slice(0, 1);
  }

  const textStyle = highContrast ? { color: INK, fontSize: 16 } : {};
  const label = makeValueLabel(highContrast);

  const option = {
    color: colors,
    backgroundColor: WHITE,
    textStyle,
    tooltip: { trigger: 'item', renderMode: 'richText' },
    legend: { type: 'scroll', textStyle },
    series: []
  };

  if (isPie) {
    const slices = [];

    for (const row of rows) {
      const value = toNumber(row[ys[0]]);
      if (value === null) continue;
      if (value < 0) throw new Error('Pie charts require non-negative values.');

      const index = slices.length;
      const color = colors[index % colors.length];

      slices.push({
        name: String(row[x] ?? ''),
        value,
        itemStyle: makeItemStyle(color, index, highContrast, true, 3)
      });
    }

    if (!slices.some(slice => slice.value > 0)) {
      throw new Error('A pie chart needs at least one positive value.');
    }

    option.series.push({
      name: columns[ys[0]],
      type: 'pie',
      radius: '55%',
      data: slices,
      label: {
        ...label,
        position: 'outside',
        formatter: '{b}: {c} ({d}%)'
      }
    });
  } else {
    const axisStyle = {
      axisLabel: textStyle,
      axisLine: {
        show: true,
        lineStyle: { color: INK, width: highContrast ? 3 : 1 }
      }
    };

    option.grid = {
      top: 65, bottom: 45, left: 35, right: 35, containLabel: true
    };

    // 산점도와 버블은 숫자 X·Y 좌표를 사용한다.
    // 막대와 선은 선택한 X 열의 값을 항목 이름으로 표시한다.
    option.xAxis = isPointChart
      ? { ...axisStyle, type: 'value', name: columns[x], scale: true }
      : { ...axisStyle, type: 'category', data: rows.map(row => String(row[x] ?? '')) };

    option.yAxis = { ...axisStyle, type: 'value' };

    const points = [];
    let largestBubble = 0;
    let hasData = false;

    ys.forEach((y, index) => {
      const color = colors[index % colors.length];
      const series = {
        name: columns[y],
        type: isPointChart ? 'scatter' : type,
        label,
        itemStyle: makeItemStyle(
          color, index, highContrast, type === 'bar' || isBubble, isLine ? 2 : 3
        )
      };

      if (isPointChart) {
        series.data = [];

        for (const row of rows) {
          const xValue = toNumber(row[x]);
          const yValue = toNumber(row[y]);
          if (xValue === null || yValue === null) continue;

          if (isBubble && yValue < 0) {
            throw new Error('Choose non-negative Y values for bubble sizes.');
          }

          const point = { value: [xValue, yValue] };
          series.data.push(point);
          points.push(point);
          largestBubble = Math.max(largestBubble, yValue);
        }

        series.encode = { x: 0, y: 1, tooltip: [0, 1] };
        series.label = { ...label, formatter: p => String(p.value[1]) };

        if (isBubble) {
          series.symbol = 'circle';
          series.symbolSize = pair =>
            24 + 30 * Math.sqrt(pair[1] / (largestBubble || 1));
        } else {
          series.symbol = highContrast ? MARKERS[index % 6] : 'circle';
          series.symbolSize = highContrast ? 14 : 9;
        }

        if (series.data.length) hasData = true;
      } else {
        series.data = rows.map(row => toNumber(row[y]));
        if (series.data.some(value => value !== null)) hasData = true;

        if (isLine) {
          series.showAllSymbol = true;
          series.symbol = highContrast ? MARKERS[index % 6] : 'circle';
          series.symbolSize = highContrast ? 12 : 6;
          series.lineStyle = {
            color: highContrast ? getLineColor(color) : color,
            width: highContrast ? 4 : 2,
            type: highContrast ? LINE_TYPES[index % 3] : 'solid'
          };
          series.labelLayout = { moveOverlap: 'shiftY', hideOverlap: false };
        }
      }

      option.series.push(series);
    });

    if (!hasData) {
      throw new Error(isPointChart
        ? 'Select numeric X and Y columns with at least one complete pair.'
        : 'The selected value columns contain no numeric data.');
    }

    if (isPointChart && highContrast) limitPointLabels(points);
  }

  const cueCount = isPie ? option.series[0].data.length : option.series.length;

  if (highContrast && cueCount > 6) {
    option.title = {
      subtext: 'Some visual cues repeat after six. Use the legend and value labels.',
      bottom: 0,
      left: 'center'
    };
  }
  if (state.chartType === 'bubble') formatBubbleChart(option, state.highContrast);
  return option;
}

function formatBubbleChart(option, highContrast) {
  // 양 끝 버블이 축 눈금을 덮지 않도록 여백을 둔다.
  Object.assign(option.xAxis, {
    scale: true,
    boundaryGap: ['12%', '12%'],
    nameLocation: 'middle',
    nameGap: 32
  });
  option.yAxis.boundaryGap = [0, '20%'];
  option.grid.bottom = 56;

  if (!highContrast) return;

  for (const series of option.series) {
    series.label = { ...series.label, position: 'right', distance: 5 };

    const fill = series.itemStyle.color;
    if (!fill?.image) continue; // 단색 버블은 기존 원을 그대로 사용한다.

    const symbols = new Map();

    for (const point of series.data) {
      const size = Math.ceil(series.symbolSize(point.value));

      if (!symbols.has(size)) {
        const canvas = document.createElement('canvas');
        const resolution = 2;
        canvas.width = canvas.height = size * resolution;

        const ctx = canvas.getContext('2d');
        ctx.scale(resolution, resolution);
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, (size - 3) / 2, 0, Math.PI * 2);
        ctx.fillStyle = ctx.createPattern(fill.image, 'repeat');
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#111111';
        ctx.stroke();

        symbols.set(size, 'image://' + canvas.toDataURL('image/png'));
      }

      point.symbol = symbols.get(size);
      point.symbolSize = size;
    }
  }
}