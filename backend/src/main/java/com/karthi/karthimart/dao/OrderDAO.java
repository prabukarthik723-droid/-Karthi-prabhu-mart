package com.karthi.karthimart.dao;

import com.karthi.karthimart.model.Order;
import com.karthi.karthimart.model.OrderItem;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * OrderDAO implementation handling transactions, orders, and order items.
 */
public class OrderDAO {
    private final DataSource dataSource;

    public OrderDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<Order> findByBuyerId(Long buyerId) throws SQLException {
        String sql = "SELECT id, buyer_id, status, total_amount, payment_method, created_at FROM orders WHERE buyer_id = ? ORDER BY id DESC";
        List<Order> orders = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, buyerId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    orders.add(mapOrder(rs));
                }
            }
        }
        return orders;
    }

    public List<Order> findAll() throws SQLException {
        String sql = "SELECT id, buyer_id, status, total_amount, payment_method, created_at FROM orders ORDER BY id DESC";
        List<Order> orders = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                orders.add(mapOrder(rs));
            }
        }
        return orders;
    }

    public Optional<Order> findById(Long id) throws SQLException {
        String sql = "SELECT id, buyer_id, status, total_amount, payment_method, created_at FROM orders WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapOrder(rs));
                }
            }
        }
        return Optional.empty();
    }

    public boolean updateStatus(Long orderId, Order.Status newStatus) throws SQLException {
        String sql = "UPDATE orders SET status = ? WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, newStatus.name());
            ps.setLong(2, orderId);
            return ps.executeUpdate() > 0;
        }
    }

    public Order createOrderWithItems(Order order, List<OrderItem> items) throws SQLException {
        String orderSql = "INSERT INTO orders (buyer_id, status, total_amount, payment_method) VALUES (?, ?, ?, ?)";
        String itemSql = "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement psOrder = conn.prepareStatement(orderSql, Statement.RETURN_GENERATED_KEYS);
                 PreparedStatement psItem = conn.prepareStatement(itemSql)) {

                psOrder.setLong(1, order.getBuyerId());
                psOrder.setString(2, order.getStatus().name());
                psOrder.setBigDecimal(3, order.getTotalAmount());
                psOrder.setString(4, order.getPaymentMethod());
                psOrder.executeUpdate();

                try (ResultSet rs = psOrder.getGeneratedKeys()) {
                    if (rs.next()) {
                        order.setId(rs.getLong(1));
                    }
                }

                for (OrderItem item : items) {
                    psItem.setLong(1, order.getId());
                    psItem.setLong(2, item.getProductId());
                    psItem.setInt(3, item.getQuantity());
                    psItem.setBigDecimal(4, item.getUnitPrice());
                    psItem.addBatch();
                }
                psItem.executeBatch();

                conn.commit();
                order.setItems(items);
                return order;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    private Order mapOrder(ResultSet rs) throws SQLException {
        return new Order(
                rs.getLong("id"),
                rs.getLong("buyer_id"),
                Order.Status.valueOf(rs.getString("status")),
                rs.getBigDecimal("total_amount"),
                rs.getString("payment_method"),
                rs.getTimestamp("created_at")
        );
    }
}
