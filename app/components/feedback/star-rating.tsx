'use client';

import {useState} from 'react';
import {Star} from 'lucide-react';

type StarRatingProps = {
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
};

export function StarRating({value, onChange, disabled = false}: StarRatingProps) {
	const [hoverValue, setHoverValue] = useState(0);

	const displayValue = hoverValue || value;

	return (
		<div className="flex gap-1" role="radiogroup" aria-label="Beoordeling">
			{[1, 2, 3, 4, 5].map(star => {
				const isFilled = star <= displayValue;
				const isSelected = star === value;

				return (
					<button
						key={star}
						type="button"
						onClick={() => !disabled && onChange(star)}
						onMouseEnter={() => !disabled && setHoverValue(star)}
						onMouseLeave={() => setHoverValue(0)}
						onFocus={() => !disabled && setHoverValue(star)}
						onBlur={() => setHoverValue(0)}
						disabled={disabled}
						className={`
							p-1 rounded transition-colors duration-150
							focus:outline-none focus:ring-2 focus:ring-primary/20
							${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
						`}
						role="radio"
						aria-checked={isSelected}
						aria-label={`${star} ${star === 1 ? 'ster' : 'sterren'}`}
					>
						<Star
							className={`
								w-8 h-8 transition-colors duration-150
								${isFilled
			? 'fill-yellow-400 text-yellow-400'
			: 'fill-none text-gray-300'
}
							`}
						/>
					</button>
				);
			})}
		</div>
	);
}
