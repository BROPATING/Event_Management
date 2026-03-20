SELECT 
  e.id          AS eventId,
  e.title       AS title,
  SUM(b.quantity) AS totalTicketsSold
FROM booking b
INNER JOIN tier t  ON t.id = b.tierId
INNER JOIN event e ON e.id = t.eventId
WHERE b.status = 'active'
GROUP BY e.id
ORDER BY totalTicketsSold DESC
LIMIT 3