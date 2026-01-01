export const FeedbackSort = {
	MostUpvotes: 'most_upvotes',
	LeastUpvotes: 'least_upvotes',
	MostComments: 'most_comments',
	LeastComments: 'least_comments',
} as const

export type FeedbackSortValue = (typeof FeedbackSort)[keyof typeof FeedbackSort]

export const getFeedbackSortLabel = (sort: FeedbackSortValue) => {
	switch (sort) {
		case FeedbackSort.MostUpvotes:
			return 'Most Upvotes'
		case FeedbackSort.LeastUpvotes:
			return 'Least Upvotes'
		case FeedbackSort.MostComments:
			return 'Most Comments'
		case FeedbackSort.LeastComments:
			return 'Least Comments'
	}
}
