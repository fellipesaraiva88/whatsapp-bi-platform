-- WhatsApp BI Platform - Database Schema
-- Execute este script no Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CONTACTS TABLE
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jid TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  name TEXT,
  customer_type TEXT DEFAULT 'lead' CHECK (customer_type IN ('lead', 'prospect', 'active_customer', 'inactive', 'vip')),
  interest_level TEXT CHECK (interest_level IN ('high', 'medium', 'low')),
  buying_stage TEXT CHECK (buying_stage IN ('awareness', 'consideration', 'decision', 'post_purchase')),
  tags TEXT[] DEFAULT '{}',
  lifetime_value_prediction TEXT,
  churn_risk TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contacts_jid ON contacts(jid);
CREATE INDEX idx_contacts_customer_type ON contacts(customer_type);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT UNIQUE NOT NULL,
  chat_jid TEXT NOT NULL,
  sender_jid TEXT NOT NULL,
  content TEXT,
  from_me BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  has_media BOOLEAN DEFAULT FALSE,
  media_type TEXT,
  media_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_chat_jid ON messages(chat_jid);
CREATE INDEX idx_messages_sender_jid ON messages(sender_jid);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_content ON messages USING gin(to_tsvector('portuguese', content));

-- AI_ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_jid TEXT NOT NULL REFERENCES contacts(jid) ON DELETE CASCADE,
  chat_jid TEXT,
  analysis_type TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  tone TEXT,
  intent TEXT,
  key_topics TEXT[] DEFAULT '{}',
  entities JSONB DEFAULT '{}',
  insights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_analysis_contact ON ai_analysis(contact_jid);
CREATE INDEX idx_ai_analysis_created_at ON ai_analysis(created_at DESC);

-- INTERACTIONS TABLE
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_jid TEXT NOT NULL REFERENCES contacts(jid) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('message', 'call', 'email', 'meeting', 'note')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interactions_contact ON interactions(contact_jid);
CREATE INDEX idx_interactions_timestamp ON interactions(timestamp DESC);
CREATE INDEX idx_interactions_ai_generated ON interactions(ai_generated);

-- CONVERSATION_STYLE TABLE
CREATE TABLE IF NOT EXISTS conversation_style (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_jid TEXT UNIQUE NOT NULL REFERENCES contacts(jid) ON DELETE CASCADE,
  writing_style TEXT,
  common_expressions TEXT[] DEFAULT '{}',
  tone TEXT,
  message_length TEXT,
  emoji_usage TEXT,
  punctuation_style TEXT,
  greeting_style TEXT,
  closing_style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversation_style_contact ON conversation_style(contact_jid);

-- PIPELINE TABLE
CREATE TABLE IF NOT EXISTS pipeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_jid TEXT UNIQUE NOT NULL REFERENCES contacts(jid) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closing', 'post_sale')),
  value DECIMAL(10, 2),
  probability INTEGER CHECK (probability BETWEEN 0 AND 100),
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pipeline_stage ON pipeline(stage);
CREATE INDEX idx_pipeline_contact ON pipeline(contact_jid);

-- AI_SUGGESTIONS TABLE (para sistema de sugestões)
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_jid TEXT NOT NULL REFERENCES contacts(jid) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('send_message', 'schedule_call', 'send_proposal', 'follow_up', 'wait')),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  timing TEXT,
  reasoning TEXT,
  suggested_content TEXT,
  expected_outcome TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ai_suggestions_contact ON ai_suggestions(contact_jid);
CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX idx_ai_suggestions_priority ON ai_suggestions(priority);

-- MESSAGE_QUEUE TABLE (para envio humanizado em etapas)
CREATE TABLE IF NOT EXISTS message_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_jid TEXT NOT NULL,
  message_chunks TEXT[] NOT NULL,
  current_chunk INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  delay_between_chunks INTEGER DEFAULT 2000,
  ai_generated BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_message_queue_status ON message_queue(status);
CREATE INDEX idx_message_queue_recipient ON message_queue(recipient_jid);

-- CHATS TABLE (cache de chats do WhatsApp)
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jid TEXT UNIQUE NOT NULL,
  name TEXT,
  is_group BOOLEAN DEFAULT FALSE,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chats_jid ON chats(jid);
CREATE INDEX idx_chats_last_message_time ON chats(last_message_time DESC);

-- FUNCTIONS

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_style_updated_at BEFORE UPDATE ON conversation_style
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_updated_at BEFORE UPDATE ON pipeline
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_style ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
-- For now, allowing all authenticated users to read/write
CREATE POLICY "Enable all for authenticated users" ON contacts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON messages
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON ai_analysis
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON interactions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON conversation_style
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON pipeline
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON ai_suggestions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON message_queue
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON chats
    FOR ALL USING (auth.role() = 'authenticated');

-- Create views for analytics

-- View: Contact Summary
CREATE OR REPLACE VIEW v_contact_summary AS
SELECT 
    c.id,
    c.jid,
    c.name,
    c.phone_number,
    c.customer_type,
    c.interest_level,
    c.buying_stage,
    c.tags,
    COUNT(DISTINCT m.id) as total_messages,
    COUNT(DISTINCT i.id) as total_interactions,
    MAX(m.timestamp) as last_message_at,
    p.stage as pipeline_stage,
    p.value as pipeline_value
FROM contacts c
LEFT JOIN messages m ON c.jid = m.sender_jid
LEFT JOIN interactions i ON c.jid = i.contact_jid
LEFT JOIN pipeline p ON c.jid = p.contact_jid
GROUP BY c.id, c.jid, c.name, c.phone_number, c.customer_type, 
         c.interest_level, c.buying_stage, c.tags, p.stage, p.value;

-- View: Daily Activity
CREATE OR REPLACE VIEW v_daily_activity AS
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as message_count,
    COUNT(DISTINCT sender_jid) as unique_contacts,
    COUNT(*) FILTER (WHERE from_me = true) as outbound_messages,
    COUNT(*) FILTER (WHERE from_me = false) as inbound_messages
FROM messages
GROUP BY DATE(timestamp)
ORDER BY date DESC;

COMMENT ON TABLE contacts IS 'CRM contacts with customer classification';
COMMENT ON TABLE messages IS 'All WhatsApp messages synced from MCP';
COMMENT ON TABLE ai_analysis IS 'AI-powered conversation analysis results';
COMMENT ON TABLE interactions IS 'Log of all customer interactions across channels';
COMMENT ON TABLE conversation_style IS 'Learned conversation style per contact for AI humanization';
COMMENT ON TABLE pipeline IS 'Sales pipeline tracking';
COMMENT ON TABLE ai_suggestions IS 'AI-generated suggestions for next best actions';
COMMENT ON TABLE message_queue IS 'Queue for humanized message sending in stages';
COMMENT ON TABLE chats IS 'Cached WhatsApp chats information';