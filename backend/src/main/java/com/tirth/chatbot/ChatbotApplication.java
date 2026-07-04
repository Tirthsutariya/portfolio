package com.tirth.chatbot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for Tirth Sutariya's portfolio chatbot backend.
 *
 * Modes:
 *   chatbot.use-llm=false  → keyword retrieval over the resume knowledge base (no API key)
 *   chatbot.use-llm=true   → Groq LLM RAG grounded on the resume (needs GROQ_API_KEY)
 */
@SpringBootApplication
public class ChatbotApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChatbotApplication.class, args);
    }
}
