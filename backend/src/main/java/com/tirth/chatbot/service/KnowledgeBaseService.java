package com.tirth.chatbot.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tirth.chatbot.model.KnowledgeEntry;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Loads the resume knowledge base and answers questions by keyword scoring.
 * This is the "no API key required" brain — it always stays loyal because
 * every answer is authored from Tirth's resume.
 */
@Service
public class KnowledgeBaseService {

    private static final String FALLBACK =
        "I'm **Tirth's assistant**, so I stick to questions about **Tirth** — his skills, experience, "
        + "projects, education, or contact info. 😊\n\nTry: *\"What's his experience?\"*, "
        + "*\"Show me his projects\"*, or *\"How do I contact him?\"*";

    private final ObjectMapper mapper;
    private List<KnowledgeEntry> entries = new ArrayList<>();

    public KnowledgeBaseService(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @PostConstruct
    void load() throws Exception {
        var resource = new ClassPathResource("knowledge/resume-kb.json");
        try (var in = resource.getInputStream()) {
            entries = mapper.readValue(in, new TypeReference<List<KnowledgeEntry>>() {});
        }
    }

    /** @return the best-matching answer, or {@code null} if nothing is relevant. */
    public String findBest(String question) {
        String clean  = question.toLowerCase()
                                 .replaceAll("[^\\w\\s]", " ")
                                 .replaceAll("\\s+", " ")
                                 .trim();
        String padded = " " + clean + " ";

        KnowledgeEntry best = null;
        int bestScore = 0;
        for (KnowledgeEntry e : entries) {
            int score = 0;
            for (String k : e.keywords) {
                String kk = k.toLowerCase();
                boolean hit = kk.contains(" ")
                        ? (padded.contains(" " + kk + " ") || padded.contains(kk))
                        : padded.contains(" " + kk + " ");
                if (hit) score += kk.length() > 4 ? 2 : 1;
            }
            if (score > bestScore) {
                bestScore = score;
                best = e;
            }
        }
        return bestScore > 0 ? best.answer : null;
    }

    /** All resume knowledge joined together — used as grounding context for the LLM. */
    public String fullContext() {
        return entries.stream()
                      .map(e -> e.answer)
                      .collect(Collectors.joining("\n\n"));
    }

    public String fallback() {
        return FALLBACK;
    }
}
