package com.karthi.karthimart.controller;

import com.karthi.karthimart.listener.AppContextListener;
import com.karthi.karthimart.util.JsonUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check endpoint: GET /api/v1/health
 * Verifies application and database connectivity (Section 18).
 */
@WebServlet("/api/v1/health")
public class HealthServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");

        DataSource ds = AppContextListener.getDataSource();
        boolean dbUp = false;
        if (ds != null) {
            try (Connection conn = ds.getConnection()) {
                dbUp = conn.isValid(2);
            } catch (Exception ignored) {}
        }

        status.put("db", dbUp ? "UP" : "DOWN");
        JsonUtil.sendSuccess(resp, HttpServletResponse.SC_OK, status);
    }
}
