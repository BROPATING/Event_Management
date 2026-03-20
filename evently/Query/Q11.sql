SELECT 
  strftime('%m', e.startDate)       AS month,
  SUM(t.price * b.quantity)         AS totalRevenue
FROM booking b
INNER JOIN tier t  ON t.id = b.tierId
INNER JOIN event e ON e.id = t.eventId
WHERE b.status = 'active'
  AND strftime('%Y', e.startDate) = '2025'
GROUP BY month
ORDER BY month ASC