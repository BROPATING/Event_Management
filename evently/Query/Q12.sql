SELECT 
  u.id                        AS userId,
  u.name                      AS name,
  u.email                     AS email,
  SUM(t.price * b.quantity)   AS totalSpent
FROM booking b
INNER JOIN tier t  ON t.id = b.tierId
INNER JOIN user u  ON u.id = b.userId
WHERE b.status = 'active'
GROUP BY u.id
ORDER BY totalSpent DESC
LIMIT 1