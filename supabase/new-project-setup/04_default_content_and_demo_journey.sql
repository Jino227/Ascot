-- ===== SEED DATA =====
INSERT INTO public.website_content (section_key, content) VALUES
('hero', '{
  "eyebrow": "Est. 1985",
  "title": "Where craftsmanship meets contemporary style.",
  "subtitle": "Bespoke tailoring and ready-to-wear collections crafted for those who value precision, quality, and timeless design.",
  "cta": "Explore collections",
  "image": "",
  "video_url": ""
}'::jsonb),
('about', '{
  "eyebrow": "Our Heritage",
  "title": "Four decades of tailoring excellence.",
  "body": "Founded in 1985, Ascotex Fashions began as a small tailoring atelier with a commitment to exceptional craftsmanship. Today we create bespoke and ready-to-wear garments for discerning clients worldwide.",
  "image": "",
  "stats": [
    {"key": "40+", "label": "Years of craft"},
    {"key": "200+", "label": "Skilled artisans"},
    {"key": "50+", "label": "Export countries"},
    {"key": "10K+", "label": "Garments annually"}
  ]
}'::jsonb),
('process', '{
  "eyebrow": "Our Manufacturing Strength",
  "title": "From design to dispatch.",
  "pillars": [
    { "icon": "Sparkles", "title": "Design Studio", "body": "Creative designers transform concepts into embroidery-ready artwork and sampling." },
    { "icon": "Scissors", "title": "Sampling", "body": "Rapid prototyping with meticulous attention to every detail." },
    { "icon": "Award", "title": "Embroidery", "body": "Master craftsmen with decades of experience in every stitch." },
    { "icon": "Leaf", "title": "Production", "body": "Scalable manufacturing with consistent quality across every piece." },
    { "icon": "Sparkles", "title": "Quality Control", "body": "Each piece undergoes detailed inspection for stitches, beads, finishing and quality." },
    { "icon": "Leaf", "title": "Packaging", "body": "Products are carefully packed and shipped worldwide." }
  ]
}'::jsonb),
('testimonials', '{
  "eyebrow": "Global Trust",
  "items": []
}'::jsonb),
('contact', '{
  "eyebrow": "Get in touch",
  "title": "Start your next project.",
  "body": "Request a catalogue or contact our sales team. We typically respond within 24 hours.",
  "address": "152 Savile Row\nLondon, W1S 3NE",
  "email": "hello@ascotexfashions.com",
  "phone": "+44 (0) 20 7946 0128",
  "cta": "Request Catalogue"
}'::jsonb),
('about_page', '{
  "title": "Four decades of tailoring excellence.",
  "subtitle": "From our founding in 1985 to our atelier on Savile Row, every garment tells a story of precision and passion.",
  "image": "",
  "body1": "Ascotex Fashions was founded by master tailor William Ascotex, who apprenticed on Savile Row before opening his own atelier. His vision was simple: create garments that honour the traditions of British tailoring while embracing modern silhouettes and sensibilities.",
  "body2": "Today, our team of twelve master tailors continues this legacy. Each garment passes through dozens of hands — from pattern cutter to finisher — before it reaches our fitting rooms.",
  "body3": "We serve clients from London to Tokyo, creating everything from business suits and evening wear to casual jackets and overcoats.",
  "stats": [
    { "key": "40+", "label": "Years of craft" },
    { "key": "200+", "label": "Skilled workforce" },
    { "key": "10", "label": "Certifications" },
    { "key": "50+", "label": "Export countries" }
  ]
}'::jsonb),
('footer', '{
  "description": "Bespoke tailoring and ready-to-wear collections crafted since 1985.",
  "address": "152 Savile Row\nLondon, W1S 3NE",
  "email": "hello@ascotexfashions.com",
  "phone": "+44 (0) 20 7946 0128",
  "copyright": "Made to last."
}'::jsonb),
('company_gallery', '{
  "title": "Behind the scenes",
  "images": [
    {"url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", "caption": "Master tailor at work on a bespoke jacket", "category": "employees"},
    {"url": "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&q=80", "caption": "Modern cutting room with precision machinery", "category": "machines"},
    {"url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", "caption": "The full Ascotex Fashions team", "category": "group"},
    {"url": "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80", "caption": "Pattern makers collaborating on a new design", "category": "employees"},
    {"url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80", "caption": "Industrial sewing machines in production", "category": "machines"},
    {"url": "https://images.unsplash.com/photo-1604328698692-f76ea9498e72?w=800&q=80", "caption": "Quality inspection of finished garments", "category": "employees"},
    {"url": "https://images.unsplash.com/photo-1556755134-38b4e8b04b58?w=800&q=80", "caption": "Fabric archive and material selection room", "category": "machines"},
    {"url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80", "caption": "Team meeting and project review", "category": "group"}
  ]
}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;

-- Demo journey steps
INSERT INTO public.journey_steps (title, subtitle, description, image, step_order, is_published) VALUES
('Material Sourcing', 'Premium materials from trusted suppliers', 'Every masterpiece begins by selecting premium fabrics, threads, beads, sequins, zari and trims from trusted suppliers. Every material is inspected before entering production.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80', 1, true),
('Hand Dyeing', 'Traditional colour mastery', 'Traditional dyeing techniques produce rich colours with excellent consistency and durability, creating the perfect foundation for every garment.', 'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=1200&q=80', 2, true),
('Design Studio', 'Concepts to embroidery-ready artwork', 'Creative designers transform concepts into embroidery-ready artwork and sampling, working closely with clients to bring visions to life.', 'https://images.unsplash.com/photo-1604328698692-f76ea9498e72?w=1200&q=80', 3, true),
('Artwork Preparation', 'Designs transferred to fabric', 'Designs are accurately transferred to fabric using precision techniques that guide every stitch with absolute accuracy.', 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200&q=80', 4, true),
('Hand Embroidery', 'Traditional craftsmanship', 'Experienced artisans create intricate embroidery using traditional techniques passed down through generations.', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1200&q=80', 5, true),
('Stitching & Production', 'Pattern to final garment', 'Pattern making, cutting, stitching, finishing and pressing produce the final garment with meticulous attention to every detail.', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80', 6, true),
('Quality Inspection', 'Detailed quality assurance', 'Each piece undergoes detailed inspection for stitches, beads, finishing and overall quality before approval.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80', 7, true),
('Final Approval', 'Senior verification', 'Senior merchandisers verify workmanship and client specifications meet our exacting standards.', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80', 8, true),
('Packaging & Dispatch', 'Worldwide delivery', 'Products are carefully packed and shipped to clients around the world, ensuring they arrive in perfect condition.', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&q=80', 9, true)
ON CONFLICT DO NOTHING;
