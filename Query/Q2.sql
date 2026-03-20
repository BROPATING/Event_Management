SELECT e.city, SUM(b.quantity) as totalTicketsSold
      FROM booking b
      INNER JOIN tier t ON t.id = b.tierId
      INNER JOIN event e ON e.id = t.eventId
      WHERE b.status = 'active'
      GROUP BY e.city
      ORDER BY totalTicketsSold DESC
      LIMIT 1

