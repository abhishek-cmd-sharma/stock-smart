import { useEffect, useRef } from 'react';
import { db, collection, query, where, getDocs, doc, writeBatch, serverTimestamp } from '@/firebase-adapter';
import { useAuth } from '@/contexts/AuthContext';

export function useAutoRemoveExpired() {
  const { user } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || hasRun.current) return;
    
    const cleanupExpiredProducts = async () => {
      try {
        hasRun.current = true; // ensure it only runs once per mount
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('user_id', '==', user.uid));
        const snapshot = await getDocs(q);
        
        // Use a simple date comparison.
        // To be safe against timezone issues, we check if the end of the expiry day has passed.
        // For simplicity, if expiry_date (e.g. '2023-10-15') is strictly less than today's date string.
        const todayStr = new Date().toISOString().split('T')[0];

        const batch = writeBatch(db);
        let expiredCount = 0;

        for (const document of snapshot.docs) {
          const product = document.data();
          if (product.expiry_date && product.expiry_date < todayStr) {
            // Delete product
            batch.delete(doc(db, 'products', document.id));
            
            // Create a notification
            const notifRef = doc(collection(db, 'notifications'));
            batch.set(notifRef, {
              user_id: user.uid,
              title: 'Product Expired',
              message: `"${product.name}" has expired and was automatically removed from your inventory.`,
              type: 'expiry',
              is_read: false,
              related_entity_id: document.id,
              created_at: serverTimestamp(),
            });
            
            expiredCount++;
          }
        }

        if (expiredCount > 0) {
          await batch.commit();
          console.log(`Successfully removed ${expiredCount} expired products.`);
        }
      } catch (error) {
        console.error("Failed to auto-remove expired products:", error);
      }
    };

    cleanupExpiredProducts();
  }, [user]);
}
