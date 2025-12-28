# RepoComPass - Setup Flow Testing Guide

This document provides comprehensive testing instructions for the new onboarding setup flow.

## Overview

The setup flow implements a first-time user onboarding experience with:
- 5-step guided setup process
- Player name configuration
- API key validation with real-time testing
- Initial skill point allocation
- Data persistence and automatic routing

## Features Implemented

### 1. First Launch Detection
- **Location**: `popup/popup.js` lines 192-210
- **Behavior**: Checks `setupCompleted` flag in chrome.storage.local
- **Flow**: First launch → redirect to setup page; Returning users → normal popup

### 2. Setup Page Flow
- **Location**: `setup/setup.html`, `setup/setup.js`, `setup/setup.css`
- **Pages**:
  1. **Welcome** - Introduction and feature overview
  2. **Player Name** - Required field with validation (3-16 chars, alphanumeric + underscore + space)
  3. **API Keys** - Required OpenAI key with live validation via API call
  4. **Stats Allocation** - 10 skill points to distribute across 9 categories
  5. **Completion** - Summary display and automatic redirect

### 3. Validation & Error Handling

#### Player Name Validation
- **Required**: Yes
- **Min length**: 3 characters
- **Max length**: 16 characters
- **Allowed chars**: A-Z, 0-9, underscore, space
- **Auto-format**: Converts to uppercase
- **Errors**:
  - Empty field: "Player name is required!"
  - Too short: "Player name must be at least 3 characters long"
  - Invalid chars: "Only letters, numbers, underscores, and spaces allowed"

#### API Key Validation
- **Required**: Yes
- **Format check**: Must start with "sk-"
- **Live validation**: Makes actual API call to OpenAI /models endpoint
- **Errors**:
  - Empty field: "OpenAI API key is required to continue"
  - Invalid format: "Invalid API key format. OpenAI keys start with 'sk-'"
  - API failure: Shows specific error from OpenAI (401, 429, etc.)
  - Network error: "Unable to validate API key. Check your internet connection and try again."
- **Success**: Shows green checkmark and success message
- **Caching**: Once validated in session, skips re-validation on back/forward navigation

#### Stats Allocation Validation
- **Optional**: User can skip (confirmation prompt shown)
- **Points**: 10 points to distribute
- **Range**: 0-10 per skill
- **UI**:
  - Disabled minus button at 0
  - Disabled plus buttons when no points remaining or at max (10)
  - Real-time points remaining counter
  - Error message if trying to exceed limit

### 4. Progress Tracking
- Visual progress bar with 5 steps
- Active step highlighted with glow animation
- Completed steps marked with checkmark
- Smooth page transitions with slide animations

### 5. Data Persistence
- **Storage Location**: `chrome.storage.local`
- **Keys**:
  - `setupCompleted`: boolean flag
  - `playerStats`: { name, skills, savedIdeas }
  - `settings`: { openaiKey, enableCache, autoAnalyze, enableSounds, enableCrt }

### 6. Animations
- Page transitions: Slide left/right with cubic-bezier easing
- Logo bounce on welcome page
- Floating icons
- Success pop animation on completion
- Loading bar with gradient shift
- Blinking elements
- Retro CRT scanlines and overlay

## Testing Checklist

### Pre-Testing Setup
1. Clear extension storage:
   ```javascript
   chrome.storage.local.clear()
   ```
2. Reload extension
3. Click extension icon

### Test Case 1: First Launch
**Expected**: Redirects to setup page automatically

- [ ] Setup page opens (not main popup)
- [ ] Progress bar shows step 1 active
- [ ] Welcome animation plays
- [ ] Feature list displays correctly
- [ ] "BEGIN" button visible and enabled
- [ ] "BACK" button disabled

### Test Case 2: Player Name Validation

#### Valid Inputs
- [ ] "HERO_DEV" → Accepted
- [ ] "JOHN" → Accepted
- [ ] "PLAYER_123" → Accepted
- [ ] "CODE NINJA" → Accepted (with space)

#### Invalid Inputs
- [ ] "" (empty) → Error: "Player name is required!"
- [ ] "AB" → Error: "Player name must be at least 3 characters long"
- [ ] "player@123" → Auto-removes @ symbol, shows error if invalid chars remain
- [ ] "THISISAVERYLONGNAME123" → Auto-truncated to 16 chars

#### UI Behavior
- [ ] Name preview updates in real-time
- [ ] Input converts to uppercase automatically
- [ ] Error message appears below input
- [ ] Input border turns red on error
- [ ] Error clears when user starts typing
- [ ] Cannot proceed to next page with invalid name

### Test Case 3: API Key Validation

#### Format Validation
- [ ] "" (empty) → Error: "OpenAI API key is required to continue"
- [ ] "invalid-key" → Error: "Invalid API key format..."
- [ ] "sk-" (just prefix) → Passes format check, fails API validation

#### API Validation
- [ ] Valid key → Green success message appears
- [ ] Invalid key → Error with OpenAI error message
- [ ] Network disconnected → Network error message
- [ ] Button shows "VALIDATING..." during check
- [ ] Button disabled during validation
- [ ] Spinner appears during validation

#### Edge Cases
- [ ] Back button works after successful validation
- [ ] Forward → back → forward doesn't re-validate (cached)
- [ ] Editing key after validation clears success/error messages
- [ ] Toggle visibility button works (eye icon)

### Test Case 4: Stats Allocation

#### Point Distribution
- [ ] All skills start at 0
- [ ] Points remaining shows 10
- [ ] Clicking + on any skill increments it
- [ ] Clicking - on any skill decrements it
- [ ] Cannot go below 0 (minus button disabled)
- [ ] Cannot exceed 10 per skill (plus button disabled)
- [ ] Cannot exceed 10 total points (all plus buttons disabled)
- [ ] Points remaining counter updates correctly

#### UI Feedback
- [ ] Level-up sound plays when incrementing
- [ ] Level-down sound plays when decrementing
- [ ] Skill value displays correctly
- [ ] Error message if trying to exceed points
- [ ] Scrollbar appears if content overflows

#### Skip Scenario
- [ ] Clicking NEXT with 0 points shows confirmation dialog
- [ ] Can cancel and return to allocation
- [ ] Can confirm and proceed

### Test Case 5: Completion & Redirect

#### Summary Display
- [ ] Player name displays correctly
- [ ] Power level shows total allocated points
- [ ] API status shows "CONFIGURED ✓"

#### Animations
- [ ] Success icon pops with rotation
- [ ] Loading bar fills from 0-100%
- [ ] Gradient shifts during loading
- [ ] "Entering the dungeon..." text blinks

#### Redirect
- [ ] After 3 seconds, redirects to popup/popup.html
- [ ] Main popup loads successfully
- [ ] Player name appears in player bar
- [ ] Skill levels match allocated points
- [ ] API key saved (check in Config tab)

### Test Case 6: Data Persistence

After completing setup, check chrome.storage.local:
```javascript
chrome.storage.local.get(null, (data) => console.log(data))
```

- [ ] `setupCompleted: true` exists
- [ ] `playerStats.name` matches entered name
- [ ] `playerStats.skills` has correct values
- [ ] `settings.openaiKey` is saved
- [ ] Default settings are set correctly

### Test Case 7: Returning User

After setup is complete:
1. Close popup
2. Click extension icon again

**Expected**:
- [ ] Main popup opens (not setup)
- [ ] No redirect to setup
- [ ] Player data loads correctly

### Test Case 8: Navigation

#### Forward Navigation
- [ ] Step 1 → 2: "BEGIN" changes to "NEXT"
- [ ] Step 2 → 3: Validates before proceeding
- [ ] Step 3 → 4: Validates API key before proceeding
- [ ] Step 4 → 5: "NEXT" changes to "START"
- [ ] Step 5: Triggers completion

#### Backward Navigation
- [ ] BACK button disabled on step 1
- [ ] BACK button enabled on steps 2-5
- [ ] Going back preserves entered data
- [ ] Going back doesn't re-validate
- [ ] Progress bar updates correctly

### Test Case 9: Error Recovery

#### API Key Errors
- [ ] Network timeout → User can retry by clicking NEXT again
- [ ] Invalid key → User can edit and resubmit
- [ ] Rate limit → Error message shows, user can wait and retry

#### Browser Issues
- [ ] Page refresh during setup → Loses progress (expected)
- [ ] Extension reload → Clears setupCompleted flag
- [ ] Closing popup mid-setup → Can restart from beginning

### Test Case 10: Accessibility & UX

#### Keyboard Navigation
- [ ] Tab key navigates through inputs
- [ ] Enter key in input fields submits (tries to go next)
- [ ] Focus indicators visible

#### Visual Feedback
- [ ] CRT effect visible
- [ ] Scanlines animate
- [ ] Buttons have hover states
- [ ] Active elements highlighted
- [ ] Progress bar animates smoothly

#### Sound Effects
- [ ] Page forward sound plays
- [ ] Page back sound plays
- [ ] Error sound on validation failure
- [ ] Success sound on API validation
- [ ] Level up/down sounds on stats

## Common Issues & Solutions

### Issue: Redirect Loop
**Symptom**: Setup page keeps reloading
**Solution**: Check if setupCompleted is being saved correctly

### Issue: API Validation Fails
**Symptom**: Valid key shows error
**Solution**:
1. Check network connectivity
2. Verify OpenAI API status
3. Check browser console for specific error

### Issue: Data Not Persisting
**Symptom**: Setup data lost after completion
**Solution**: Check chrome.storage.local permissions in manifest

### Issue: Popup Doesn't Redirect
**Symptom**: Setup page doesn't redirect after completion
**Solution**:
1. Check browser console for errors
2. Verify window.location.href path is correct
3. Ensure 3-second delay completes

## Manual Testing Commands

### Reset Setup (for re-testing)
```javascript
chrome.storage.local.set({ setupCompleted: false })
```

### Clear All Data
```javascript
chrome.storage.local.clear()
```

### Check Storage
```javascript
chrome.storage.local.get(null, (data) => console.log(data))
```

### Force Open Setup
Navigate to: `chrome-extension://[YOUR_EXTENSION_ID]/setup/setup.html`

## Files Modified/Created

### New Files
- `setup/setup.html` - Multi-step setup page structure
- `setup/setup.js` - Setup logic with validation
- `setup/setup.css` - Retro arcade styling with animations
- `SETUP_TESTING.md` - This testing guide

### Modified Files
- `popup/popup.js` - Added first-launch detection (lines 192-210)
- `manifest.json` - No changes needed (setup page is extension-internal)

## Success Criteria

The setup flow is considered successful when:
1. ✅ First-time users see setup before main popup
2. ✅ All validation works correctly with proper error messages
3. ✅ API key is tested against real OpenAI API
4. ✅ Data persists correctly after completion
5. ✅ Returning users skip setup and go directly to popup
6. ✅ Animations and transitions work smoothly
7. ✅ Error recovery paths work for all scenarios
8. ✅ Setup cannot be bypassed with invalid data

## Next Steps

After successful testing:
1. Test on different screen sizes (responsive design)
2. Test on different browsers (Chrome, Edge, Brave)
3. Add analytics/telemetry for setup completion rate
4. Consider adding a "Skip setup" option for advanced users (with warnings)
5. Add ability to re-run setup from Config tab
