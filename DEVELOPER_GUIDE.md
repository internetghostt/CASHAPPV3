# Cash App Clone - Developer Guide

This guide provides comprehensive instructions for developers working on the Cash App Clone project.

## Project Structure

```
├── backend/                 # PHP API backend
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── transactions/   # Transaction endpoints
│   │   ├── admin/          # Admin management endpoints
│   │   ├── helpers/        # Utility functions
│   │   └── middleware/     # Authentication middleware
├── frontend/               # Next.js frontend
│   └── src/
│       ├── app/           # Next.js app router pages
│       ├── context/       # React context providers
│       └── lib/           # API utilities
├── database/              # Database schema
└── DEVELOPER_GUIDE.md     # This file
```

## Backend Development

### Adding New API Endpoints

1. **Create endpoint file** in appropriate directory under `backend/api/`
2. **Include required helpers:**
   ```php
   require_once __DIR__ . '/../helpers/config.php';
   require_once __DIR__ . '/../helpers/db.php';
   require_once __DIR__ . '/../middleware/auth.php'; // if auth required
   ```
3. **Follow standard response format:**
   ```php
   send_json(200, ['data' => $result]);
   ```

### Database Schema Changes

1. **Update** `database/schema.sql` with new columns/tables
2. **Test locally** by reimporting the schema
3. **Update affected API endpoints** to handle new fields
4. **Update frontend types** to match new schema

### Authentication & Authorization

- **Public endpoints:** No auth required
- **User endpoints:** Use `require_auth(false)`
- **Admin endpoints:** Use `require_auth(true)`
- **Frozen account checks:** Use `ensure_not_frozen($user)` for sensitive operations

### Configuration

Edit `backend/api/helpers/config.php`:
- **Database credentials:** `$DB_HOST`, `$DB_NAME`, `$DB_USER`, `$DB_PASS`
- **JWT settings:** `$JWT_SECRET`, `$JWT_ISSUER`, `$JWT_TTL_SECONDS`
- **Environment:** Set `$APP_ENV = 'development'` for debugging

## Frontend Development

### Adding New Pages

1. **Create page file** in `frontend/src/app/[route]/page.tsx`
2. **Use authentication context:**
   ```tsx
   const { user, token, isReady } = useAuth();
   ```
3. **Handle frozen accounts:**
   ```tsx
   const isFrozen = !!user?.is_frozen;
   if (isFrozen) {
     // Show frozen message or disable features
   }
   ```

### API Integration

Edit `frontend/src/lib/api.ts`:
- **API base URL:** Update `API_BASE` constant
- **Add new API functions** following existing patterns:
  ```tsx
  export async function apiDelete<TResponse>(path: string): Promise<TResponse> {
    const res = await fetch(`${API_BASE}${path}`, { 
      method: "DELETE", 
      headers: buildHeaders() 
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  ```

### User Context & Types

Update `frontend/src/context/AuthContext.tsx`:
- **Add new user fields** to the `User` type
- **Update API calls** to handle new fields
- **Maintain type safety** throughout the application

### Color Scheme & Design

The app uses a **black, white, and gray** color scheme. Edit `frontend/src/app/globals.css`:

**Color Variables:**
```css
:root {
  --background: #ffffff;     /* pure white */
  --foreground: #000000;     /* pure black text */
  --primary: #000000;        /* black primary */
  --accent: #666666;         /* medium gray accent */
  --border: #e5e5e5;         /* light gray borders */
  --card: #ffffff;           /* white cards */
  --muted: #f8f9fa;          /* very light gray */
}
```

**Component Classes:**
- `.button-primary` - Black background, white text
- `.button-secondary` - Gray background, black text
- `.card` - White background with gray border
- `.input` - White background with gray border, black focus ring

**Design Principles:**
- Use black for primary actions and emphasis
- Use gray shades for secondary elements and text
- Maintain high contrast for accessibility
- Keep backgrounds white for clean appearance

### Navigation & Routing

- **Bottom navigation:** Edit navigation section in `frontend/src/app/page.tsx`
- **Protected routes:** Add authentication checks in page components
- **Admin routes:** Check `user?.is_admin` for admin-only pages

## Database Management

### User Fields

**Core Fields:**
- `id`, `name`, `email`, `phone`, `password`
- `balance`, `account_number`

**Profile Fields:**
- `date_of_birth` (DATE) - Set during registration, read-only in settings
- `occupation` (VARCHAR) - Set during registration, read-only in settings

**Contract Fields:**
- `contract_start_date` (DATE) - Editable in settings
- `contract_expiry_date` (DATE) - Editable in settings

**Verification Fields:**
- `kyc_verified` (TINYINT) - Toggle in settings, admin can modify
- `bank_verified` (TINYINT) - Admin controlled, display only

**System Fields:**
- `is_admin` (TINYINT) - Admin privileges
- `is_frozen` (TINYINT) - Account freeze status
- `created_at`, `updated_at` (DATETIME) - Timestamps

### Transaction System

**Transaction Flow:**
1. Validate sender has sufficient balance
2. Lock user rows with `FOR UPDATE`
3. Update both user balances
4. Insert transaction record
5. Commit transaction

**Security Considerations:**
- Always use database transactions for money transfers
- Implement proper row locking to prevent race conditions
- Validate recipient exists and is not frozen

## Admin Dashboard Features

### User Management

**List Users:**
- View all users with pagination (500 limit)
- Display verification status and account status
- Show user details including occupation and verification

**Create Users:**
- Full user creation with all fields
- Set initial balance and admin privileges
- Configure verification status

**Edit Users:**
- Modify any user field except password
- Update verification status
- Change admin privileges

**Account Control:**
- Freeze/unfreeze accounts
- Delete users (with confirmation)
- View user transaction history

### Access Control

- **Admin check:** Verify `user?.is_admin` on frontend
- **Backend validation:** Use `require_auth(true)` for admin endpoints
- **Route protection:** Redirect non-admins away from admin pages

## UI/UX Guidelines

### Color Usage

**Primary Actions:**
- Use black (`#000000`) for main buttons and important elements
- Use white text on black backgrounds

**Secondary Elements:**
- Use gray shades (`#666666`, `#999999`) for secondary text
- Use light gray (`#f8f9fa`) for disabled states

**Status Indicators:**
- Use black for positive status (verified, active)
- Use gray for neutral/inactive status
- Maintain consistency across all components

### Component Styling

**Cards:**
- White background with subtle gray border
- Rounded corners (rounded-2xl)
- Minimal shadow for depth

**Forms:**
- Clean input fields with gray borders
- Black focus rings for accessibility
- Consistent spacing and typography

**Navigation:**
- Bottom navigation with gray icons
- Clear visual hierarchy
- Disabled states for frozen accounts

## Security Best Practices

### Authentication
- **JWT tokens:** Stored in localStorage, included in Authorization header
- **Token validation:** Check expiry and signature on every request
- **Password security:** Use PHP's `password_hash()` and `password_verify()`

### Account Security
- **Frozen accounts:** Block sensitive operations but allow viewing
- **Admin privileges:** Separate admin endpoints with proper validation
- **Input validation:** Sanitize and validate all user inputs

### Database Security
- **Prepared statements:** Always use parameterized queries
- **Foreign keys:** Maintain referential integrity
- **Transaction safety:** Use database transactions for critical operations

## Deployment

### Backend (PHP Hosting)
1. **Upload** `backend/` folder to web hosting
2. **Configure** database credentials in hosting panel or `config.php`
3. **Import** `database/schema.sql` to MySQL database
4. **Test** health endpoint: `/backend/api/health.php`

### Frontend (Static Hosting)
1. **Set API URL** in `frontend/src/lib/api.ts`
2. **Build:** `npm run build`
3. **Export:** `npx next export -o out`
4. **Upload** `out/` folder to static hosting

### Environment Variables

**Backend (PHP):**
- `APP_ENV` - Set to 'development' for debugging
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` - Database credentials
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_TTL_SECONDS` - JWT configuration

**Frontend (Next.js):**
- `NEXT_PUBLIC_API_BASE` - Backend API URL

## Common Development Tasks

### Adding New User Fields

1. **Update database schema** in `database/schema.sql`
2. **Modify registration endpoint** to accept new fields
3. **Update user selection queries** in auth middleware
4. **Add fields to frontend User type**
5. **Update registration and settings forms**

### Creating New Admin Features

1. **Create admin endpoint** in `backend/api/admin/`
2. **Add authentication check:** `require_auth(true)`
3. **Implement frontend admin page** with proper access control
4. **Add navigation** to admin dashboard if needed

### Modifying User Interface

1. **Update page components** in `frontend/src/app/`
2. **Modify global styles** in `frontend/src/app/globals.css`
3. **Follow black/white/gray color scheme**
4. **Test responsive design** across different screen sizes
5. **Ensure frozen account handling** is implemented

### Customizing Colors and Themes

**To change the color scheme:**
1. **Edit CSS variables** in `frontend/src/app/globals.css`:
   ```css
   :root {
     --background: #ffffff;     /* main background */
     --foreground: #000000;     /* main text color */
     --primary: #000000;        /* primary action color */
     --accent: #666666;         /* secondary text */
   }
   ```

2. **Update component classes:**
   - `.button-primary` - Main action buttons
   - `.button-secondary` - Secondary buttons
   - `.card` - Card backgrounds and borders
   - `.input` - Form input styling

3. **Update specific color references** in components:
   - Search for hardcoded colors like `text-green-600`
   - Replace with appropriate gray/black equivalents
   - Maintain accessibility contrast ratios

### Testing Changes

**Backend:**
- Test API endpoints with tools like Postman
- Verify database operations work correctly
- Check authentication and authorization

**Frontend:**
- Test user flows from registration to transactions
- Verify admin functionality works properly
- Test frozen account behavior
- Check responsive design on mobile devices
- Verify color scheme consistency across all pages

## Troubleshooting

### Common Issues

**Database Connection:**
- Check credentials in `config.php`
- Verify MySQL service is running
- Test with health endpoint

**Authentication Problems:**
- Check JWT secret configuration
- Verify token format and expiry
- Test login/register endpoints

**CORS Issues:**
- Ensure CORS headers are set in `config.php`
- Check API base URL in frontend
- Verify preflight OPTIONS handling

**Frozen Account Issues:**
- Check `is_frozen` field in database
- Verify frozen account checks in frontend
- Test that viewing still works when frozen

**Color Scheme Issues:**
- Check CSS variable definitions in globals.css
- Verify component classes are using correct colors
- Test contrast ratios for accessibility

### Development Tips

- **Use browser dev tools** to inspect API calls and responses
- **Check PHP error logs** when debugging backend issues
- **Test with different user types** (regular, admin, frozen)
- **Verify mobile responsiveness** throughout development
- **Test edge cases** like insufficient balance, invalid recipients
- **Use consistent color variables** instead of hardcoded colors

## Code Style Guidelines

### PHP Backend
- Use PSR-12 coding standards
- Always use prepared statements
- Include proper error handling with try/catch
- Use meaningful variable names
- Add comments for complex business logic

### TypeScript Frontend
- Use strict TypeScript configuration
- Implement proper error boundaries
- Use React hooks appropriately
- Follow Next.js best practices
- Maintain consistent component structure
- Use Tailwind classes consistently with the black/white/gray theme

### Database
- Use descriptive column names
- Add appropriate indexes for performance
- Maintain foreign key relationships
- Use proper data types for each field
- Include created_at/updated_at timestamps

### Design System
- **Primary color:** Black (#000000) for main actions
- **Text colors:** Black for primary text, gray shades for secondary
- **Backgrounds:** White for main areas, light gray for disabled states
- **Borders:** Light gray (#e5e5e5) for subtle separation
- **Spacing:** Use Tailwind's spacing scale consistently
- **Typography:** Maintain clear hierarchy with font weights

This guide should help you navigate and modify any part of the Cash App Clone application effectively while maintaining the clean black, white, and gray aesthetic.