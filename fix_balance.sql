-- Script para corrigir o saldo do entregador
-- Atualiza o balance do usuário do deliveryman id 1 para 22.5
-- e cria o extrato correspondente

-- 1. Atualizar o saldo
UPDATE balances
SET amount = 22.5, "updatedAt" = NOW()
WHERE id = (
  SELECT "balanceId" 
  FROM users 
  WHERE id = (
    SELECT "id_user" 
    FROM deliverymen 
    WHERE id = 1
  )
);

-- 2. Criar o extrato (transação CREDIT)
INSERT INTO extracts (amount, type, "userId", "createdAt", "updatedAt")
SELECT 22.5, 'CREDIT', "id_user", NOW(), NOW()
FROM deliverymen
WHERE id = 1
AND NOT EXISTS (
  SELECT 1 FROM extracts 
  WHERE "userId" = (SELECT "id_user" FROM deliverymen WHERE id = 1)
  AND amount = 22.5 
  AND type = 'CREDIT'
);
