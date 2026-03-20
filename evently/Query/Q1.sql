SELECT 
        SUM(t.price * b.quantity) AS totalRevenue,
        SUM(b.quantity)           AS totalTicketsSold
      FROM booking b
      INNER JOIN tier t  ON t.id = b.tierId
      INNER JOIN event e ON e.id = t.eventId
      WHERE b.status = 'active'
        AND e.startDate >= '2025-01-01'
        AND e.startDate < '2025-02-01'