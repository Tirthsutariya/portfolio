package com.tirth.chatbot.controller;

import com.tirth.chatbot.dto.ChatRequest;
import com.tirth.chatbot.dto.ChatResponse;
import com.tirth.chatbot.service.ChatService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.util.Map;

/** Public chat API consumed by the portfolio frontend. */
@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return chatService.answer(request.getQuestion());
    }

    @PostMapping(value = "/chat/stream", produces = "text/plain;charset=UTF-8")
    public StreamingResponseBody chatStream(@RequestBody ChatRequest request) {
        return out -> chatService.stream(request.getQuestion(), out);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "up");
    }
}
