DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='shop_name') THEN
        ALTER TABLE users ADD COLUMN shop_name VARCHAR(255) NOT NULL DEFAULT '';
    END IF;
END $$;
