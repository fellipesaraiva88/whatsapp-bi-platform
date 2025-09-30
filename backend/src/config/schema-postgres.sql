-- WhatsApp BI Platform - PostgreSQL Schema
-- Database schema for raw PostgreSQL (without Supabase-specific features)

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

CREATE INDEX IF NOT EXISTS idx_contacts_jid ON contacts(jid);
CREATE INDEX IF NOT EXISTS idx_contacts_customer_type ON contacts(customer_type);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN(tags);

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

CREATE INDEX IF NOT EXISTS idx_messages_chat_jid ON messages(chat_jid);
CREATE INDEX IF NOT EXISTS idx_messages_sender_jid ON messages(sender_jid);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_content ON messages USING gin(to_tsvector('portuguese', content));

-- AI_ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_jid TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_ai_analysis_contact ON ai_analysis(contact_jid);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON ai_analysis(created_at DESC);

-- INTERACTIONS TABLE
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_jid TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('message', 'call', 'email', 'meeting', 'note')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_contact ON interactions(contact_jid);
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_ai_generated ON interactions(ai_generated);

-- CONVERSATION_STYLE TABLE
CREATE TABLE IF NOT EXISTS conversation_style (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_jid TEXT UNIQUE NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_conversation_style_contact ON conversation_style(contact_jid);

-- PIPELINE TABLE
CREATE TABLE IF NOT EXISTS pipeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_jid TEXT UNIQUE NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closing', 'post_sale')),
  value DECIMAL(10, 2),
  probability INTEGER CHECK (probability BETWEEN 0 AND 100),
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_contact ON pipeline(contact_jid);

-- AI_SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_jid TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_contact ON ai_suggestions(contact_jid);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_priority ON ai_suggestions(priority);

-- MESSAGE_QUEUE TABLE
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

CREATE INDEX IF NOT EXISTS idx_message_queue_status ON message_queue(status);
CREATE INDEX IF NOT EXISTS idx_message_queue_recipient ON message_queue(recipient_jid);

-- CHATS TABLE
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

CREATE INDEX IF NOT EXISTS idx_chats_jid ON chats(jid);
CREATE INDEX IF NOT EXISTS idx_chats_last_message_time ON chats(last_message_time DESC);

-- FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversation_style_updated_at ON conversation_style;
CREATE TRIGGER update_conversation_style_updated_at BEFORE UPDATE ON conversation_style
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pipeline_updated_at ON pipeline;
CREATE TRIGGER update_pipeline_updated_at BEFORE UPDATE ON pipeline
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for analytics
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