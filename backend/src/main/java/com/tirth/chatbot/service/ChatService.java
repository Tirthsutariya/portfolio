package com.tirth.chatbot.service;

import com.tirth.chatbot.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UncheckedIOException;
import java.io.Writer;
import java.nio.charset.StandardCharsets;

/**
 * Orchestrates a reply:
 *   1. If LLM mode is on AND a Groq key exists → RAG answer grounded on the resume.
 *   2. Otherwise (or if the LLM call fails) → keyword retrieval over the resume KB.
 * Either way the bot only ever talks about Tirth.
 */
@Service
public class ChatService {

    private static final String GREETING =
        "Hi! 👋 I'm **Tirth's AI assistant**. Ask me anything about his skills, "
        + "experience, or projects.";

    private final KnowledgeBaseService kb;
    private final GroqClient groq;

    @Value("${chatbot.use-llm:false}")
    private boolean useLlm;

    @Value("${chatbot.groq.api-key:}")
    private String apiKey;

    public ChatService(KnowledgeBaseService kb, GroqClient groq) {
        this.kb = kb;
        this.groq = groq;
    }

    public ChatResponse answer(String question) {
        if (question == null || question.isBlank()) {
            return new ChatResponse(GREETING, false);
        }

        if (useLlm && apiKey != null && !apiKey.isBlank()) {
            try {
                String llm = groq.ask(question, kb.fullContext());
                if (llm != null && !llm.isBlank()) {
                    return new ChatResponse(llm, true);
                }
            } catch (Exception ignored) {
                // fall through to retrieval if the LLM is unavailable
            }
        }

        String local = kb.findBest(question);
        return new ChatResponse(local != null ? local : kb.fallback(), false);
    }

    /** Streams the answer token-by-token to the given output stream. */
    public void stream(String question, OutputStream out) throws IOException {
        Writer w = new OutputStreamWriter(out, StandardCharsets.UTF_8);

        if (question == null || question.isBlank()) {
            w.write(GREETING);
            w.flush();
            return;
        }

        if (useLlm && apiKey != null && !apiKey.isBlank()) {
            try {
                groq.askStream(question, kb.fullContext(), token -> {
                    try { w.write(token); w.flush(); }
                    catch (IOException e) { throw new UncheckedIOException(e); }
                });
                return;
            } catch (Exception ignored) {
                // fall through to retrieval streaming if the LLM is unavailable
            }
        }

        // Fallback: stream the local answer word-by-word for a typing effect
        String local = kb.findBest(question);
        if (local == null) local = kb.fallback();
        for (String chunk : local.split("(?<= )")) {
            w.write(chunk);
            w.flush();
            try { Thread.sleep(12); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
        }
    }
}
