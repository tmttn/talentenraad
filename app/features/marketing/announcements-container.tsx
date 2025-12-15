'use client';

import {useState} from 'react';
// eslint-disable-next-line import-x/extensions
import {AnnouncementDisplay, type AnnouncementData} from './announcement-display';

export type AnnouncementsContainerProps = {
	globalAnnouncement?: AnnouncementData;
	pageAnnouncement?: AnnouncementData;
};

export function AnnouncementsContainer({globalAnnouncement, pageAnnouncement}: AnnouncementsContainerProps) {
	const [isPageDismissed, setIsPageDismissed] = useState(false);
	const [isGlobalDismissed, setIsGlobalDismissed] = useState(false);

	const showPageAnnouncement = pageAnnouncement && !isPageDismissed;
	const showGlobalAnnouncement = globalAnnouncement && !isGlobalDismissed;

	if (!showPageAnnouncement && !showGlobalAnnouncement) {
		return null;
	}

	return (
		<div className='announcements-container'>
			{showPageAnnouncement && (
				<AnnouncementDisplay
					announcement={pageAnnouncement}
					onDismiss={() => {
						setIsPageDismissed(true);
					}}
				/>
			)}
			{showGlobalAnnouncement && (
				<AnnouncementDisplay
					announcement={globalAnnouncement}
					onDismiss={() => {
						setIsGlobalDismissed(true);
					}}
				/>
			)}
		</div>
	);
}
