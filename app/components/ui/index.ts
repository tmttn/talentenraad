/**
 * UI Components - Main Export
 *
 * This barrel file exports all UI components for easy importing.
 *
 * Usage:
 * import { Container, Section, Stack, Input, Modal } from '@/app/components/ui'
 */

// ===========================================
// NEW DESIGN SYSTEM COMPONENTS
// ===========================================

// Layout Components
export {Container, Section, Stack, Cluster, Grid, Divider} from './layout';

// Form Components
export {FormField, Input, Textarea, Select, Checkbox, RadioGroup, Switch} from './form';

// Interactive Components
export {Modal, Tabs, Accordion, Tooltip} from './interactive';

// Feedback Components
export {VisuallyHidden, Spinner} from './feedback';

// Decorative Components
export {DecorativeBlob, GradientBackground} from './decorative';

// ===========================================
// EXISTING COMPONENTS (to be migrated)
// ===========================================

// Animated components
export {AnimatedLink, linkStyles} from './animated-link';
export type {AnimatedLinkProperties} from './animated-link';

export {AnimatedButton, buttonStyles} from './animated-button';
export type {AnimatedButtonProperties} from './animated-button';

// Card components
export {Card} from './card';
export type {CardProperties} from './card';

// Badge components
export {DateBadge, formatDateParts} from './date-badge';
export type {DateBadgeProperties} from './date-badge';

export {CategoryBadge, categoryStyles} from './category-badge';
export type {CategoryBadgeProperties} from './category-badge';

// Calendar components
export {AddToCalendarButton} from './add-to-calendar-button';

