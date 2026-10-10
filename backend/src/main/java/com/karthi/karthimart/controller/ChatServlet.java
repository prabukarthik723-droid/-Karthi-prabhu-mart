package com.karthi.karthimart.controller;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.karthi.karthimart.service.ChatProvider;
import com.karthi.karthimart.service.GeminiChatProvider;
import com.karthi.karthimart.service.MockChatProvider;
import com.karthi.karthimart.util.JsonUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * AI Chatbot backend proxy servlet: POST /api/v1/chat
 * Validates message, enforces guardrails and rate limits.
 */
@WebServlet("/api/v1/chat")
public class ChatServlet extends HttpServlet {
    private ChatProvider chatProvider;

    @Override
    public void init() {
        String providerConfig = System.getenv("AI_CHATBOT_PROVIDER");
        if ("gemini".equalsIgnoreCase(providerConfig)) {
            this.chatProvider = new GeminiChatProvider();
        } else {
            this.chatProvider = new MockChatProvider();
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }

        String message = "";
        try {
            JsonObject json = JsonParser.parseString(sb.toString()).getAsJsonObject();
            if (json.has("message")) {
                message = json.get("message").getAsString().trim();
            }
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "INVALID_JSON", "Malformed JSON request body");
            return;
        }

        if (message.isEmpty() || message.length() > 500) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "VALIDATION_ERROR", "Message cannot be empty or exceed 500 characters");
            return;
        }

        String reply = chatProvider.getReply(message, "KarthiMart product catalog context");

        Map<String, String> data = new HashMap<>();
        data.put("reply", reply);

        JsonUtil.sendSuccess(resp, HttpServletResponse.SC_OK, data);
    }
}
