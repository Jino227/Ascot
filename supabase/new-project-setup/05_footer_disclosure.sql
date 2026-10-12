-- Initializes the admin-managed footer disclosure fields without replacing
-- any existing footer content. The disclosure remains hidden on the site
-- until disclosure_content is filled in from the admin content screen.
UPDATE public.website_content
SET content = content || jsonb_build_object(
  'disclosure_title', COALESCE(content->>'disclosure_title', ''),
  'disclosure_content', COALESCE(content->>'disclosure_content', '')
)
WHERE section_key = 'footer';
