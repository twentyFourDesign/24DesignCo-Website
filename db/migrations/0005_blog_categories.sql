-- The five "how to build" articles shipped with the category "Guides", which the admin's category list does not include.
-- Move them to "How to build" so the blog's topic filters and the admin agree.
update cms_posts set category = 'How to build', updated_at = now() where category = 'Guides';

-- Short card summaries and article-specific booking-box headings from the blog design.
-- Only fills posts still carrying the seeded values, so anything edited in the admin is kept.
update cms_posts set excerpt = $t$What drives the cost, what an MVP involves and how to get a quote you can trust.$t$, updated_at = now() where slug = 'how-much-does-it-cost-to-build-an-app-in-nigeria' and excerpt = coalesce(seo->>'metaDescription', '');
update cms_posts set cta_heading = $t$Want a clear number for your idea?$t$, updated_at = now() where slug = 'how-much-does-it-cost-to-build-an-app-in-nigeria' and cta_heading = 'Ready to turn this into a build plan?';
update cms_posts set excerpt = $t$The smallest version of your product that real users can use, and how to scope it.$t$, updated_at = now() where slug = 'what-is-an-mvp' and excerpt = coalesce(seo->>'metaDescription', '');
update cms_posts set cta_heading = $t$Ready to scope your MVP?$t$, updated_at = now() where slug = 'what-is-an-mvp' and cta_heading = 'Ready to turn this into a build plan?';
update cms_posts set excerpt = $t$Day by day: the workshop, the prototype, the plan and the fixed quote.$t$, updated_at = now() where slug = 'what-happens-in-a-discovery-sprint' and excerpt = coalesce(seo->>'metaDescription', '');
update cms_posts set cta_heading = $t$Ready to turn your idea into a plan?$t$, updated_at = now() where slug = 'what-happens-in-a-discovery-sprint' and cta_heading = 'Ready to turn this into a build plan?';
update cms_posts set excerpt = $t$Rider app, driver app and admin: what to build first, and the risks in Nigeria.$t$, updated_at = now() where slug = 'how-to-build-a-ridesharing-app' and excerpt = coalesce(seo->>'metaDescription', '');
update cms_posts set cta_heading = $t$Have an idea for a mobility product?$t$, updated_at = now() where slug = 'how-to-build-a-ridesharing-app' and cta_heading = 'Ready to turn this into a build plan?';
update cms_posts set excerpt = $t$Choose one job first, then build the core loop that keeps people coming back.$t$, updated_at = now() where slug = 'how-to-build-a-fitness-app' and excerpt = coalesce(seo->>'metaDescription', '');
update cms_posts set cta_heading = $t$Have a fitness or wellness idea?$t$, updated_at = now() where slug = 'how-to-build-a-fitness-app' and cta_heading = 'Ready to turn this into a build plan?';
update cms_posts set excerpt = $t$Content rights, delivery on slow connections and the MVP to start with.$t$, updated_at = now() where slug = 'how-to-build-a-streaming-app' and excerpt = coalesce(seo->>'metaDescription', '');
update cms_posts set cta_heading = $t$Have a streaming idea?$t$, updated_at = now() where slug = 'how-to-build-a-streaming-app' and cta_heading = 'Ready to turn this into a build plan?';
update cms_posts set excerpt = $t$Offline-first field apps, farmer records and how to scope version one.$t$, updated_at = now() where slug = 'how-to-build-a-crm-for-agriculture' and excerpt = coalesce(seo->>'metaDescription', '');
update cms_posts set cta_heading = $t$Building for agriculture?$t$, updated_at = now() where slug = 'how-to-build-a-crm-for-agriculture' and cta_heading = 'Ready to turn this into a build plan?';
update cms_posts set excerpt = $t$Off-the-shelf or custom, and the features that belong in version one.$t$, updated_at = now() where slug = 'how-to-build-a-crm-version-one' and excerpt = coalesce(seo->>'metaDescription', '');
update cms_posts set cta_heading = $t$Need a CRM built around how you work?$t$, updated_at = now() where slug = 'how-to-build-a-crm-version-one' and cta_heading = 'Ready to turn this into a build plan?';
