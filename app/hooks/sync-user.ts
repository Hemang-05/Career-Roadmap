// src/hooks/useSyncUser.ts
'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/utils/supabase/supabaseClient';

export function useSyncUser() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    // Only attempt to sync if the user is signed in
    if (isSignedIn && user) {
      const syncUser = async () => {
        // Check if a record exists in the DB using clerk_id
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', user.id)
          .single();

        // If record doesn't exist or there was an error (record missing), insert/upsert it.
        if (error || !data) {
          const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
          const { error: upsertError } = await supabase
            .from('users')
            .upsert(
              {
                clerk_id: user.id,
                full_name: fullName || null,  // Update to match your schema
                email: user.primaryEmailAddress?.emailAddress,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'clerk_id' }
            );

          if (upsertError) {
            console.error('Failed to sync user:', upsertError);
          } else {
            console.log('User record synced successfully.');
          }
        } else {
          console.log('User record already exists in the database.');
        }
      };

      syncUser();
    }
  }, [isSignedIn, user]);
}
