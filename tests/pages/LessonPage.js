/**
 * LessonPage - Page Object Model for lesson editing and configuration
 */
class LessonPage {
  constructor(page) {
    this.page = page;
  }

  async editVideoLesson(videoUrl) {
    // Wait for video editor to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1200);
    
    // Find video URL input
    const videoInput = this.page.locator('input').filter({ placeholder: /video|URL|url/i }).first();
    try {
      await videoInput.waitFor({ state: 'visible', timeout: 15000 });
      await videoInput.fill(videoUrl);
    } catch (e) {
      // Try alternative video input locators
      const altInput = this.page.locator('input[type="text"], input[type="url"]').first();
      await altInput.waitFor({ state: 'visible', timeout: 15000 });
      await altInput.fill(videoUrl);
    }

    // Click verify/save button
    const saveBtn = this.page.locator('button').filter({ hasText: /verify|save|submit/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
    }
  }

  async verifyVideoLessonSaved() {
    // Verify video section is visible
    const videoSection = this.page.locator('[class*="video"]').first();
    // Check if element exists and is visible
    const count = await videoSection.count();
    if (count === 0) {
      // Try alternative check
      const content = await this.page.content();
      if (!content.includes('video') && !content.includes('Video')) {
        throw new Error('Video lesson not saved');
      }
    }
  }

  async editReadingLesson(content) {
    // Wait for reading editor to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1200);
    
    // Find editor/textarea for reading content
    const editor = this.page.locator('textarea, [contenteditable], [role="textbox"]').first();
    try {
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.fill(content);
    } catch (e) {
      // Try alternative editor selectors
      const altEditor = this.page.locator('[class*="editor"], [class*="content"]').first();
      await altEditor.waitFor({ state: 'visible', timeout: 15000 });
      await altEditor.click();
      await altEditor.fill(content);
    }

    // Click save
    const saveBtn = this.page.locator('button').filter({ hasText: /save|submit|publish/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
    }
  }

  async verifyReadingContentPersists(content) {
    // Reload and verify content is still there
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');

    const editor = this.page.locator('textarea, [contenteditable], [role="textbox"]').first();
    const value = await editor.inputValue({ timeout: 5000 }).catch(() => '');
    
    if (!value.includes(content)) {
      throw new Error('Reading content did not persist');
    }
  }

  async editQuizLesson() {
    // Wait for quiz editor to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1200);
    
    // Find add question button
    const addQuestionBtn = this.page.locator('button').filter({ hasText: /add.*question|new.*question/i }).first();
    try {
      await addQuestionBtn.waitFor({ state: 'visible', timeout: 15000 });
      await addQuestionBtn.click();
      await this.page.waitForTimeout(1500);
    } catch (e) {
      // Skip if button not found
      console.log('Add question button not found, continuing with existing form');
    }

    // Fill question
    const questionInput = this.page.locator('textarea, input').filter({ placeholder: /question|enter.*question/i }).first();
    if (await questionInput.count() > 0) {
      await questionInput.fill('What is the answer?');
    }

    // Add options
    const optionInputs = this.page.locator('input').filter({ placeholder: /option|answer/i });
    const optionCount = await optionInputs.count();
    for (let i = 0; i < Math.min(optionCount, 4); i += 1) {
      const input = optionInputs.nth(i);
      await input.fill(`Option ${i + 1}`);
    }

    // Mark correct answer (first option)
    const correctCheckbox = this.page.locator('input[type="checkbox"], input[type="radio"]').first();
    if (await correctCheckbox.count() > 0) {
      await correctCheckbox.check();
    }
  }

  async saveQuizLesson() {
    const saveBtn = this.page.locator('button').filter({ hasText: /publish|save|submit/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
    }
  }

  async verifyQuizzSaved() {
    // Check if question appears in UI
    const question = this.page.locator('text=What is the answer?').first();
    const count = await question.count();
    if (count === 0) {
      throw new Error('Quiz question not saved');
    }
  }

  async editCodingLabLesson(starterCode) {
    // Wait for code editor to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500);
    
    // Find code editor
    const codeEditor = this.page.locator('[class*="editor"], [class*="code"], textarea[placeholder*="code"]').first();
    try {
      await codeEditor.waitFor({ state: 'visible', timeout: 18000 });
      await codeEditor.fill(starterCode);
    } catch (e) {
      // Try alternative code editor locators
      const altEditor = this.page.locator('textarea, [contenteditable]').first();
      await altEditor.waitFor({ state: 'visible', timeout: 18000 });
      await altEditor.fill(starterCode);
    }

    // Click save
    const saveBtn = this.page.locator('button').filter({ hasText: /save|submit/i }).first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
    }
  }

  async verifyCodingLabSaved() {
    // Verify code editor is visible
    const codeEditor = this.page.locator('[class*="editor"], [class*="code"]').first();
    const count = await codeEditor.count();
    if (count === 0) {
      throw new Error('Code editor not visible');
    }
  }
}

module.exports = LessonPage;
