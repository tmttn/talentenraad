// Builder.io content types for admin management

export type ActivityCategory = 'kalender' | 'activiteit' | 'nieuws' | 'feest';

export type ActivityData = {
  titel: string;
  datum: string;
  tijd?: string;
  locatie?: string;
  samenvatting?: string;
  inhoud?: string;
  categorie: ActivityCategory;
  afbeelding?: string;
  vastgepind?: boolean;
  volgorde?: number;
};

export type Activity = {
  id: string;
  name: string;
  published: 'published' | 'draft' | 'archived';
  createdDate: number;
  lastUpdated?: number;
  data: ActivityData;
};

export type NewsItemData = {
  titel: string;
  datum: string;
  samenvatting: string;
  inhoud?: string;
  afbeelding?: string;
  vastgepind?: boolean;
  volgorde?: number;
};

export type NewsItem = {
  id: string;
  name: string;
  published: 'published' | 'draft' | 'archived';
  createdDate: number;
  lastUpdated?: number;
  data: NewsItemData;
};

export type AnnouncementType = 'info' | 'waarschuwing' | 'belangrijk';

export type AnnouncementData = {
  tekst: string;
  type: AnnouncementType;
  link?: string;
  linkTekst?: string;
  actief: boolean;
};

export type Announcement = {
  id: string;
  name: string;
  published: 'published' | 'draft' | 'archived';
  createdDate: number;
  lastUpdated?: number;
  data: AnnouncementData;
};

export type SponsorTier = 'gold' | 'silver' | 'bronze' | 'partner';

export type SponsorData = {
  naam: string;
  logo: string;
  website?: string;
  beschrijving?: string;
  tier: SponsorTier;
  actief: boolean;
  volgorde?: number;
};

export type Sponsor = {
  id: string;
  name: string;
  published: 'published' | 'draft' | 'archived';
  createdDate: number;
  lastUpdated?: number;
  data: SponsorData;
};

// Page data for admin management (simplified - actual pages have more Builder.io fields)
export type PageData = {
  url: string;
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
};

export type Page = {
  id: string;
  name: string;
  published: 'published' | 'draft' | 'archived';
  createdDate: number;
  lastUpdated?: number;
  data: PageData;
};

// List of protected page URLs that cannot be deleted
export const PROTECTED_PAGE_URLS = [
  '/',
  '/kalender',
  '/nieuws',
  '/activiteiten',
  '/contact',
  '/over-ons',
  '/privacy',
  '/algemene-voorwaarden',
];

export type BuilderModel = 'activiteit' | 'nieuws' | 'aankondiging' | 'sponsor' | 'page';

export type ContentItem = Activity | NewsItem | Announcement | Sponsor | Page;

// API response types
export type BuilderListResponse<T> = {
  results: T[];
};

export type BuilderWriteResponse = {
  id: string;
  [key: string]: unknown;
};
