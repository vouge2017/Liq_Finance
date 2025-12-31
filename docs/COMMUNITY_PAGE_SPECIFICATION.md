# Community Page Specification: Household & Shared Finance

## 1. Overview
The **Community Page** is the central hub for managing shared financial responsibilities within a household or close-knit group. It allows users to invite family members, assign roles, and manage shared visibility of budgets and goals. This feature extends the "Personal" finance experience into a collaborative "Household" experience.

**Design Philosophy**: "Cyber-Organic" (Stitch).
-   **Visuals**: Glassmorphism, rounded corners (`rounded-[2.5rem]`), soft gradients, and bento-grid layouts.
-   **Interaction**: Fluid transitions, haptic feedback, and intuitive role management.

---

## 2. Core Features & User Stories

### 2.1. Household Management
-   **View Members**: Users can see a list of all active members in their household.
-   **Manage Roles**: Admins can assign roles (Admin, Editor, Viewer) to control access levels.
-   **Remove Members**: Admins can remove members from the household.

### 2.2. Invitations
-   **Invite New Members**: Users can invite others via Email or Phone Number.
-   **Track Status**: Users can see "Pending", "Accepted", or "Expired" statuses for sent invitations.
-   **Resend/Cancel**: Users can resend or cancel pending invitations.

### 2.3. Shared Context
-   **Shared Budget Visibility**: Toggle which budget categories are visible to the household.
-   **Shared Goals**: Link specific Savings Goals or Iqubs to the household context.

---

## 3. Data Model

### 3.1. Types (Existing & Enhanced)

```typescript
// Existing in types.ts (to be enhanced)
export type Role = 'Admin' | 'Editor' | 'Viewer';

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: Role;
  joinedAt: string;
  status: 'active' | 'inactive';
}

export interface Invitation {
  id: string;
  email?: string;
  phone?: string;
  role: Role;
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  token: string; // For deep linking
}
```

### 3.2. Supabase Integration
-   **Table**: `household_members` (links `user_id` to `household_id`).
-   **Table**: `household_invitations` (stores pending invites).
-   **RLS Policies**: Strict policies ensuring users can only view/edit their own household data.

---

## 4. UI/UX Design Specification

### 4.1. Header Section
-   **Title**: "My Community" / "የኔ ማህበረሰብ".
-   **Subtitle**: "Household & Shared Finance".
-   **Action**: "Invite Member" button (Primary Blue, Pill-shaped, Icon: `UserPlus`).
-   **Background**: Glassmorphic sticky header matching `BudgetPage` and `GoalsPage`.

### 4.2. Members Grid (Bento Layout)
-   **Layout**: Responsive grid (1 column mobile, 2 columns tablet).
-   **Card Style**:
    -   `bg-white dark:bg-white/5`
    -   `border border-white/20`
    -   `rounded-[2.5rem]`
    -   `shadow-sm`
-   **Card Content**:
    -   **Avatar**: Large circle with image or initials.
    -   **Name**: Bold text, truncated if long.
    -   **Role Badge**:
        -   *Admin*: `bg-purple-500/10 text-purple-500`
        -   *Editor*: `bg-blue-500/10 text-blue-500`
        -   *Viewer*: `bg-gray-500/10 text-gray-500`
    -   **Menu**: Three-dot menu for "Edit Role" or "Remove".

### 4.3. Pending Invitations Section
-   **Visual**: Distinct from active members. Slightly transparent (`opacity-80`) or dashed border.
-   **Content**:
    -   "Invited: [Email/Phone]"
    -   "Status: Pending" (Pulsing amber dot).
-   **Actions**: "Resend" (Text button), "Revoke" (Red text button).

### 4.4. "Shared with Household" Summary
-   **Component**: A horizontal scroll or summary card showing what is currently shared.
-   **Items**:
    -   "🏠 Rent Budget"
    -   "🚗 Car Goal"
    -   "🛒 Groceries"

---

## 5. Implementation Plan (Future)

1.  **Backend Setup**: Create Supabase tables for `households`, `household_members`, and `invitations`.
2.  **State Management**: Update `AppContext` to fetch and subscribe to these tables.
3.  **UI Construction**: Build `CommunityPage.tsx` using the specified design components.
4.  **Invite Flow**: Implement the logic to generate invite links/tokens and handle acceptance.

---

## 6. Mockup Code Structure

```tsx
// CommunityPage.tsx Structure
return (
  <div className="pb-28 animate-fade-in bg-[#f6f6f8] dark:bg-[#101622] min-h-screen">
    <Header title="My Community" onInvite={openInviteModal} />
    
    <div className="px-5 space-y-6">
      {/* Active Members */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Household Members</h3>
        <div className="grid gap-4">
          {members.map(member => <MemberCard key={member.id} member={member} />)}
        </div>
      </section>

      {/* Pending Invites */}
      {invitations.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Pending Invites</h3>
          <div className="space-y-3">
             {invitations.map(invite => <InviteCard key={invite.id} invite={invite} />)}
          </div>
        </section>
      )}
    </div>
  </div>
);
```
