-- Hold Shelf uses GitHub only for sign-in. Provider credentials are not needed
-- after the exchange. Preserve the provider/account/user binding and app sessions.
-- This is deliberately data-only and cannot be undone by rolling back code.
UPDATE `account`
SET `access_token` = NULL,
    `refresh_token` = NULL,
    `id_token` = NULL,
    `access_token_expires_at` = NULL,
    `refresh_token_expires_at` = NULL
WHERE `provider_id` = 'github';
