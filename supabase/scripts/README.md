# Supabase reset and provisioning scripts

These scripts are intentionally separate because reset operations are destructive.
Run them from the Supabase SQL Editor, in this order when starting over:

1. `01_reset_public_data.sql` — removes all application data but keeps Auth accounts.
2. Run `02_reset_storage.sql` to inspect storage, then run `npm run reset:storage` from the project root to remove files through the Supabase Storage API.
3. `03_delete_auth_users.sql` — optional; removes every Auth account permanently.
4. Create a new user in Supabase Dashboard → Authentication → Users.
5. Replace `admin@example.com` in `04_promote_user_to_admin.sql` with the new user's email and run it.
7. Create other users in Supabase Dashboard, then use `05_create_client_profile.sql` for premium clients.
8. Use `06_assign_collection_to_client.sql` to grant or revoke collection access.

## Important

- Do not run `03_delete_auth_users.sql` unless all authentication accounts must be removed.
- Passwords are managed securely by Supabase Auth and are not inserted through SQL. Create the first admin through Supabase Auth Dashboard or the application's registration flow, then promote the account by email.
- Apply the normal schema and migrations before running these scripts.
- The application admin screen can also create client profiles and assign collections through `/admin/clients`.
- Supabase does not allow direct SQL deletion from `storage.objects`; `reset-storage.mjs` uses the Storage API with the service-role key instead.
