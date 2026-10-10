package com.karthi.karthimart.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

/**
 * JsonUtil for serializing standardized API response envelopes (Section 13).
 */
public final class JsonUtil {
    private static final Gson GSON = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            .create();

    private JsonUtil() {}

    public static Gson getGson() {
        return GSON;
    }

    public static void sendSuccess(HttpServletResponse response, int statusCode, Object data) throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> envelope = new HashMap<>();
        envelope.put("success", true);
        envelope.put("data", data);
        envelope.put("error", null);

        try (PrintWriter writer = response.getWriter()) {
            writer.write(GSON.toJson(envelope));
            writer.flush();
        }
    }

    public static void sendError(HttpServletResponse response, int statusCode, String errorCode, String message) throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("code", errorCode);
        errorBody.put("message", message);

        Map<String, Object> envelope = new HashMap<>();
        envelope.put("success", false);
        envelope.put("data", null);
        envelope.put("error", errorBody);

        try (PrintWriter writer = response.getWriter()) {
            writer.write(GSON.toJson(envelope));
            writer.flush();
        }
    }
}
