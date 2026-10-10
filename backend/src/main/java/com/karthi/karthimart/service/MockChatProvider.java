package com.karthi.karthimart.service;

import java.util.HashMap;
import java.util.Map;

/**
 * MockChatProvider returning canned FAQ answers and domain-scoped product support.
 */
public class MockChatProvider implements ChatProvider {
    private final Map<String, String> cannedAnswers = new HashMap<>();

    public MockChatProvider() {
        cannedAnswers.put("shipping", "Standard shipping on KarthiMart takes 2-4 business days. Free shipping applies to orders over ₹1,000.");
        cannedAnswers.put("return", "We provide a 7-day hassle-free return and replacement policy for eligible products.");
        cannedAnswers.put("payment", "KarthiMart supports UPI, Cards, Net Banking, and Cash on Delivery.");
        cannedAnswers.put("seller", "Sellers can list products and view live customer orders through the Seller Center.");
    }

    @Override
    public String getReply(String userMessage, String context) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Hello! How can I assist you with your shopping on KarthiMart today?";
        }

        String lower = userMessage.toLowerCase();
        for (Map.Entry<String, String> entry : cannedAnswers.entrySet()) {
            if (lower.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return "Thank you for asking! On KarthiMart you can discover electronics, fashion, and artisanal goods with verified seller quality.";
    }
}
