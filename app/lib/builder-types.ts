// Builder.io content types for admin management

export type ActivityCategory = 'kalender' | 'activiteit' | 'nieuws' | 'feest';

export type ActivityData = {
	titel: string;
	datum: string;
	tijd?: string;
	locatie?: string;
	beschrijving?: string;
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

export type BuilderModel = 'activiteit' | 'nieuws' | 'aankondiging';

export type ContentItem = Activity | NewsItem | Announcement;

// API response types
export type BuilderListResponse<T> = {
	results: T[];
};

export type BuilderWriteResponse = {
	id: string;
	[key: string]: unknown;
};
