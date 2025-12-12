-- Atualizar o extrato existente para incluir a descrição com o código da entrega
UPDATE extracts
SET description = 'Entrega ' || (
  SELECT code 
  FROM deliveries 
  WHERE status = 'COMPLETED' 
    AND "deliveryManId" = 1
  ORDER BY "completedAt" DESC 
  LIMIT 1
) || ' concluída',
"updatedAt" = NOW()
WHERE "userId" = (SELECT "id_user" FROM deliverymen WHERE id = 1)
  AND amount = 22.5
  AND type = 'CREDIT';
