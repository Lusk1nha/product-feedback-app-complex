CREATE TABLE "feedbacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"author_id" integer NOT NULL,
	"category_slug" varchar(50) NOT NULL,
	"status_slug" varchar(50) NOT NULL,
	"upvotes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upvotes" (
	"feedback_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_category_slug_feedback_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."feedback_categories"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_status_slug_feedback_statuses_slug_fk" FOREIGN KEY ("status_slug") REFERENCES "public"."feedback_statuses"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_feedback_id_feedbacks_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedbacks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upvotes" ADD CONSTRAINT "upvotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;