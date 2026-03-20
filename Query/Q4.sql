SELECT 
  t.name            AS tierName,
  SUM(b.quantity)   AS ticketsSold,
  SUM(t.price * b.quantity) AS tierRevenue
FROM booking b
INNER JOIN tier t  ON t.id = b.tierId
INNER JOIN event e ON e.id = t.eventId
WHERE b.status = 'active'
  AND e.title = 'Tech Summit 2025'
GROUP BY t.id