/**
 * Centralized icon components with size variants
 * Icons are imported from separate .svg files for maintainability
 */
import type {ComponentType, SVGProps} from 'react';

// Import raw SVG components
import ArrowLeftSvg from './svg/arrow-left.svg';
import ArrowRightSvg from './svg/arrow-right.svg';
import BookmarkSvg from './svg/bookmark.svg';
import BookmarkFilledSvg from './svg/bookmark-filled.svg';
import CalendarSvg from './svg/calendar.svg';
import ChatSvg from './svg/chat.svg';
import CheckSvg from './svg/check.svg';
import ChevronDownSvg from './svg/chevron-down.svg';
import ChevronRightSvg from './svg/chevron-right.svg';
import ClockSvg from './svg/clock.svg';
import EmailSvg from './svg/email.svg';
import ErrorSvg from './svg/error.svg';
import ExternalLinkSvg from './svg/external-link.svg';
import EyeSvg from './svg/eye.svg';
import FacebookSvg from './svg/facebook.svg';
import GiftSvg from './svg/gift.svg';
import LinkedinSvg from './svg/linkedin.svg';
import HeartSvg from './svg/heart.svg';
import InfoSvg from './svg/info.svg';
import InstagramSvg from './svg/instagram.svg';
import LocationSvg from './svg/location.svg';
import MenuSvg from './svg/menu.svg';
import MoneySvg from './svg/money.svg';
import NewsSvg from './svg/news.svg';
import PencilSvg from './svg/pencil.svg';
import PhoneSvg from './svg/phone.svg';
import PinnedSvg from './svg/pinned.svg';
import QuestionSvg from './svg/question.svg';
import SchoolSvg from './svg/school.svg';
import SendSvg from './svg/send.svg';
import ShieldSvg from './svg/shield.svg';
import SpinnerSvg from './svg/spinner.svg';
import StarSvg from './svg/star.svg';
import SuccessSvg from './svg/success.svg';
import TrashSvg from './svg/trash.svg';
import TwitterSvg from './svg/twitter.svg';
import UserSvg from './svg/user.svg';
import UsersSvg from './svg/users.svg';
import WarningSvg from './svg/warning.svg';
import XSvg from './svg/x.svg';
import YoutubeSvg from './svg/youtube.svg';

// Size variants
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type IconProperties = SVGProps<SVGSVGElement> & {
	size?: IconSize;
};

const sizeMap: Record<IconSize, string> = {
	xs: 'h-3 w-3',
	sm: 'h-4 w-4',
	md: 'h-5 w-5',
	lg: 'h-6 w-6',
	xl: 'h-8 w-8',
};

// Factory function to create icon wrapper with size support
function createIcon(SvgComponent: ComponentType<SVGProps<SVGSVGElement>>, displayName: string) {
	function Icon({size = 'md', className = '', ...props}: IconProperties) {
		return (
			<SvgComponent
				className={`${sizeMap[size]} ${className}`}
				aria-hidden='true'
				{...props}
			/>
		);
	}

	Icon.displayName = displayName;
	return Icon;
}

// Navigation & Actions
const ArrowLeftIcon = createIcon(ArrowLeftSvg, 'ArrowLeftIcon');
const ArrowRightIcon = createIcon(ArrowRightSvg, 'ArrowRightIcon');
const ChevronDownIcon = createIcon(ChevronDownSvg, 'ChevronDownIcon');
const ChevronRightIcon = createIcon(ChevronRightSvg, 'ChevronRightIcon');
const CheckIcon = createIcon(CheckSvg, 'CheckIcon');
const XIcon = createIcon(XSvg, 'XIcon');
const MenuIcon = createIcon(MenuSvg, 'MenuIcon');

// Communication
const EmailIcon = createIcon(EmailSvg, 'EmailIcon');
const PhoneIcon = createIcon(PhoneSvg, 'PhoneIcon');
const ChatIcon = createIcon(ChatSvg, 'ChatIcon');
const SendIcon = createIcon(SendSvg, 'SendIcon');

// Date & Time
const CalendarIcon = createIcon(CalendarSvg, 'CalendarIcon');
const ClockIcon = createIcon(ClockSvg, 'ClockIcon');

// Location
const LocationIcon = createIcon(LocationSvg, 'LocationIcon');

// People & Social
const UsersIcon = createIcon(UsersSvg, 'UsersIcon');
const UserIcon = createIcon(UserSvg, 'UserIcon');

// Status & Feedback
const SuccessIcon = createIcon(SuccessSvg, 'SuccessIcon');
const ErrorIcon = createIcon(ErrorSvg, 'ErrorIcon');
const InfoIcon = createIcon(InfoSvg, 'InfoIcon');
const WarningIcon = createIcon(WarningSvg, 'WarningIcon');
const QuestionIcon = createIcon(QuestionSvg, 'QuestionIcon');

// Objects & Items
const HeartIcon = createIcon(HeartSvg, 'HeartIcon');
const StarIcon = createIcon(StarSvg, 'StarIcon');
const GiftIcon = createIcon(GiftSvg, 'GiftIcon');
const MoneyIcon = createIcon(MoneySvg, 'MoneyIcon');
const SchoolIcon = createIcon(SchoolSvg, 'SchoolIcon');
const NewsIcon = createIcon(NewsSvg, 'NewsIcon');
const PinnedIcon = createIcon(PinnedSvg, 'PinnedIcon');

// Loading
const SpinnerIcon = createIcon(SpinnerSvg, 'SpinnerIcon');

// Social Media
const FacebookIcon = createIcon(FacebookSvg, 'FacebookIcon');
const InstagramIcon = createIcon(InstagramSvg, 'InstagramIcon');
const LinkedinIcon = createIcon(LinkedinSvg, 'LinkedinIcon');
const TwitterIcon = createIcon(TwitterSvg, 'TwitterIcon');
const YoutubeIcon = createIcon(YoutubeSvg, 'YoutubeIcon');

// Admin & Actions
const EyeIcon = createIcon(EyeSvg, 'EyeIcon');
const PencilIcon = createIcon(PencilSvg, 'PencilIcon');
const TrashIcon = createIcon(TrashSvg, 'TrashIcon');
const ExternalLinkIcon = createIcon(ExternalLinkSvg, 'ExternalLinkIcon');
const ShieldIcon = createIcon(ShieldSvg, 'ShieldIcon');

// Special icons with additional props
type BookmarkIconProperties = Omit<IconProperties, 'fill'> & {filled?: boolean};

function BookmarkIcon({size = 'md', className = '', filled = false, ...props}: BookmarkIconProperties) {
	const SvgComponent = filled ? BookmarkFilledSvg : BookmarkSvg;
	return (
		<SvgComponent
			className={`${sizeMap[size]} ${className}`}
			aria-hidden='true'
			{...props}
		/>
	);
}

BookmarkIcon.displayName = 'BookmarkIcon';

// Re-export path strings for cases where raw paths are needed
/* eslint-disable @stylistic/max-len */
const arrowRightPath = 'M17 8l4 4m0 0l-4 4m4-4H3';
const questionPath = 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
/* eslint-enable @stylistic/max-len */

export {
	// Navigation & Actions
	ArrowLeftIcon,
	ArrowRightIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	CheckIcon,
	XIcon,
	MenuIcon,
	// Communication
	EmailIcon,
	PhoneIcon,
	ChatIcon,
	SendIcon,
	// Date & Time
	CalendarIcon,
	ClockIcon,
	// Location
	LocationIcon,
	// People & Social
	UsersIcon,
	UserIcon,
	// Status & Feedback
	SuccessIcon,
	ErrorIcon,
	InfoIcon,
	WarningIcon,
	QuestionIcon,
	// Objects & Items
	HeartIcon,
	StarIcon,
	GiftIcon,
	MoneyIcon,
	SchoolIcon,
	NewsIcon,
	PinnedIcon,
	// Loading
	SpinnerIcon,
	// Social Media
	FacebookIcon,
	InstagramIcon,
	LinkedinIcon,
	TwitterIcon,
	YoutubeIcon,
	// Admin & Actions
	EyeIcon,
	PencilIcon,
	TrashIcon,
	ExternalLinkIcon,
	ShieldIcon,
	// Special
	BookmarkIcon,
	// Paths
	arrowRightPath,
	questionPath,
};

export type {IconProperties, BookmarkIconProperties};
