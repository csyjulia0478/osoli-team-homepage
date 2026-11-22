# Osoviz High Contrast Guide

## 1.How Contrast Mode Help People To Understand Visuals

When the user select the high contrast mode, the chart gets **extra visual cues** on top of the palette they selected.
Since some people cannot distinguish two colors apart even in a CVD-safe palette, some patterns or numbers are used for them to understand the chart, and this is the **'High Contrast Mode'**.

- **The palette never changes.** The colors come from the CVD-safe palette user chose.
- High contrast only adds patterns, bold outlines, bigger value labels, and bigger text on top of it.
- The chart area always has a **white background(color: #ffffff) with dark ink(color: #111111).**: Additionally, high contrast mode's patterns could be marked as #111111 or #ffffff depends on filled colors.




## 2. Patterns

Each series(ex. bar chart's bar) gets its own pattern, in the same order every time. Series 1 always gets pattern 1, series 2 gets pattern 2, and so on. For a pie chart, slice 1 gets pattern 1 and so on.

| Number | Pattern | Size and Spacing |
| -- | -- | -- |
| 1 | Solid (No Pattern) | Fill colors only |
| 2 | Diagonal Stripes | 45deg (in ECharts: Math.PI / 4), 3px lines, 5px gaps (8px period) |
| 3 | Dots | 4.5px dots, 10px apart |
| 4 | Horizontal Stripes | 3px lines, 5px gaps (8px period) |
| 5 | Triangles | About 5px triangles, 12px apart |
| 6 | Vertical Stripes | 3px lines, 5px gaps (8px period) |

- **Pattern color**: dark(#111111) or white(#ffffff), whichever contrasts more with the filled color of series. Patterns are told apart by their shape (stripes, dots, triangles), not by the line color, so the line color may differ between series.
- They still look different from each other in black and white, and the repeated is short, so even a narrow bar can show the pattern.
- **After 6 series**, the patterns are repeated in the same order. Show a short notice, for example: "Some patterns are repeated. Use the value labels to tell them apart, or make series 6 or less."
- **Colors still help understanding.** If the palette has more than 6 colors, repeated patterns come with a different color. So users can distinguish different series.




## 3. How each chart tells series apart

| Chart | Cue |
| -- | -- |
| Bar | Pattern |
| Pie | Pattern |
| Line | Line type (solid, dashed, dotted) + marker shape |
| Scatter | Marker Shape |
| Bubble | Pattern |

- **Scatter has no patterns**: a standard ECharts scatter series does not draw patterns on markers (we tested this). Marker shape, outline, and value label do the job instead.


### 3-1. Line Chart

| Number | Line Type | Marker Shape |
| -- | -- | -- |
| 1 | Solid | Circle |
| 2 | Dashed (16px dash, 8px gap) | Square |
| 3 | Dotted (8px dash, 4px gap) | Triangle |
| 4 | Solid | Diamond |
| 5 | Dashed | Rounded square |
| 6 | Dotted | Arrow |

- Line width 4px. Markers are 12px with a 2px #111111 border.
- Line types repeated every 3 series, but the marker shape is different so no two series look the same if the series is equal or less than 6.
- **Light line colors**: a line has no outline, so a very light palette color can be hard to see on white. Darken the line color until it has at least 4.5:1 contrast with white. The markers keep the palette color.



### 3-2. Scatter and bubble charts

| Number | Marker Shape |
| -- | -- |
| 1 | Circle |
| 2 | Square |
| 3 | Triangle |
| 4 | Diamond |
| 5 | Rounded square |
| 6 | Arrow |


| Chart | Marker Size | Marker Border |
| -- | -- | -- |
| Scatter | 14px or larger | 3px, #111111 |
| Bubble 24px or larger (a bigger value gives a bigger bubble) | 3px, #111111 |
- The bubble minimum of 24px keeps the shape visible, even for the smallest value.



## 4. Border Thickness

| Element | High Contrast |
| -- | -- |
| Outline of Bars, Pie Slices, and Scatter/Bubble Markers | 3px, #111111 |
| Line Width | 4px |
| Line Marker Border | 2px, #111111 |
| Axis Lines | 3px, #111111 |

A dark outline keeps the edge of each shape clear, even when its fill color is light.




### 5. Labels for Values

- Show a value label on every data point, right next to the data. Do not rely on the legend alone.
- 16px or larger, bold.
- Put the number **on a white plate with a 2px #111111 border**, so it stays readable when the label is overlap with the patterns.

- Pie Chart: labels read like `name: value (percent)`.
- Line Chart: where lines cross, labels can overlap. Keep every label and shift the overlapping ones up or down so each on stays readable. Do not hide labels. 
- All other chart text (axes, legend) is 16px or larger too.

- For scatter and bubble charts with more than 15 points, labels only the point highest and lowest points by y value. A label on every point overlaps and cannot be read.
