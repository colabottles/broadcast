# Accessibility Testing Guide for Broadcast

This document outlines how to test the accessibility features of Broadcast to ensure WCAG 2.2 Level AA compliance.

## Quick Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible on all focusable elements
- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] All images have alt text (when images are added)
- [ ] Form inputs have associated labels
- [ ] Error messages are clear and actionable
- [ ] Page structure uses proper HTML5 landmarks
- [ ] Heading hierarchy is logical (h1 → h2 → h3, no skipping)
- [ ] ARIA attributes are used correctly and sparingly
- [ ] Content is still usable at 200% zoom
- [ ] No keyboard traps exist
- [ ] Time limits can be extended or disabled (if added)
- [ ] Animations can be paused or disabled (if added)

## Keyboard Navigation Testing

### Tab Order Test
1. Start at the top of the page
2. Press `Tab` repeatedly
3. Verify focus moves in a logical order:
   - Skip link
   - Post content textarea
   - Platform checkboxes (in order)
   - Tag input
   - Tag remove buttons (if tags exist)
   - Post button
   - Save Draft button
   - Clear button

### Skip Link Test
1. Refresh the page
2. Press `Tab` once
3. Verify "Skip to main content" link appears
4. Press `Enter`
5. Verify focus jumps to main content area

### Form Interaction Test
Using only keyboard:
1. `Tab` to textarea → type content
2. `Tab` to platform checkboxes → `Space` to toggle
3. `Tab` to tag input → type tag → `Enter` to add
4. `Tab` to tag remove button → `Enter` to remove
5. `Tab` to Submit button → `Enter` to submit

All actions should work without a mouse.

### Keyboard Shortcuts
- `Tab`: Move focus forward
- `Shift + Tab`: Move focus backward
- `Space`: Toggle checkboxes, activate buttons
- `Enter`: Activate buttons, submit forms, add tags
- `Escape`: Should close modals (when added)

## Screen Reader Testing

### NVDA (Windows - Free)
1. Download from https://www.nvaccess.org/
2. Install and start NVDA
3. Navigate to Broadcast
4. Use arrow keys to read content
5. Use `Tab` to navigate interactive elements
6. Verify all content is announced properly

### JAWS (Windows - Commercial)
1. Start JAWS
2. Navigate to Broadcast
3. Use `Insert + F7` to view elements list
4. Verify all landmarks, headings, and forms are listed

### VoiceOver (macOS/iOS - Built-in)
**macOS:**
1. Press `Cmd + F5` to enable VoiceOver
2. Use `Control + Option + Arrow Keys` to navigate
3. Use `Control + Option + Space` to activate elements

**iOS:**
1. Settings → Accessibility → VoiceOver
2. Enable VoiceOver
3. Swipe to navigate
4. Double-tap to activate

### What to Listen For
- Page title is announced
- Landmarks are identified (banner, main, contentinfo)
- Form labels are read with inputs
- Button purposes are clear
- Character counter updates are announced
- Error messages are announced
- Loading states are communicated

## Visual Testing

### Color Contrast
Use a tool like WebAIM's Contrast Checker:
- Text on background: Minimum 4.5:1
- Large text (18pt+): Minimum 3:1
- UI components: Minimum 3:1

**Test These Combinations:**
- Body text on white background
- Buttons (all states: default, hover, focus, disabled)
- Form inputs and borders
- Error/success messages
- Character counter in warning/danger states

### Focus Indicators
1. Tab through the page
2. Verify each focused element has:
   - Visible outline (3px solid)
   - Sufficient contrast against background
   - 2px offset from element

### Zoom and Reflow
1. Zoom browser to 200% (Ctrl/Cmd + +)
2. Verify:
   - All content is visible
   - No horizontal scrolling required
   - Text doesn't overlap
   - Buttons are still usable

### Responsive Design
Test at these viewport widths:
- 320px (small mobile)
- 375px (medium mobile)
- 768px (tablet)
- 1024px (desktop)
- 1920px (large desktop)

## Automated Testing Tools

### axe DevTools (Browser Extension)
1. Install from Chrome/Firefox/Edge store
2. Open DevTools → axe tab
3. Click "Scan ALL of my page"
4. Review any violations
5. Target: 0 violations

### Lighthouse (Chrome DevTools)
1. Open Chrome DevTools
2. Navigate to Lighthouse tab
3. Select "Accessibility" category
4. Click "Generate report"
5. Target: 100 score

### WAVE (Browser Extension)
1. Install WAVE extension
2. Click WAVE icon
3. Review:
   - Errors (should be 0)
   - Alerts (review each)
   - Features (verify correct usage)
   - Structural elements
   - ARIA usage

## Manual Testing Scenarios

### Scenario 1: Create a Post
**As a keyboard-only user:**
1. Navigate to the page
2. Use skip link to jump to main content
3. Enter post content
4. Select 2-3 platforms using keyboard
5. Add 3 tags using Enter key
6. Review platform previews
7. Submit the post
8. Verify success message is announced

### Scenario 2: Handle Validation Errors
**As a screen reader user:**
1. Navigate to form
2. Try to submit empty form
3. Verify error messages are announced
4. Verify errors are associated with fields
5. Fix errors and resubmit
6. Verify success is announced

### Scenario 3: Manage Tags
**As a keyboard-only user:**
1. Navigate to tag input
2. Add several tags with different methods (Enter, Space, Comma)
3. Navigate to tag remove buttons
4. Remove tags using Enter key
5. Verify all tags can be removed

### Scenario 4: Character Limit Warning
**As a screen reader user:**
1. Select platforms with different limits
2. Type content approaching limit
3. Verify warning is announced when reaching 90%
4. Continue typing past limit
5. Verify error is announced
6. Verify submit button is disabled

## ARIA Usage Validation

### Required ARIA Attributes
Verify these are present and correct:

**Form Elements:**
- `aria-required="true"` on required fields
- `aria-describedby` linking to help text
- `aria-invalid` on fields with errors
- `aria-labelledby` where appropriate

**Dynamic Content:**
- `aria-live="polite"` on character counter
- `role="status"` on status messages
- `role="alert"` on error messages

**Navigation:**
- `role="banner"` on header (if not using `<header>`)
- `role="main"` on main content (if not using `<main>`)
- `role="contentinfo"` on footer (if not using `<footer>`)

### ARIA Best Practices
- ✅ Use native HTML elements first
- ✅ Only add ARIA when HTML isn't sufficient
- ✅ Never override native semantics
- ✅ Test with actual screen readers

## Common Issues to Watch For

### Focus Management
- ❌ Focus trapped in modals without escape
- ❌ Focus lost after dynamic content changes
- ❌ Invisible focus indicators
- ❌ Illogical tab order

### Screen Reader Issues
- ❌ Empty links or buttons
- ❌ Images without alt text
- ❌ Form inputs without labels
- ❌ Redundant ARIA labels
- ❌ Incorrect heading levels

### Keyboard Issues
- ❌ Elements not keyboard accessible
- ❌ No way to close modals with keyboard
- ❌ Submit button not keyboard accessible
- ❌ Custom controls don't work with keyboard

## Reporting Issues

When reporting accessibility issues, include:
1. **Issue type**: Keyboard, screen reader, visual, etc.
2. **WCAG criterion**: Which success criterion is violated
3. **Steps to reproduce**: Exact steps to encounter the issue
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Environment**: Browser, OS, assistive technology used
7. **Screenshots/video**: If applicable

## Resources

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA](https://www.nvaccess.org/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Guidelines
- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Screen Readers
- [NVDA](https://www.nvaccess.org/) - Free (Windows)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Commercial (Windows)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) - Built-in (macOS/iOS)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) - Built-in (Android)
