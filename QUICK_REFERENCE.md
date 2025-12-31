# Quick Reference - Design System

Copy-paste ready code snippets for common patterns.

## Buttons

```tsx
// Primary CTA (56px)
<Button size="lg">Save Changes</Button>

// Secondary action
<Button variant="outline" size="lg">Cancel</Button>

// Inline action
<Button size="sm">Edit</Button>

// Full width CTA
<Button size="lg" className="w-full">Continue</Button>

// Icon button
<Button size="icon-lg"><Icons.Plus /></Button>
```

## Hero Cards

```tsx
// Balance hero
<HeroCard variant="primary">
  <HeroText>{balance} ETB</HeroText>
  <HeroSubtext>Available Balance</HeroSubtext>
</HeroCard>

// Success hero
<HeroCard variant="success">
  <HeroText>+{income} ETB</HeroText>
  <HeroSubtext>This Month Income</HeroSubtext>
</HeroCard>

// Custom gradient
<HeroCard gradient="bg-gradient-to-br from-purple-500 to-pink-500">
  <HeroText>Custom</HeroText>
</HeroCard>
```

## Cards

```tsx
// Standard card
<Card>
  <CardHeader>
    <CardTitle>Recent Transactions</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// With border radius (already applied)
// Cards automatically use rounded-2xl
```

## Loading States

```tsx
// Full page loading
{isLoading ? <DashboardSkeleton /> : <Dashboard />}

// List loading
{isLoading ? <TransactionListSkeleton count={5} /> : <TransactionList />}

// Budget page
{isLoading ? <BudgetPageSkeleton /> : <BudgetPage />}

// Goals
{isLoading ? <GoalsSkeleton /> : <GoalsPage />}

// Form
{isLoading ? <FormSkeleton /> : <Form />}

// Chat/AI
{isLoading ? <AISkeleton /> : <ChatWindow />}
```

## Empty States

```tsx
// Generic
<EmptyState
  icon="🎯"
  title="No Goals Yet"
  description="Start saving towards your financial goals."
  action={{ label: 'Create Goal', onClick: onCreate }}
/>

// No transactions
<NoTransactionsState onAddClick={() => openModal()} />

// No budgets
<NoBudgetState onCreateClick={() => openModal()} />

// No goals
<NoGoalsState onCreateClick={() => openModal()} />

// Search results
<NoSearchResults query={searchText} onClear={() => setSearch('')} />

// No connection
<NoConnectionState onRetry={() => refresh()} />
```

## Swipe Actions

```tsx
// Transaction swipe
<SwipeableTransactionItem
  id="trans-123"
  description="Coffee"
  amount={-125}
  date="Today"
  category="Food"
  onDelete={(id) => deleteTransaction(id)}
  onEdit={(id) => editTransaction(id)}
/>

// Generic swipe
<SwipeableListItem
  onSwipeLeft={{ label: 'Delete', color: 'danger', onClick: () => {} }}
  onSwipeRight={{ label: 'Archive', color: 'success', onClick: () => {} }}
>
  {/* Content */}
</SwipeableListItem>
```

## Haptic Feedback

```tsx
// Light tap
<button onClick={() => haptics.light()}>Tap</button>

// Button press
<button onClick={() => {
  haptics.buttonPress();
  submitForm();
}}>Submit</button>

// Success
<button onClick={() => {
  haptics.success();
  saveData();
}}>Save</button>

// Error
<button onClick={() => {
  haptics.error();
  showError('Invalid input');
}}>Try Again</button>

// Selection
<button onClick={() => {
  haptics.selection();
  toggleItem();
}}>Toggle</button>

// Complete transaction
onClick={() => {
  haptics.transactionComplete();
  showSuccess();
}}

// Goal achieved
onClick={() => {
  haptics.goalAchieved();
  celebrate();
}}
```

## Icons

```tsx
// Ethiopian icon
<CoffeeIcon size={24} color="#f59e0b" />
<IqubIcon size={32} color="#10b981" />
<IdirIcon size={24} />

// From library
<EthiopianIcon name="iqub" size={24} color="#10b981" />

// Available names:
// 'cross', 'coffee', 'iqub', 'iddir', 'moneyBag',
// 'balanceScale', 'goalFlag', 'savings', 'transaction', 'budget'
```

## Spacing

```tsx
// Margin
<div className="m-4">16px margin</div>
<div className="mx-6">24px horizontal</div>
<div className="my-8">32px vertical</div>

// Padding
<div className="p-4">16px padding</div>
<div className="px-6">24px horizontal</div>
<div className="py-8">32px vertical</div>

// Gap
<div className="flex gap-4">Items with 16px gap</div>
<div className="flex gap-6">Items with 24px gap</div>

// Scale: xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48)
```

## Animations

```tsx
// Entrance animations
<div className="animate-slide-up">Slides up</div>
<div className="animate-scale-in">Scales in</div>
<div className="animate-bounce-in">Bounces in</div>
<div className="animate-fade-in">Fades in</div>

// Pulse
<div className="animate-pulse">Pulsing element</div>

// Button with active scale
<button className="active:scale-95">Scales down on press</button>
```

## Border Radius

```tsx
// Standard card
<div className="rounded-2xl">16px radius</div>

// Hero card
<div className="rounded-3xl">20px radius</div>

// Button
<button className="rounded-lg">16px radius</button>

// Small elements
<div className="rounded-md">12px</div>
<div className="rounded-sm">8px</div>
```

## Shadows

```tsx
// Elevation levels
<div className="shadow-elevation-1">Subtle</div>
<div className="shadow-elevation-2">Light</div>
<div className="shadow-elevation-3">Medium</div>
<div className="shadow-elevation-4">Strong</div>
<div className="shadow-elevation-5">Maximum</div>

// Glow
<div className="shadow-glow-primary">Cyan glow</div>
<div className="shadow-glow-success">Green glow</div>
```

## Colors

```tsx
// Use semantic classes from design system
<div className="bg-gradient-to-br from-cyan-500 to-blue-600">Primary</div>
<div className="bg-gradient-to-br from-emerald-500 to-teal-600">Success</div>
<div className="bg-gradient-to-br from-amber-500 to-orange-600">Warning</div>
<div className="bg-gradient-to-br from-red-500 to-pink-600">Danger</div>

// OR use Hero Card for better styling
<HeroCard variant="primary">...</HeroCard>
```

## Accessibility

```tsx
// Touch targets (minimum 44x44px)
<button className="w-11 h-11">Valid</button>

// Better: 56px for primary
<button className="h-14 px-6">Better</button>

// Keyboard focus (automatic in all Button components)
<Button>Auto focused on Tab</Button>

// ARIA labels
<button aria-label="Add transaction">
  <PlusIcon />
</button>
```

## Common Patterns

### Transaction Item with Options
```tsx
<SwipeableTransactionItem
  id={transaction.id}
  description={transaction.description}
  amount={transaction.amount}
  date={transaction.date}
  category={transaction.category}
  onDelete={handleDelete}
  onEdit={handleEdit}
/>
```

### Loading → Loaded → Empty Flow
```tsx
{isLoading && <DashboardSkeleton />}
{!isLoading && data?.length > 0 && <Dashboard data={data} />}
{!isLoading && data?.length === 0 && (
  <EmptyState title="No data" action={{ label: 'Create', onClick: {} }} />
)}
```

### Hero + Content Pattern
```tsx
<div className="pb-24 space-y-6">
  <HeroCard variant="primary">
    <HeroText>{metric}</HeroText>
    <HeroSubtext>Description</HeroSubtext>
  </HeroCard>
  <Card>
    {/* Content */}
  </Card>
</div>
```

### Button CTA Pattern
```tsx
<div className="fixed bottom-6 left-6 right-6 safe-area-inset-bottom">
  <Button size="lg" className="w-full">
    Complete Action
  </Button>
</div>
```

---

## File Locations

| Feature | File | Import |
|---------|------|--------|
| Buttons | `ui/button.tsx` | `import { Button } from '@/shared/components/ui/button'` |
| Cards | `ui/card.tsx` | `import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'` |
| Hero Cards | `HeroCard.tsx` | `import { HeroCard, HeroText, HeroSubtext } from '@/shared/components/HeroCard'` |
| Loading | `LoadingSkeletons.tsx` | `import { DashboardSkeleton } from '@/shared/components/LoadingSkeletons'` |
| Empty | `EmptyStateComponent.tsx` | `import { EmptyState } from '@/shared/components/EmptyStateComponent'` |
| Swipe | `SwipeableListItem.tsx` | `import { SwipeableTransactionItem } from '@/shared/components/SwipeableListItem'` |
| Haptics | `useHapticPatterns.ts` | `import { useHapticPatterns } from '@/hooks/useHapticPatterns'` |
| Icons | `EthiopianIcons.tsx` | `import { CoffeeIcon } from '@/shared/components/EthiopianIcons'` |
| Tokens | `design-tokens.ts` | `import { BUTTON_HEIGHTS } from '@/lib/design-tokens'` |

---

## Cheat Sheet

| Task | Code |
|------|------|
| Primary button (56px) | `<Button size="lg">Action</Button>` |
| Loading state | `{loading ? <DashboardSkeleton /> : <Content />}` |
| Empty state | `<EmptyState title="..." action={{}} />` |
| Hero number | `<HeroCard><HeroText>100</HeroText></HeroCard>` |
| Card title | `<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader></Card>` |
| Swipe action | `<SwipeableTransactionItem onDelete={} onEdit={} />` |
| Haptic feedback | `haptics.success()` |
| Icon | `<CoffeeIcon size={24} />` |
| Loading animation | `<div className="animate-pulse">Loading</div>` |
| Entrance animation | `<div className="animate-slide-up">Content</div>` |

---

Last updated: Implementation complete
Next step: Integrate into existing screens, test, refine
