# Osoviz Design Guide

## 1. Color
### 1-1. Color Table

| Type | Style(Value) | Used |
| --- | --- | --- |
| Background | #FFFFFF | Page background |
| Surface | #EAEFF5 | Cards and input box background |
| Main Text | #111111 | Titles, body text |
| Sub Text | #333333 | Descriptions, captions |
| Main Color | #005A8C | Basic buttons, links, focus ring, selected state |
| Main Color (Hover) | #003F63 | Basic buttons and links while the mouse is above |
| Border | #595959 | Input box and sub button borders |
| Card Border | #6B7480 | Card border, dividers |
| Error | #8B1A2B | Error text, Error input border |
| Inactive Background | #D9DEE5 | Inactive button background |
| Inactive Text | #4D4D4D | Inactive button text |


### Usage Evidence

Osoviz is made for creators who produce visual materials for people with color vision deficiency (CVD). Since people with CVD may also use the platform, the design is focused on working well for users both with and without CVD.

1. **Use blue as the base color.** People with red or green color weakness can still distinguish blue tones, so the main color and the selected state use a blue family. The main color #005A8C is a darker version of the Okabe-Ito blue, #0072B2.
2. **Keep large lightness differences.** People who cannot tell hues apart can still notice differences in lightness. Text, borders, and buttons exceed the WCAG 2.2 AA minimums (text 4.5:1, UI elements 3:1).
3. **Avoid using color alone to convey information.** Marking an error input only with color is a typical failure under WCAG 2.2 SC 1.4.1 (Use of Color). Thus, errors, links, and selected items must have a second cue, like an icon or an underline.


### Color Rules

Avoid using color alone to convey information.
- Errors: color + icon(a Circle with an X inside it) + "Error: " + information text
- Links: color + underline
- Selected items: color + thick border + check icon



## 2. Text Font and Text Size
### 2-1. Table

| Type | Style |
| --- | --- |
| Font | font-family: Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; |
| Text (본문) | 1rem (16px), line-height: 1.6 |
| Sub Text (Caption, Label) | 0.875rem (14px) no less than this |
| H1 | 2rem, bold (font-weight: 700) |
| H2 | 1.5rem, bold |
| H3 | 1.25rem, bold |

- For better experience, suggesting text size with rem, since it could be differed by user's browsers setting.
- No need to install or load since OSOVIZ only use basic system font, not from external font.



## 3. Spacing

Only use the values below.

| Type | Style | Used |
| --- | --- | --- |
| Small | 8px | Between a label and its input box | 
| Middle | 16px | Default spacing between elements |
| Large | 24px | Padding inside cards |
| Extra Large | 32px | Between large sections |



## 4. Border Radius

| Type | value |
| --- | --- |
| Buttons, Input Boxes | 8px |
| Cards | 12px |



## 5. Components
### Header

| Type | Style |
| --- | --- |
| Background | #FFFFFF |
| Bottom Border | 1px solid #6B7480 |
| Logo | #111111, bold |
| Menu Links | #111111, underlined / Current menu: bold with 3px underline | 
| Padding | 16px 32px |
| Focus | outline: 3px solid #005A8C; outline-offset: 2px |


### Link

| Type | Style |
| --- | --- |
| Normal | text #005A8C, underlined |
| Hover (Mouse Over) | text #003F63, underlined |
| Focus (Keyboard) | outline: 3px solid #005A8C; outline-offset: 2px |

- Header menu links are the exception: it maintains underline and the text color #111111.


### Button

| Type | Style |
| --- | --- |
| Basic | background #005A8C; text: #FFFFFF, bold; padding: 12px 24px; min-height 44px; border-radius 8px |
| Basic (Hover) | background #003F63 |
| Sub | background #FFFFFF; border 2px solid #005A8C; text #005A8C |
| Inactive | background #D9DEE5; text #4D4D4D; cursor: not-allowed |
| Focus | outline: 3px solid #005A8C; outline-offset: 2px |


### Input Box

| Type | Style |
| --- | --- |
| Border | 2px solid #595959 |
| Padding | 12px |
| Border Radius | 8px |
| Text | 1rem, #111111 |
| Min-height | 44px |
| Label | Default display above the input box, 8px spacing |
| Focus | outline: 3px solid #005A8C / outline-offset: 2px |
| Error State | border 2px solid #8B1A2B / error message(14px, #8B1A2B) under the box, starts with "Error: " and has a circled X icon |


### Card

| Type | Style |
| --- | --- |
| Background | #EAEFF5 |
| Border | 1px solid #6B7480 |
| Border Radius | 12px |
| Padding | 24px |
| Spacing between cards | 16px |


### Selected Option

| Type | Style |
| --- | --- |
| Selected | border 3px solid #005A8C with check icon |
| Not selected | border 2px solid #595959 |


