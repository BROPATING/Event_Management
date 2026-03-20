SELECT 
  t.name                      AS tierName,
  SUM(t.price * b.quantity)   AS totalRevenue
FROM booking b
INNER JOIN tier t ON t.id = b.tierId
WHERE b.status = 'active'
GROUP BY t.name
ORDER BY totalRevenue DESC