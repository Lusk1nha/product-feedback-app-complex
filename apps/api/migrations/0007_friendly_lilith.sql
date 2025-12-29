CREATE TABLE "feedback_categories" (
	"enabled" boolean DEFAULT true NOT NULL,
	"slug" varchar(50) PRIMARY KEY NOT NULL,
	"label" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_statuses" (
	"enabled" boolean DEFAULT true NOT NULL,
	"slug" varchar(50) PRIMARY KEY NOT NULL,
	"label" varchar(50) NOT NULL,
	"hex_color" varchar(7) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"include_in_roadmap" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
