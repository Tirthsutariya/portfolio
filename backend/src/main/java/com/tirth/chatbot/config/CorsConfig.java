package com.tirth.chatbot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Allows the portfolio frontend (a separate origin) to call this API.
 * Add your deployed domain to chatbot.cors.allowed-origins in application.properties.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${chatbot.cors.allowed-origins:*}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "OPTIONS");
    }
}
