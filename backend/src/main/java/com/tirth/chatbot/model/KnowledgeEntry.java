package com.tirth.chatbot.model;

import java.util.List;

/**
 * One entry of the resume knowledge base.
 * Loaded from resources/knowledge/resume-kb.json.
 */
public class KnowledgeEntry {
    public List<String> keywords;
    public String answer;

    public List<String> getKeywords() { return keywords; }
    public String getAnswer() { return answer; }
}
