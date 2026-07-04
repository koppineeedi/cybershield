CREATE TABLE `company_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`website` varchar(512),
	`isVerified` int NOT NULL DEFAULT 0,
	`platformVerdicts` text,
	`analysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `company_profiles_companyName_unique` UNIQUE(`companyName`)
);
--> statement-breakpoint
CREATE TABLE `fake_job_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`jobDescription` text NOT NULL,
	`verdict` enum('real','fake','suspicious') NOT NULL,
	`redFlags` text,
	`analysis` text,
	`reportCount` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fake_job_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vulnerability_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetIpOrUrl` varchar(512) NOT NULL,
	`scanType` enum('ip','url') NOT NULL,
	`threatLevel` enum('safe','warning','critical') NOT NULL,
	`vulnerabilities` text,
	`analysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vulnerability_scans_id` PRIMARY KEY(`id`)
);
