SELECT 
  e.id                        AS eventId,
  e.title                     AS title,
  COUNT(b.id)                 AS cancelledBookings,
  SUM(t.price * b.quantity)   AS lostRevenue
FROM booking b
INNER JOIN tier t  ON t.id = b.tierId
INNER JOIN event e ON e.id = t.eventId
WHERE b.status = 'cancelled'
GROUP BY e.id