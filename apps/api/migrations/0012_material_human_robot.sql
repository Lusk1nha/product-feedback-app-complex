CREATE INDEX "feedback_category_idx" ON "feedbacks" USING btree ("category_slug");--> statement-breakpoint
CREATE INDEX "feedback_upvotes_idx" ON "feedbacks" USING btree ("upvotes_count");--> statement-breakpoint
CREATE INDEX "feedback_category_upvotes_idx" ON "feedbacks" USING btree ("category_slug","upvotes_count");