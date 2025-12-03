-- Supabase SQL Setup for Digicides Blog System
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/uhasritskbkicpwfwxbj/sql)

-- Create the blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  author TEXT DEFAULT '',
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  thumbnail TEXT,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  word_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for published blogs
CREATE POLICY "Allow public read access for published blogs" ON blogs
  FOR SELECT
  USING (status = 'published');

-- Create policy to allow authenticated users full access (for admin)
-- For now, we'll use the service role key which bypasses RLS
CREATE POLICY "Allow service role full access" ON blogs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample blog posts
INSERT INTO blogs (title, subtitle, slug, content, author, category, tags, meta_title, meta_description, status, word_count, reading_time)
VALUES 
(
  'How Digital Marketing is Transforming Agriculture in India',
  'A comprehensive look at the digital revolution in farming',
  'digital-marketing-transforming-agriculture-india',
  '<h2>The Digital Revolution in Agriculture</h2><p>Agriculture in India is undergoing a significant transformation. With over 60% of India''s population engaged in farming, the adoption of digital tools is becoming increasingly important for sustainable growth.</p><h2>Key Digital Trends</h2><ul><li><strong>Mobile-First Approach:</strong> Farmers are increasingly using smartphones to access market prices, weather information, and best practices.</li><li><strong>WhatsApp Communities:</strong> Agricultural brands are leveraging WhatsApp groups to share timely information with farmers.</li><li><strong>Audio Conferencing:</strong> Mass audio calls enable brands to reach farmers who may not be comfortable with text-based communication.</li></ul><h2>The Road Ahead</h2><p>As connectivity improves in rural India, we expect to see even greater adoption of digital tools in agriculture. Brands that invest in understanding farmer needs and delivering value through digital channels will be best positioned to succeed.</p>',
  'Digicides Team',
  'Marketing',
  ARRAY['digital marketing', 'agriculture', 'rural india', 'farmer engagement'],
  'Digital Marketing in Agriculture India | Digicides Blog',
  'Discover how digital marketing is transforming agriculture in India and learn about key trends in farmer engagement and rural marketing.',
  'published',
  150,
  1
),
(
  '5 Effective Strategies for Farmer Engagement',
  'Building lasting relationships with rural audiences',
  '5-effective-strategies-farmer-engagement',
  '<h2>Introduction</h2><p>Engaging with farmers requires a unique approach that considers their specific needs, communication preferences, and daily challenges. Here are five proven strategies that work.</p><h2>1. Speak Their Language</h2><p>Communicate in regional languages and use simple, jargon-free terminology. Farmers appreciate content that respects their intelligence while being easy to understand.</p><h2>2. Leverage Audio Content</h2><p>Many farmers prefer audio over text. Mass audio conferencing and voice messages can be highly effective for product training and awareness campaigns.</p><h2>3. Timing Matters</h2><p>Schedule your communications around farming cycles. Early morning and evening hours often work best when farmers are not in the fields.</p><h2>4. Provide Genuine Value</h2><p>Share practical tips, weather updates, and market prices. Content that helps farmers in their daily work builds trust and loyalty.</p><h2>5. Build Community</h2><p>Create platforms where farmers can share experiences and learn from each other. Peer recommendations are incredibly powerful in rural communities.</p>',
  'Digicides Team',
  'Best Practices',
  ARRAY['farmer engagement', 'rural marketing', 'communication strategies'],
  'Farmer Engagement Strategies | Digicides Blog',
  'Learn 5 effective strategies for engaging with farmers and building lasting relationships with rural audiences in India.',
  'published',
  200,
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions
GRANT ALL ON blogs TO anon;
GRANT ALL ON blogs TO authenticated;
GRANT ALL ON blogs TO service_role;
