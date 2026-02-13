# Broadcast - Quick Start Guide

Get up and running with Broadcast in minutes!

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Installation

```bash
# Navigate to the project directory
cd broadcast

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## First Steps

1. **Open your browser** to `http://localhost:3000`
2. **Write your post** in the main textarea
3. **Select platforms** you want to post to
4. **Add tags** (optional) by typing and pressing Enter
5. **Review previews** to see how your post will look on each platform
6. **Post or save draft** using the buttons at the bottom

## Testing Accessibility

### Keyboard Navigation Test
1. Refresh the page
2. Press `Tab` to see the skip link
3. Continue pressing `Tab` to navigate through all elements
4. Use `Space` to toggle checkboxes
5. Use `Enter` to submit the form or add tags

### Screen Reader Test (if available)
1. Enable your screen reader (VoiceOver, NVDA, JAWS, etc.)
2. Navigate through the page
3. Verify all elements are announced correctly
4. Check that form labels and errors are read properly

## Key Features to Try

### Character Counting
- Type in the textarea
- Select platforms with different character limits
- Watch the counter update in real-time
- See warnings when approaching the limit

### Tag Management
- Type a tag name in the tag input
- Press Enter, Space, or Comma to add it
- Click the × button to remove tags
- Tags automatically format with # for each platform

### Draft Saving
1. Write some content
2. Select platforms
3. Click "Save Draft"
4. Refresh the page
5. You'll be asked if you want to restore the draft

### Platform Previews
- Select multiple platforms
- See how your content + tags will appear on each
- Different platforms show different formatting

## Project Structure

```
broadcast/
├── app.vue                 # Main layout (header, footer, landmarks)
├── pages/
│   └── index.vue          # Main posting interface
├── composables/
│   └── usePlatforms.ts    # Platform utilities
├── assets/css/
│   └── main.css           # All styles (vanilla CSS)
├── server/api/
│   └── post.ts            # Example API endpoint
└── public/                # Static files
```

## Development Tips

### Hot Module Replacement
The dev server supports HMR, so changes to:
- Vue components
- CSS files
- TypeScript files

will update automatically without page refresh.

### TypeScript Support
The project uses TypeScript with strict mode enabled. Check `tsconfig.json` for configuration.

### CSS Architecture
All styles are in `assets/css/main.css` using:
- CSS custom properties (variables)
- No frameworks or preprocessors
- Mobile-first responsive design
- WCAG AA compliant colors

## Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Production
npm run build           # Build for production
npm run preview         # Preview production build

# Type Checking
npx nuxi typecheck     # Check TypeScript types
```

## Customization

### Adding New Platforms
Edit `composables/usePlatforms.ts` and add your platform:

```typescript
{
  id: 'new-platform',
  name: 'New Platform',
  charLimit: 500,
  tagFormat: 'Hashtags (#tag)',
  hashtagSymbol: '#',
  mentionSymbol: '@',
  urlShortening: false,
  supportsMarkdown: false
}
```

### Changing Colors
Edit CSS custom properties in `assets/css/main.css`:

```css
:root {
  --color-primary: #0066cc;      /* Main brand color */
  --color-primary-hover: #0052a3; /* Hover state */
  /* ... more colors ... */
}
```

### Modifying Character Limits
Update the `charLimit` value for any platform in `composables/usePlatforms.ts`.

## Next Steps

1. **Read the full README.md** for detailed documentation
2. **Check ACCESSIBILITY.md** for testing guidelines
3. **Explore the code** to understand the architecture
4. **Add API integration** to actually post to platforms
5. **Add image upload** for media attachments

## Need Help?

- Check the README.md for comprehensive documentation
- Review ACCESSIBILITY.md for accessibility testing
- Look at inline code comments for implementation details
- The app follows standard Nuxt 4 conventions

## Future Enhancements

Ready to extend the app? Consider adding:
- OAuth authentication for real platform posting
- Image upload with alt text support
- Scheduled posting
- Post history and editing
- Analytics and engagement tracking
- Multiple accounts per platform

Happy posting! 🚀
