# Division Portal Modularization Plan

## Executive Summary

The Division Portal codebase contains **35+ HTML pages** with significant code duplication and monolithic file structures. This plan outlines a phased approach to modularize the codebase for better maintainability, reusability, and developer experience.

---

## Current State Analysis

### File Statistics

| File | Lines | Tokens | Issues |
|------|-------|--------|--------|
| `biodataform.html` | ~4,900 | ~56,000 | Monolithic, inline CSS/JS, 90+ functions |
| `index.html` | ~890 | ~15,000 | 8 inline modals, some external JS |
| Other HTML files | Varies | - | Similar patterns, code duplication |

### Key Problems

1. **Monolithic Files**: `biodataform.html` contains ~4,900 lines with embedded styles and scripts
2. **Code Duplication**: Same toast, modal, and API patterns repeated across files
3. **Inline Styles**: Heavy use of inline `style` attributes in modals
4. **No Component Reuse**: Each page re-implements common UI elements
5. **Tight Coupling**: Business logic mixed with DOM manipulation
6. **No Build Process**: Raw files served directly, no minification or bundling

### What's Already Good

- External CSS: `division-main.css` exists
- External JS: `division-auth.js` and `division-ui.js` already extracted
- Consistent API patterns using `/api/division/*` endpoints
- Bootstrap 5.3.3 for base styling

---

## Proposed Architecture

```
public/div/
├── index.html                    # Dashboard (simplified)
├── biodataform.html              # Staff biodata (simplified)
├── [other pages].html            # Other pages (simplified)
│
├── css/
│   ├── division-main.css         # Core layout & theme
│   ├── components/
│   │   ├── cards.css             # Stat cards, ID cards
│   │   ├── forms.css             # Form styling, validation
│   │   ├── modals.css            # Modal styling
│   │   ├── tables.css            # Table components
│   │   ├── toasts.css            # Toast notifications
│   │   └── progress.css          # Progress rings, bars
│   └── pages/
│       ├── biodataform.css       # Page-specific styles
│       └── dashboard.css         # Dashboard-specific styles
│
├── js/
│   ├── division-auth.js          # Authentication (exists)
│   ├── division-ui.js            # UI interactions (exists)
│   │
│   ├── core/
│   │   ├── api.js                # API client wrapper
│   │   ├── toast.js              # Toast notifications
│   │   ├── modal.js              # Modal management
│   │   ├── form-utils.js         # Form helpers
│   │   └── date-utils.js         # Date formatting/calculations
│   │
│   ├── components/
│   │   ├── staff-search.js       # Autocomplete staff search
│   │   ├── office-selector.js    # Office dropdown component
│   │   ├── progress-ring.js      # Profile completion widget
│   │   └── data-table.js         # Reusable table component
│   │
│   └── pages/
│       ├── biodataform/
│       │   ├── main.js           # Page initialization
│       │   ├── personal.js       # Personal tab logic
│       │   ├── family.js         # Family members CRUD
│       │   ├── training.js       # Training records
│       │   ├── promotions.js     # Promotions CRUD
│       │   ├── detonators.js     # Detonators management
│       │   ├── discipline.js     # Awards/punishments
│       │   └── transfer.js       # Transfer handling
│       │
│       └── dashboard/
│           ├── main.js           # Dashboard initialization
│           ├── stats.js          # Stats cards logic
│           ├── transfers.js      # Transfer processing
│           └── cli-nominations.js # CLI nomination modals
│
├── templates/
│   ├── sidebar.html              # Shared sidebar navigation
│   ├── header.html               # Shared header component
│   └── modals/
│       ├── transfer-modal.html
│       ├── change-password.html
│       └── cli-change.html
│
└── shared/
    └── constants.js              # API endpoints, config
```

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Create Core JavaScript Modules

#### `js/core/api.js`
```javascript
// Centralized API client
const API = {
  baseUrl: '/api/division',

  async get(endpoint) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: 'same-origin'
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  async post(endpoint, data) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  // Convenience methods
  getOffices: () => API.get('/offices'),
  getDesignations: () => API.get('/designations'),
  getTrainingTypes: () => API.get('/training-types'),
  getCurrentUser: () => fetch('/api/current-user').then(r => r.json()),
  // ... more endpoints
};
```

#### `js/core/toast.js`
```javascript
// Unified toast notification system
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'success', duration = 3000) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.textContent = message;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success: (msg) => Toast.show(msg, 'success'),
  error: (msg) => Toast.show(msg, 'error'),
  info: (msg) => Toast.show(msg, 'info'),
  warning: (msg) => Toast.show(msg, 'warning')
};
```

#### `js/core/date-utils.js`
```javascript
// Date formatting and calculations
const DateUtils = {
  formatDDMMYYYY(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN');
  },

  formatForInput(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  },

  calculateAge(dob) {
    if (!dob) return '-';
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  },

  calculatePMEDueDate(pmeDate, dateOfBirth) {
    // Extract existing logic from biodataform.html:1290-1352
  }
};
```

### 1.2 Extract Component CSS

#### `css/components/toasts.css`
```css
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.custom-toast {
  min-width: 300px;
  padding: 12px 20px;
  border-radius: 8px;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,.15);
  animation: slideIn .3s ease;
  margin-bottom: 10px;
}

.custom-toast.success { background: linear-gradient(135deg, #28a745, #20c997); }
.custom-toast.error { background: linear-gradient(135deg, #dc3545, #c82333); }
.custom-toast.info { background: linear-gradient(135deg, #17a2b8, #138496); }
.custom-toast.warning { background: linear-gradient(135deg, #ffc107, #e0a800); color: #000; }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

#### `css/components/modals.css`
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-sm { width: min(450px, 100%); }
.modal-md { width: min(600px, 100%); }
.modal-lg { width: min(900px, 100%); }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  margin: 0;
  color: #1a1d21;
  font-size: 24px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
```

---

## Phase 2: Biodataform Refactoring (Week 3-4)

### 2.1 Split biodataform.html JavaScript

**Current state**: 90+ functions in a single `<script>` block (~3,500 lines)

**Target state**: Modular files by feature domain

| Module | Functions to Extract | Approx. Lines |
|--------|---------------------|---------------|
| `biodataform/main.js` | `init`, `checkUserPermissions`, `loadOffices`, `loadDesignations`, keyboard shortcuts | ~200 |
| `biodataform/personal.js` | `loadStaffData`, `saveBiodata`, `clearForm`, form validation | ~300 |
| `biodataform/family.js` | `addFamilyMember`, `renderFamilyMembers`, `removeFamilyMember`, `editFamilyMember` | ~250 |
| `biodataform/training.js` | `loadTrainings`, `addTraining`, `renderTrainings`, PME calculations | ~400 |
| `biodataform/promotions.js` | `loadPromotions`, `addPromotion`, `renderPromotions`, `removePromotion` | ~200 |
| `biodataform/detonators.js` | `loadDetonators`, `addDetonator`, `renderDetonators`, `removeDetonator` | ~200 |
| `biodataform/discipline.js` | Awards + Punishments CRUD | ~350 |
| `biodataform/transfer.js` | Transfer modal, history loading | ~150 |
| `biodataform/draft.js` | Auto-save, draft restore, localStorage management | ~150 |
| `biodataform/search.js` | Staff autocomplete search functionality | ~150 |

### 2.2 Sample Module Structure

#### `js/pages/biodataform/family.js`
```javascript
// Family Members Module
const FamilyModule = (function() {
  let familyMembers = [];
  let editingMemberId = null;

  function init() {
    // Event listeners
  }

  async function loadMembers(hrmsId) {
    try {
      const result = await API.get(`/staff/${hrmsId}/family`);
      familyMembers = result.data || [];
      render();
      updateCounts();
    } catch (err) {
      Toast.error('Failed to load family members');
    }
  }

  async function addMember() {
    const name = document.getElementById('family_name').value.trim();
    const relationship = document.getElementById('family_relationship').value;

    if (!name || !relationship) {
      Toast.warning('Name and relationship are required');
      return;
    }

    const data = {
      hrms_id: window.currentStaffHrmsId,
      member_name: name,
      relationship,
      date_of_birth: document.getElementById('family_dob').value || null,
      occupation: document.getElementById('family_occupation').value || null,
      is_dependent: document.getElementById('family_dependent').value === 'Yes'
    };

    try {
      await API.post('/staff/family', data);
      Toast.success('Family member added');
      clearForm();
      await loadMembers(window.currentStaffHrmsId);
    } catch (err) {
      Toast.error('Failed to add family member');
    }
  }

  function render() {
    const tbody = document.getElementById('familyRows');
    if (familyMembers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No family members added yet</td></tr>`;
      return;
    }

    tbody.innerHTML = familyMembers.map(member => `
      <tr>
        <td>${member.member_name}</td>
        <td>${member.relationship}</td>
        <td>${DateUtils.formatDDMMYYYY(member.date_of_birth)}</td>
        <td>${DateUtils.calculateAge(member.date_of_birth)}</td>
        <td>${member.is_dependent ? 'Yes' : 'No'}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="FamilyModule.edit(${member.id})">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="FamilyModule.remove(${member.id})">Remove</button>
        </td>
      </tr>
    `).join('');
  }

  // ... more functions

  return {
    init,
    loadMembers,
    addMember,
    render,
    edit,
    remove,
    clearForm
  };
})();
```

### 2.3 Updated biodataform.html Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Divisional Portal – Staff Bio-Data Entry</title>

  <!-- CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="/div/css/division-main.css" rel="stylesheet">
  <link href="/div/css/components/toasts.css" rel="stylesheet">
  <link href="/div/css/components/modals.css" rel="stylesheet">
  <link href="/div/css/components/forms.css" rel="stylesheet">
  <link href="/div/css/pages/biodataform.css" rel="stylesheet">
</head>
<body>

  <!-- HTML ONLY - No inline styles -->
  <div class="page">
    <!-- ... clean HTML structure ... -->
  </div>

  <!-- Modals loaded from templates -->
  <div id="modal-container"></div>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="/div/js/division-auth.js"></script>
  <script src="/div/js/core/api.js"></script>
  <script src="/div/js/core/toast.js"></script>
  <script src="/div/js/core/date-utils.js"></script>
  <script src="/div/js/core/form-utils.js"></script>
  <script src="/div/js/components/staff-search.js"></script>
  <script src="/div/js/components/progress-ring.js"></script>
  <script src="/div/js/pages/biodataform/personal.js"></script>
  <script src="/div/js/pages/biodataform/family.js"></script>
  <script src="/div/js/pages/biodataform/training.js"></script>
  <script src="/div/js/pages/biodataform/promotions.js"></script>
  <script src="/div/js/pages/biodataform/detonators.js"></script>
  <script src="/div/js/pages/biodataform/discipline.js"></script>
  <script src="/div/js/pages/biodataform/transfer.js"></script>
  <script src="/div/js/pages/biodataform/draft.js"></script>
  <script src="/div/js/pages/biodataform/main.js"></script>
</body>
</html>
```

---

## Phase 3: Dashboard & Modals (Week 5)

### 3.1 Extract Inline Modals

Convert 8 inline modals in `index.html` to:
1. Separate HTML template files
2. Shared CSS in `components/modals.css`
3. Dedicated JS modules

**Modals to extract:**
- Transfer Processing Modal → `templates/modals/transfer-processing.html`
- Accept Transfer Modal → `templates/modals/transfer-accept.html`
- Reject Transfer Modal → `templates/modals/transfer-reject.html`
- Change Password Modal → `templates/modals/change-password.html`
- CLI Nominations Options Modal → `templates/modals/cli-options.html`
- Safety Category Modal → `templates/modals/category-management.html`
- Change CLI Modal → `templates/modals/cli-change.html`
- Nomination History Modal → `templates/modals/nomination-history.html`

### 3.2 Modal Loading Pattern

```javascript
// js/core/modal.js
const ModalManager = {
  cache: {},

  async load(name) {
    if (this.cache[name]) return this.cache[name];

    const res = await fetch(`/div/templates/modals/${name}.html`);
    const html = await res.text();
    this.cache[name] = html;
    return html;
  },

  async show(name, data = {}) {
    const html = await this.load(name);
    const container = document.getElementById('modal-container');
    container.innerHTML = html;

    // Populate data
    Object.entries(data).forEach(([key, value]) => {
      const el = container.querySelector(`[data-bind="${key}"]`);
      if (el) el.textContent = value;
    });

    // Show modal
    const modal = container.querySelector('.modal-overlay');
    modal.style.display = 'flex';
  },

  close() {
    const container = document.getElementById('modal-container');
    container.innerHTML = '';
  }
};
```

---

## Phase 4: Component Library (Week 6)

### 4.1 Reusable Components

#### Staff Search Autocomplete
```javascript
// js/components/staff-search.js
class StaffSearch {
  constructor(inputId, options = {}) {
    this.input = document.getElementById(inputId);
    this.onSelect = options.onSelect || (() => {});
    this.minChars = options.minChars || 2;
    this.debounceMs = options.debounceMs || 300;

    this.init();
  }

  init() {
    const wrapper = document.createElement('div');
    wrapper.className = 'search-wrapper';
    this.input.parentNode.insertBefore(wrapper, this.input);
    wrapper.appendChild(this.input);

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'search-dropdown';
    wrapper.appendChild(this.dropdown);

    this.input.addEventListener('input', this.debounce(this.search.bind(this), this.debounceMs));
  }

  async search() {
    const query = this.input.value.trim();
    if (query.length < this.minChars) {
      this.hideDropdown();
      return;
    }

    try {
      const result = await API.get(`/staff/search?q=${encodeURIComponent(query)}`);
      this.showResults(result.data || []);
    } catch (err) {
      this.showError();
    }
  }

  // ... more methods
}
```

#### Progress Ring
```javascript
// js/components/progress-ring.js
class ProgressRing {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.radius = options.radius || 20;
    this.strokeWidth = options.strokeWidth || 5;
    this.circumference = 2 * Math.PI * this.radius;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="progress-ring">
        <div class="progress-circle">
          <svg width="${(this.radius + this.strokeWidth) * 2}" height="${(this.radius + this.strokeWidth) * 2}">
            <circle class="bg" cx="${this.radius + this.strokeWidth}" cy="${this.radius + this.strokeWidth}" r="${this.radius}"></circle>
            <circle class="progress" cx="${this.radius + this.strokeWidth}" cy="${this.radius + this.strokeWidth}" r="${this.radius}"
                    stroke-dasharray="${this.circumference}" stroke-dashoffset="${this.circumference}"></circle>
          </svg>
          <span class="percentage">0%</span>
        </div>
        <div class="progress-info">
          <div class="label">Key Fields Status</div>
          <div class="filled"><span class="filled-count">0</span> of <span class="total-count">0</span> filled</div>
        </div>
      </div>
    `;
  }

  update(filled, total) {
    const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
    const offset = this.circumference - (percent / 100) * this.circumference;

    this.container.querySelector('.progress').style.strokeDashoffset = offset;
    this.container.querySelector('.percentage').textContent = `${percent}%`;
    this.container.querySelector('.filled-count').textContent = filled;
    this.container.querySelector('.total-count').textContent = total;
  }
}
```

---

## Phase 5: Build System (Optional, Week 7)

### 5.1 Simple Build with esbuild

```javascript
// build.js
const esbuild = require('esbuild');

// Bundle JS
esbuild.buildSync({
  entryPoints: ['public/div/js/pages/biodataform/main.js'],
  bundle: true,
  minify: true,
  outfile: 'public/div/dist/biodataform.bundle.js',
});

// Bundle CSS
esbuild.buildSync({
  entryPoints: ['public/div/css/pages/biodataform.css'],
  bundle: true,
  minify: true,
  outfile: 'public/div/dist/biodataform.bundle.css',
});
```

### 5.2 Alternative: No Build (Import Maps)

For browsers supporting import maps (modern browsers):

```html
<script type="importmap">
{
  "imports": {
    "@core/": "/div/js/core/",
    "@components/": "/div/js/components/",
    "@pages/": "/div/js/pages/"
  }
}
</script>

<script type="module">
  import { API } from '@core/api.js';
  import { Toast } from '@core/toast.js';
  import { FamilyModule } from '@pages/biodataform/family.js';

  // Initialize
  FamilyModule.init();
</script>
```

---

## Migration Strategy

### Approach: Incremental Migration

1. **Don't break existing functionality** - New modules wrap/enhance existing code
2. **Side-by-side operation** - Old inline code works alongside new modules
3. **Feature flag migration** - Toggle between old/new implementations

### Step-by-Step for biodataform.html

```javascript
// Step 1: Create module file with existing function
// js/pages/biodataform/family.js
const FamilyModule = {
  addMember: window.addFamilyMember,  // Reference existing function
  // ... gradually replace
};

// Step 2: Update HTML to load module
<script src="/div/js/pages/biodataform/family.js"></script>

// Step 3: Gradually move logic into module
// Step 4: Remove inline code once module is complete
```

---

## File Count Reduction

| Current | After Modularization |
|---------|---------------------|
| 1 monolithic biodataform.html (4,900 lines) | 1 clean HTML (~400 lines) + 10 JS modules (~250 lines each) + 3 CSS files |
| 8 inline modals in index.html | 8 template files + 1 modal manager |
| Duplicated toast/API code across 35 files | Shared core modules |

---

## Benefits

1. **Maintainability**: Each module is <300 lines, single responsibility
2. **Testability**: Modules can be unit tested independently
3. **Reusability**: Components used across multiple pages
4. **Performance**: Lazy-load modules, cache templates
5. **Developer Experience**: Clear file structure, easier onboarding
6. **Debugging**: Smaller files = easier to locate issues

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking changes during migration | Incremental approach, feature flags |
| Browser compatibility | Use module pattern (IIFE), not ES modules initially |
| Load time increase (more HTTP requests) | Optional bundling in Phase 5 |
| Learning curve for team | Documentation, consistent patterns |

---

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Foundation | Week 1-2 | Core JS modules, component CSS |
| Phase 2: Biodataform | Week 3-4 | Modularized biodataform.html |
| Phase 3: Dashboard | Week 5 | Extracted modals, dashboard modules |
| Phase 4: Components | Week 6 | Reusable component library |
| Phase 5: Build (Optional) | Week 7 | Bundling, minification |

---

## Quick Wins (Can Do Today)

1. **Extract toast CSS** from biodataform.html → `css/components/toasts.css`
2. **Create `api.js`** with centralized fetch wrapper
3. **Move date utilities** to `js/core/date-utils.js`
4. **Convert inline modal styles** to CSS classes

---

## Appendix: Function Inventory (biodataform.html)

<details>
<summary>Click to expand full function list</summary>

### Core/Init Functions
- `checkUserPermissions()` - Auth check
- `loadOffices()` - Load office dropdown
- `loadDesignations()` - Load designation dropdown
- `loadTrainingTypes()` - Load training types
- `loadTrainingCenters()` - Load training centers
- `init()` - Page initialization

### Form Management
- `loadStaffData(staff)` - Populate form with staff data
- `saveBiodata()` - Save form data
- `saveBiodataAndNext()` - Save and load next staff
- `clearForm()` - Reset form
- `validateRequiredFields()` - Form validation
- `updateProfileProgress()` - Update completion ring
- `startNewStaff()` - Enter create mode
- `cancelCreateMode()` - Exit create mode
- `createNewStaff()` - Save new staff

### Family Tab
- `loadFamilyMembers(hrmsId)`
- `addFamilyMember()`
- `renderFamilyMembers()`
- `editFamilyMember(member)`
- `removeFamilyMember(familyId)`
- `clearFamilyForm()`
- `calculateAge(dob)`

### Training Tab
- `loadTrainings(hrmsId)`
- `addTraining()`
- `renderTrainings(trainings)`
- `editTraining(index)`
- `removeTraining(recordId)`
- `clearTrainingForm()`
- `showTrainingHistory(trainingId, trainingName)`
- `handleTrainingTypeChange()`
- `autoCalculateDueDate()`
- `calculatePMEDueDate(pmeDate, dateOfBirth)`
- `getTrainingValidityMonths(trainingName)`
- `isTrainingLifetime(trainingName)`
- `handleMedicalResultChange()`

### Promotions Tab
- `loadPromotions(hrmsId)`
- `addPromotion()`
- `renderPromotions(promotions)`
- `editPromotion(index)`
- `removePromotion(promotionId)`
- `clearPromotionForm()`

### Detonators Tab
- `loadDetonators(hrmsId)`
- `addDetonator()`
- `renderDetonators(detonators)`
- `editDetonator(index)`
- `removeDetonator(detonatorStockId)`
- `clearDetonatorForm()`

### Discipline Tab
- `loadAwards(hrmsId)`
- `addAward()`
- `renderAwards(awards)`
- `editAward(index)`
- `removeAward(awardId)`
- `clearAwardForm()`
- `loadPunishments(hrmsId)`
- `addPunishment()`
- `renderPunishments(punishments)`
- `editPunishment(index)`
- `removePunishment(punishmentId)`
- `clearPunishmentForm()`
- `toggleDemotionField()`

### Transfer Tab
- `loadTransferHistory(staffHrmsId)`
- `renderTransferHistory(transfers)`
- `populateOfficeDropdowns(offices)`
- `loadTransferModalOffices()`

### P/Store Tab
- `loadPStoreData(staffData)`
- `updatePStoreDate()`
- `calculateNextDue()`
- `updatePStoreStatusBadge(nextDueDate)`

### Search & Autocomplete
- `showSearchDropdown(results)`
- `hideSearchDropdown()`
- `selectSearchResult(index)`
- `updateSelectedItem(items)`

### CLI Management
- `loadAllCLIs()`
- `openChangeCLIModalBiodata()`
- `submitCLIChangeBiodata()`

### Drafting
- `openDraftingModal()`
- `submitDraftingRecord()`
- `handleStaffStatusChange()`

### Draft/Auto-save
- `initFormChangeTracking()`
- `markFormAsModified()`
- `updateSaveButtonIndicator()`
- `resetFormModified()`
- `startAutoSave()`
- `saveDraftToLocalStorage()`
- `collectFormData()`
- `checkForSavedDraft(hrmsId)`
- `showDraftRestorePrompt(draft, timeAgo)`
- `restoreDraft()`
- `discardDraft()`
- `clearDraftAfterSave()`

### UI Utilities
- `showToast(message, type, duration)`
- `formatDateDDMMYYYY(dateStr)`
- `formatDateForInput(dateString)`
- `toggleViewMode()`
- `updateStatusDisplay(newStatus)`
- `openStaffReport()`
- `canEditStaff(staffOfficeCode)`
- `makeFormReadOnly()`
- `checkEditPermissions()`
- `setFormEditability()`
- `showSuccessBanner(message)`
- `updateButtonLabels()`
- `setupUppercaseConversion()`
- `checkHRMSIDDuplicate()`
- `populateDesignationSelect(selectedValue)`
- `loadStaffByHrmsId(hrmsId)`
- `addRow(host, cols)`

</details>
