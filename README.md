# OSOVIZ

OSOVIZ is a web-based data visualization service that helps creators produce accessible visual materials for people with color vision deficiencies and visual impairments.

It enables users to generate and convert charts using CVD-safe color palettes, high-contrast settings, and automatically generated graph summaries, making visual information easier to distinguish and understand.

## 1. Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES Modules)
- **Data Visualization:** Apache ECharts
- **Data Input:** Tabulator, PapaParse, SheetJS
- **Accessibility & Color:** chroma.js
- **Statistics:** simple-statistics
- **Deployment:** GitHub Pages

## 2. Features

- Interactive data input and editing
- CSV and Excel file upload
- Five visualization types: Bar, Line, Pie, Scatter, Bubble
- Accessible chart generation and customization
- CVD-safe color palettes
- High-contrast visualization
- Automatic graph summaries and descriptive captions
- Real-time chart preview

## 3. Collaboration Conventions

### 3.1. Issue Convention

**Basic Rules**

- Issue titles must follow the format `[Type] Task Description`.
- Each issue should clearly describe the task and its acceptance criteria.
- Assign an appropriate team member to each issue.
- Use the provided GitHub Issue templates.

**Example**

`[Feat] Implement chart generation`

### 3.2. Branch Convention

**Naming Rules**

- Branch names must follow the format `type/#issue-number-task-description`.
- Use lowercase English letters and hyphens for the task description.
- Create a new branch from the latest `main` branch for each task.

**Examples**

- `feat/#12-chart-generation`
- `fix/#15-palette-error`
- `docs/#18-update-readme`
- `chore/#20-project-setup`

**Branch Types**

| Type | Description |
|---|---|
| `feat` | New feature implementation |
| `fix` | Bug fixes |
| `docs` | Documentation updates |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `style` | UI/CSS changes |
| `chore` | Project configuration and maintenance |

The `main` branch is used for stable, reviewed, and deployable code.

### 3.3. Commit Convention

**Basic Rules**

- Commit messages must follow the format `[type/#issue-number] Description`.
- Descriptions should clearly summarize the changes in one line.
- Keep each commit focused on a single logical change.

**Examples**

- `[feat/#12] Implement chart generation`
- `[fix/#15] Fix palette selection error`
- `[docs/#18] Update README`
- `[init/#20] Set up project structure`

**Commit Types**

| Type | Description |
|---|---|
| `feat` | Implement a new feature |
| `fix` | Fix a bug |
| `docs` | Update documentation |
| `refactor` | Refactor existing code |
| `test` | Add or modify tests |
| `comment` | Add or update necessary comments |
| `remove` | Remove files or code |
| `rename` | Rename files or directories |
| `init` | Initial project setup |
| `chore` | Update build settings, dependencies, formatting, or other maintenance tasks |
| `style` | Update UI or CSS |

### 3.4. Pull Request Convention

**Basic Rules**

- PR titles should match their corresponding Issue titles.
- Use the provided PR template.
- Link the related Issue in the PR description.
- At least **one team member must review and approve** the PR before merging into `main`.
- Resolve merge conflicts and address required review feedback before merging.
- Verify that the implemented feature works correctly before requesting a review.

**Example**

PR Title: `[Feat] Implement chart generation`

Related Issue: `Closes #12`

### 3.5. Code Review Convention

Use the **Pn Rule** for code review comments.

All review comments should follow the format:

`P{n}: Review Comment`

| Priority | Description | Recommended Action |
|---|---|---|
| P1 | Must be addressed | Request changes |
| P2 | Strongly recommended | Request changes |
| P3 | Recommended to address | Comment |
| P4 | Optional improvement | Approve |
| P5 | Minor suggestion | Approve |

**Examples**

- `P1: Please fix this issue before merging.`
- `P2: Consider adding validation for empty input data.`
- `P3: It would be better to extract this logic into a separate function.`
- `P4: You could simplify this condition for readability.`
- `P5: Minor naming suggestion.`

## 4. Development Workflow

1. Create or select a GitHub Issue.
2. Create a feature branch from the latest `main`.
3. Implement the assigned task.
4. Commit changes following the commit convention.
5. Push the branch and create a Pull Request.
6. Request a code review from at least one team member.
7. Address required feedback and resolve conflicts.
8. Merge the approved PR into `main`.
9. Verify the merged changes.

## 5. Deployment

The project will be deployed using GitHub Pages.

Only reviewed and approved changes should be merged into `main` for deployment.
