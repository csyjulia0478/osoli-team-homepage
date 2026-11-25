# Osoviz Detailed Design Guide
- Defining Caption, Tooltip, and Highlight Designs.
  - The tooltip and highlight appear on screen only. They will never be part of output image files.
  - Each design is basically suggested in both normal and high contrast mode.

## 1. Tooltip (ECharts options)

- As decided in the PR review, the tooltip will be styled with **ECharts options**.

| Type | Normal Mode | High Contrast Mode |
| -- | -- | -- |
| Background | #FFFFFF | #FFFFFF |
| Border | 1px #595959 | 2px #111111 |
| Text | 14px #111111 | 16px #111111 |
| Font Weight | normal (name and value) | bold (name and value) |
| Padding | 8px | 12px |
| Corner Radius | 8px | 8px |
| Shadow | ECharts default | ECharts default |
| Content | Series name + item name + value (ECharts default format) | Same |

- The normal mode's background is also white (#FFFFFF), since the data should be readable even when it is over the chart.
- Font Weight: In default ECharts, it draws the value at weight 900, so sometimes the data is hard to read. Setting textStyle.fontWeight applies lighter weight to both the name and the value, so use normal in normal mode and use bold in high contrast mode since high contrast mode provide stronger text.





## 2. Highlight (ECharts `emphasis` options)

| Type | Normal Mode | High Contrast Mode |
| -- | -- | -- |
| Outline of the highlighted data | 2px #111111 | normally 3px -> 5px (thickened when hover) #111111 |
| Value label of the highlighted data | No value labels in the normal mode | 18px (highlighted items only, others stay 16px) |
| The other data | Dimmed to opacity 0.35 | Dimmed to opacity 0.4 |
| Scope | Highlight the whole series | Same |

- In high contrast mode, the other data is dimmed to opacity 0.4, which is higher than 0.35 of normal mode. It is because the patterns of other series should be seen for comparison.





## 3. Legend Toggle (ECharts `legend` options)

| State | Icon (Swatch) | Icon(Swatch Border) | Text |
| -- | -- | -- | -- |
| On (Normal) | Filled with the series color | None | 14px #333333 |
| On (High Contrast) | Series color + pattern | 2px #111111 border | 16px #111111 |
| Off (Both Modes) | Gray fill #6B7480 | Normal mode: None / High Contrast: 2px #6B7480 | #6B7480 |

- The off states can be seen in all **three ways**: 
  - (1) The swatch and text turn into gray. (like in the chart above)
  - (2) The series disappears from the chart (a content change)
  - (3) in high contrast, the pattern that the on-state swatch has is absent from the off-state swatch. (a shape change)

- The series turned off through the legend will **stay off in the downloaded images**. 





## 4. Caption (Summary) Area (`figcaption + details`)
### 4-1. Appearance

| Type | Normal Mode | High Contrast Mode |
| -- | -- | -- | 
| Summary Sentence | 1rem #111111 | Same |
| Statistic Name (dt) | Bold #111111 | Same |
| Statistic Value (dd) | #333333 | #111111 |
| More Details(summary) | Bold #005A8C, cursor pointer | Bold, #111111, underlined |
| Expanded list | 1rem, line-height 1.6 | Same |
| Spacing | 16px between summary and statistics, 8px between items | Same |
| Focus Indicator | 3px #005A8C | Same |

- Since our goal is to provide information not only rely on the color itself, the high-contrast summary is #111111 with underline, so the users can understand they can click it.
  - Caption text is 16px or larger in both modes, so high contrast changes no sizes here.





## 5. Implementation Notes

- **Tooltip**: Set `borderColor` explicitly in both modes. If it is not set, the border takes the color of the hovered data.
- **Legend off state**: `legend.inactiveColor: '#6B7480'` + `inactiveBorderColor: '#6B7480'`. Without the second option, the off swatch gets a light gray (#ccc) border that is not in the design guide.
  - Do not use a *hollow* swatch (`inactiveColor: '#FFFFFF'`) — the text also turns white.


- **Caption ids**: the structure below is what the follow-up `contrast.css` PR will target. Tell me if any id changes!

```html
<figure>
  <div id="chart-preview">…chart…</div>
  <figcaption id="chart-caption">
    <p id="chart-summary">Summary sentence (summarize().short)</p>
    <dl id="chart-statistics">
      <div><dt>Max</dt><dd>34 (B)</dd></div>
      <div><dt>Min</dt><dd>12 (A)</dd></div>
      <div><dt>Difference</dt><dd>22</dd></div>
      <div><dt>Average</dt><dd>23</dd></div>
    </dl>
    <details>
      <summary>More Details</summary>
      <ul> detail sentences (summarize().details) </ul>
    </details>
  </figcaption>
</figure>
```
