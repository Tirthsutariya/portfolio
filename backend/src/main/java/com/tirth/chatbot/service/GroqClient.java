package com.tirth.chatbot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/**
 * Calls Groq's OpenAI-compatible chat completions API.
 * Only used when chatbot.use-llm=true and an API key is present.
 */
@Component
public class GroqClient {

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Value("${chatbot.groq.api-key:}")
    private String apiKey;

    @Value("${chatbot.groq.model:llama-3.3-70b-versatile}")
    private String model;

    private final RestClient http = RestClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    private String systemPrompt(String context) {
        return """
            You are the personal AI assistant on Tirth Sutariya's portfolio website.
            Answer questions using ONLY the CONTEXT below about Tirth.
            Be warm, concise, and ALWAYS positive and professional about Tirth.
            If a question is not about Tirth, politely decline and steer the user back
            to his skills, experience, or projects. Never invent facts that are not in
            the context. You may format with **bold** and [links](url).

            CONTEXT:
            """ + context;
    }

    /** Blocking single-shot answer. */
    public String ask(String question, String context) {
        Map<String, Object> body = Map.of(
            "model", model,
            "temperature", 0.3,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt(context)),
                Map.of("role", "user", "content", question)
            )
        );
        JsonNode resp = http.post()
                .uri(GROQ_URL)
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
        return resp.path("choices").get(0).path("message").path("content").asText();
    }

    /** Streaming answer — {@code onToken} is called for each text chunk as it arrives. */
    public void askStream(String question, String context, Consumer<String> onToken) throws Exception {
        Map<String, Object> body = Map.of(
            "model", model,
            "temperature", 0.3,
            "stream", true,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt(context)),
                Map.of("role", "user", "content", question)
            )
        );
        String json = mapper.writeValueAsString(body);

        HttpRequest req = HttpRequest.newBuilder(URI.create(GROQ_URL))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<InputStream> resp = HttpClient.newHttpClient()
                .send(req, HttpResponse.BodyHandlers.ofInputStream());

        try (BufferedReader r = new BufferedReader(new InputStreamReader(resp.body(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = r.readLine()) != null) {
                if (!line.startsWith("data:")) continue;
                String payload = line.substring(5).trim();
                if (payload.equals("[DONE]")) break;
                if (payload.isEmpty()) continue;
                JsonNode node = mapper.readTree(payload);
                JsonNode content = node.path("choices").path(0).path("delta").path("content");
                if (!content.isMissingNode() && !content.isNull()) {
                    onToken.accept(content.asText());
                }
            }
        }
    }
}
