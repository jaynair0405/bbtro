CREATE TABLE IF NOT EXISTS suburban_train_master_aliases (
    alias_train_number VARCHAR(20) NOT NULL,
    normalized_alias_train_number VARCHAR(20) NOT NULL,
    train_code VARCHAR(10) NOT NULL,
    source_note VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (alias_train_number),
    KEY idx_stma_normalized_alias (normalized_alias_train_number),
    KEY idx_stma_train_code (train_code),
    CONSTRAINT fk_stma_train_code
        FOREIGN KEY (train_code)
        REFERENCES suburban_train_master(train_code)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

INSERT INTO suburban_train_master_aliases
    (alias_train_number, normalized_alias_train_number, train_code, source_note)
VALUES
    ('GNPL6', 'GNPL6', '98906', 'alternate label from train_corridor_map / trains table'),
    ('TPL26', 'TPL26', '99026', 'alternate label from train_corridor_map / trains table')
ON DUPLICATE KEY UPDATE
    train_code = VALUES(train_code),
    source_note = VALUES(source_note);
