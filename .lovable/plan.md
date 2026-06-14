## Remove X, Facebook and YouTube social links

### Goal
Remove the X (Twitter), Facebook, and YouTube social links from the site while keeping Instagram, LinkedIn, and TikTok.

### Changes
1. **src/lib/site.tsx**
   - Remove the three entries from `SOCIAL_LINKS`: X (Twitter), Facebook, YouTube.
   - Remove unused imports: `Facebook`, `Youtube` from `lucide-react`, and the `XIcon` custom component.

### Impact
Both `site-footer.tsx` and `contact.tsx` consume `SOCIAL_LINKS`, so this single source change removes the links everywhere they appear. No other files need editing.