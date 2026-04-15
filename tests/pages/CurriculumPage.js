/**
 * CurriculumPage - Page Object Model for curriculum/module management
 */
class CurriculumPage {
  constructor(page) {
    this.page = page;
    this.settingsButton = page.locator('button:has-text("settings")').first();
    this.publishButton = page.locator('button:has-text("publish")').first();
    this.addModuleButton = page.locator('button, a').filter({ hasText: /Add Module|add_circle/ }).first();
    this.modulesList = page.locator('[class*="module"]');
    this.courseHierarchy = page.locator('text=Course Hierarchy').first();
  }

  async openSettings() {
    await this.settingsButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyCurriculumPageLoaded() {
    // Verify we're on edit page
    const url = this.page.url();
    if (!url.includes('/admin/courses') || !url.includes('/edit')) {
      throw new Error('Not on curriculum edit page');
    }

    // Verify curriculum map visible
    await this.courseHierarchy.waitFor({ state: 'visible', timeout: 5000 });
  }

  async addModule(moduleName = null) {
    // Click add module button - look for "Add New Module" button
    const addBtn = this.page.locator('button:has-text("Add New Module"), button:has-text("add new module"), [role="button"]:has-text("Add New Module")').first();
    await addBtn.waitFor({ state: 'visible', timeout: 8000 });
    await addBtn.click();

    // Wait for modal to open
    await this.page.waitForTimeout(1500);

    // If moduleName provided, fill input
    if (moduleName) {
      const moduleNameInput = this.page.locator('input[type="text"]').first();
      await moduleNameInput.waitFor({ state: 'visible', timeout: 5000 });
      await moduleNameInput.clear();
      await moduleNameInput.fill(moduleName);
    }

    // Click the Add module button in the dialog
    const confirmButton = this.page.locator('button:has-text("Add module")').first();
    await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
    await confirmButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2500);
  }

  async verifyModuleExists(moduleName) {
    // Wait for module to appear in sidebar
    try {
      const module = this.page.locator('text=' + moduleName).first();
      await module.waitFor({ state: 'visible', timeout: 12000 });
    } catch (e) {
      // Try alternative selector
      const altModule = this.page.locator('li, div, [class*="module"]').filter({ hasText: moduleName }).first();
      await altModule.waitFor({ state: 'visible', timeout: 12000 });
    }
  }

  async addLesson(moduleName, lessonName, lessonType = 'Video') {
    console.log(`[addLesson] Starting - module="${moduleName}", lesson="${lessonName}", type="${lessonType}"`);
    
    // Wait for page to stabilize
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(800);

    // Ensure module details are expanded so lesson actions are visible
    const expandAllBtn = this.page.locator('button, [role="button"]').filter({ hasText: /Expand All|EXPAND ALL/i }).first();
    if (await expandAllBtn.count() > 0) {
      console.log('[addLesson] Found Expand All button, clicking');
      await expandAllBtn.click();
      await this.page.waitForTimeout(800);
    } else {
      console.log('[addLesson] No Expand All button found');
    }

    // Find the module row
    let moduleRow = this.page.locator('li, div').filter({ hasText: moduleName }).nth(0);
    let rowVisible = false;
    try {
      await moduleRow.waitFor({ state: 'visible', timeout: 5000 });
      rowVisible = true;
      console.log(`[addLesson] Module row "${moduleName}" found`);
    } catch (e) {
      console.log(`[addLesson] Module row not found with first selector: ${e.message}`);
    }

    if (!rowVisible) {
      // Try a broader selector
      moduleRow = this.page.locator('text=' + moduleName).first();
      try {
        await moduleRow.waitFor({ state: 'visible', timeout: 5000 });
        rowVisible = true;
        console.log(`[addLesson] Module row found with text selector`);
      } catch (e) {
        console.error(`[addLesson] ERROR: Module "${moduleName}" not found after 5s`);
        throw new Error(`Module "${moduleName}" not found after 5s`);
      }
    }

    await moduleRow.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);

    // Try to find "Add Lesson" button via multiple strategies
    let addLessonBtn = null;
    let buttonCount = 0;
    
    // Strategy 1: Search for text-based button inside module area
    console.log('[addLesson] Strategy 1: Searching for text-based "Add Lesson" button');
    let candidates = moduleRow.locator('button, [role="button"], a').filter({ hasText: /Add Lesson|Add lesson|add.*lesson|Lesson/i });
    buttonCount = await candidates.count();
    console.log(`[addLesson] Strategy 1 found ${buttonCount} candidate buttons`);
    if (buttonCount > 0) {
      addLessonBtn = candidates.first();
      console.log('[addLesson] Selected button from Strategy 1');
    }

    // Strategy 2: Search for aria-label or title with "lesson"
    if (!addLessonBtn || await addLessonBtn.count() === 0) {
      console.log('[addLesson] Strategy 2: Searching for aria-label/title with "lesson"');
      candidates = moduleRow.locator('[aria-label*="lesson" i], [title*="lesson" i]');
      buttonCount = await candidates.count();
      console.log(`[addLesson] Strategy 2 found ${buttonCount} candidates`);
      if (buttonCount > 0) {
        addLessonBtn = candidates.first();
        console.log('[addLesson] Selected button from Strategy 2');
      }
    }

    // Strategy 3: Look for "+" icon button
    if (!addLessonBtn || await addLessonBtn.count() === 0) {
      console.log('[addLesson] Strategy 3: Searching for "+" icon button');
      candidates = moduleRow.locator('button, [role="button"]').filter({ hasText: /\+/ });
      buttonCount = await candidates.count();
      console.log(`[addLesson] Strategy 3 found ${buttonCount} candidates`);
      if (buttonCount > 0) {
        addLessonBtn = candidates.first();
        console.log('[addLesson] Selected button from Strategy 3');
      }
    }

    // Strategy 4: Fallback to entire page search
    if (!addLessonBtn || await addLessonBtn.count() === 0) {
      console.log('[addLesson] Strategy 4: Fallback - searching entire page for "Add Lesson"');
      candidates = this.page.locator('button, [role="button"], a').filter({ hasText: /Add Lesson|Add lesson|add.*lesson/ });
      buttonCount = await candidates.count();
      console.log(`[addLesson] Strategy 4 found ${buttonCount} candidates`);
      if (buttonCount > 0) {
        addLessonBtn = candidates.first();
        console.log('[addLesson] Selected button from Strategy 4');
      }
    }

    if (!addLessonBtn || await addLessonBtn.count() === 0) {
      console.error(`[addLesson] ERROR: "Add Lesson" button not found for module "${moduleName}"`);
      throw new Error(`"Add Lesson" button not found for module "${moduleName}"`);
    }

    try {
      console.log('[addLesson] Waiting for Add Lesson button to be visible');
      await addLessonBtn.waitFor({ state: 'visible', timeout: 5000 });
      console.log('[addLesson] Add Lesson button is visible, clicking');
      await addLessonBtn.click();
      console.log('[addLesson] Add Lesson button clicked successfully');
    } catch (e) {
      console.error(`[addLesson] ERROR: Failed to click "Add Lesson" button: ${e.message}`);
      throw new Error(`Failed to click "Add Lesson" button: ${e.message}`);
    }

    // Wait for lesson dialog/form
    await this.page.waitForTimeout(1000);
    console.log('[addLesson] Waiting for lesson dialog to open');

    // Fill lesson name
    const lessonNameInput = this.page.locator('input').filter({ placeholder: /lesson.*name|name/i }).first();
    if (await lessonNameInput.count() > 0) {
      try {
        await lessonNameInput.waitFor({ state: 'visible', timeout: 3000 });
        await lessonNameInput.fill(lessonName);
        console.log(`[addLesson] Lesson name filled: "${lessonName}"`);
      } catch (e) {
        console.log(`[addLesson] Warning: Lesson name input not filled: ${e.message}`);
      }
    } else {
      console.log('[addLesson] Warning: Lesson name input not found');
    }

    // Select lesson type
    const lessonTypeSelect = this.page.locator('select, button').filter({ hasText: new RegExp(lessonType, 'i') }).first();
    if (await lessonTypeSelect.count() > 0) {
      try {
        await lessonTypeSelect.waitFor({ state: 'visible', timeout: 3000 });
        const tagName = await lessonTypeSelect.evaluate((el) => el.tagName).catch(() => 'BUTTON');
        if (tagName === 'SELECT') {
          await lessonTypeSelect.selectOption({ label: lessonType });
        } else {
          await lessonTypeSelect.click();
        }
        console.log(`[addLesson] Lesson type selected: "${lessonType}"`);
      } catch (e) {
        console.log(`[addLesson] Warning: Lesson type not selected: ${e.message}`);
      }
    } else {
      console.log('[addLesson] Warning: Lesson type selector not found');
    }

    // Click create/save button for the lesson
    const createBtn = this.page.locator('button, [role="button"]').filter({ hasText: /Add Lesson|Create Lesson|Save Lesson|Create|Save|Submit/i }).first();
    if (await createBtn.count() > 0) {
      try {
        console.log('[addLesson] Waiting for create/save button');
        await createBtn.waitFor({ state: 'visible', timeout: 3000 });
        console.log('[addLesson] Create/save button is visible, clicking');
        await createBtn.click();
        console.log('[addLesson] Create/save button clicked');
        
        // Wait for page to respond to the action
        console.log('[addLesson] Waiting for page to load after save');
        try {
          await this.page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch (e) {
          console.log('[addLesson] Network idle wait timed out, continuing...');
        }
        
        // Additional wait to ensure UI updates
        await this.page.waitForTimeout(3000);
        console.log('[addLesson] Lesson creation completed');
      } catch (e) {
        console.log(`[addLesson] Warning: Failed to click create/save button: ${e.message}`);
      }
    } else {
      console.log('[addLesson] Warning: Create/save button not found');
    }
  }

  async verifyLessonExists(moduleName, lessonName) {
    console.log(`[verifyLessonExists] Looking for lesson "${lessonName}" (module: "${moduleName}")`);
    
    // Strategy 1: Try exact text match
    let lesson = this.page.locator('text=' + lessonName).first();
    try {
      console.log('[verifyLessonExists] Strategy 1: Trying exact text match');
      await lesson.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`[verifyLessonExists] Found lesson with Strategy 1`);
      return;
    } catch (e) {
      console.log(`[verifyLessonExists] Strategy 1 failed: ${e.message}`);
    }

    // Strategy 2: Try filter by hasText
    try {
      console.log('[verifyLessonExists] Strategy 2: Trying filter by hasText');
      const altLesson = this.page.locator('li, div, [class*="lesson"]').filter({ hasText: lessonName }).first();
      await altLesson.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`[verifyLessonExists] Found lesson with Strategy 2`);
      return;
    } catch (e) {
      console.log(`[verifyLessonExists] Strategy 2 failed: ${e.message}`);
    }

    // Strategy 3: Try text locator with partial match
    try {
      console.log('[verifyLessonExists] Strategy 3: Trying partial text match');
      const partialLesson = this.page.locator(`text="${lessonName}"`).first();
      await partialLesson.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`[verifyLessonExists] Found lesson with Strategy 3`);
      return;
    } catch (e) {
      console.log(`[verifyLessonExists] Strategy 3 failed: ${e.message}`);
    }

    // If all strategies failed
    console.error(`[verifyLessonExists] ERROR: Lesson "${lessonName}" not found after all strategies`);
    throw new Error(`Lesson "${lessonName}" not found after all strategies`);
  }

  async editLesson(lessonName) {
    const lesson = this.page.locator('text=' + lessonName).first();
    await lesson.click();
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = CurriculumPage;
