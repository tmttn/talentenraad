/**
 * UI Components - Main Export
 *
 * Contour style components for the public site, and the form and dialog
 * components the admin and editor still use.
 *
 * Usage:
 * import {Card, SpeechBubble, FormField, Input} from '@components/ui'
 */

// Form Components (admin, editor)
export {
  FormField, Input, Textarea, Select, Switch,
} from './form';

// Dialog (feedback form)
export {Modal} from './interactive';

// Card components
export {Card} from './card';
export type {CardProperties} from './card';

// Badge components
export {DateBadge, formatDateParts} from './date-badge';
export type {DateBadgeProperties} from './date-badge';

export {CategoryBadge, categoryStyles} from './category-badge';
export type {CategoryBadgeProperties} from './category-badge';

export {SpeechBubble} from './speech-bubble';
export type {SpeechBubbleProperties} from './speech-bubble';

// Calendar components
export {AddToCalendarButton} from './add-to-calendar-button';
