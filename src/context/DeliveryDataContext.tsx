'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getLocalOrderById, updateLocalOrderStatus } from '@/services/localOrderService';
import { generateOrderId } from '@/lib/utils';
import {
  Delivery, DeliveryActivityLogEntry, DeliveryPartner, DeliverySlotConfig, DeliveryStatus,
  PartnerAvailability, canTransitionDelivery,
} from '@/types/delivery';

const PARTNERS_KEY = 'vlgs_delivery_partners';
const DELIVERIES_KEY = 'vlgs_deliveries';
const SLOTS_KEY = 'vlgs_delivery_slots';
const AUTH_KEY = 'vlgs_delivery_auth';

const seedPartners: DeliveryPartner[] = [
  ['Ravi Kumar', 'ravi@vlgs.store', '9876543210'],
  ['Suresh Reddy', 'suresh@vlgs.store', '9876543211'],
  ['Mahesh Babu', 'mahesh@vlgs.store', '9876543212'],
  ['Arjun Das', 'arjun@vlgs.store', '9876543213'],
].map(([name, email, phone], index) => ({
  id: `partner-${index + 1}`, name, email, phone, password: 'demo123', status: 'OFFLINE',
  activeDeliveries: 0, totalDeliveries: 0, completedDeliveries: 0, failedDeliveries: 0,
  averageDeliveryMinutes: 32, rating: 4.6 + index * 0.1, joinedAt: new Date().toISOString(),
  isActive: true, maxConcurrentDeliveries: 3,
}));

const seedSlots: DeliverySlotConfig[] = [
  { id: 'express', label: 'Express Delivery', startTime: 'Now', endTime: '30 min', type: 'express', capacity: 10, enabled: true },
  { id: 'morning', label: 'Morning Slot', startTime: '08:00', endTime: '12:00', type: 'scheduled', capacity: 20, enabled: true },
  { id: 'evening', label: 'Evening Slot', startTime: '17:00', endTime: '21:00', type: 'scheduled', capacity: 20, enabled: true },
];

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}
function save(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function now() { return new Date().toISOString(); }

interface DeliveryContextValue {
  partners: DeliveryPartner[];
  deliveries: Delivery[];
  slots: DeliverySlotConfig[];
  currentPartner: DeliveryPartner | null;
  refresh: () => void;
  addPartner: (partner: Omit<DeliveryPartner, 'id' | 'joinedAt' | 'activeDeliveries' | 'totalDeliveries' | 'completedDeliveries' | 'failedDeliveries'>) => void;
  updatePartner: (id: string, patch: Partial<DeliveryPartner>) => void;
  deletePartner: (id: string) => void;
  setPartnerStatus: (id: string, status: PartnerAvailability) => void;
  assignDelivery: (orderId: string, partnerId: string) => Delivery | null;
  transitionDelivery: (id: string, status: DeliveryStatus, options?: { actor?: string; failureReason?: string; otp?: string; codCollected?: boolean }) => boolean;
  reassignDelivery: (id: string, partnerId: string, reason?: string) => boolean;
  getDeliveryForOrder: (orderId: string) => Delivery | null;
  updateSlots: (slots: DeliverySlotConfig[]) => void;
  signInPartner: (email: string, password: string) => DeliveryPartner | null;
  signOutPartner: () => void;
}

const DeliveryContext = createContext<DeliveryContextValue | undefined>(undefined);

export function DeliveryDataProvider({ children }: { children: ReactNode }) {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [slots, setSlots] = useState<DeliverySlotConfig[]>([]);
  const [authId, setAuthId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const storedPartners = load<DeliveryPartner[]>(PARTNERS_KEY, []);
    const storedDeliveries = load<Delivery[]>(DELIVERIES_KEY, []);
    setPartners(storedPartners.length ? storedPartners : seedPartners);
    setDeliveries(storedDeliveries);
    setSlots(load<DeliverySlotConfig[]>(SLOTS_KEY, seedSlots));
    setAuthId(load<string | null>(AUTH_KEY, null));
    if (!storedPartners.length) save(PARTNERS_KEY, seedPartners);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const persistDeliveries = useCallback((next: Delivery[]) => { setDeliveries(next); save(DELIVERIES_KEY, next); }, []);
  const persistPartners = useCallback((next: DeliveryPartner[]) => { setPartners(next); save(PARTNERS_KEY, next); }, []);

  const addPartner = useCallback((partner: Omit<DeliveryPartner, 'id' | 'joinedAt' | 'activeDeliveries' | 'totalDeliveries' | 'completedDeliveries' | 'failedDeliveries'>) => {
    persistPartners([{ ...partner, id: `partner-${Date.now()}`, joinedAt: now(), activeDeliveries: 0, totalDeliveries: 0, completedDeliveries: 0, failedDeliveries: 0 }, ...partners]);
  }, [partners, persistPartners]);

  const updatePartner = useCallback((id: string, patch: Partial<DeliveryPartner>) => persistPartners(partners.map(p => p.id === id ? { ...p, ...patch } : p)), [partners, persistPartners]);
  const deletePartner = useCallback((id: string) => persistPartners(partners.filter(p => p.id !== id)), [partners, persistPartners]);
  const setPartnerStatus = useCallback((id: string, status: PartnerAvailability) => updatePartner(id, { status }), [updatePartner]);

  const getDeliveryForOrder = useCallback((orderId: string) => deliveries.find(d => d.orderId === orderId) ?? null, [deliveries]);

  const reassignDeliveryInternal = useCallback((current: Delivery, partnerId: string, reason: string) => {
    const updated = {
      ...current,
      deliveryPartnerId: partnerId,
      status: 'DELIVERY_ASSIGNED' as DeliveryStatus,
      assignedAt: now(),
      activityLog: [...current.activityLog, { id: generateOrderId(), status: 'DELIVERY_ASSIGNED' as DeliveryStatus, message: reason, timestamp: now(), actor: 'Admin' }],
    };
    persistDeliveries(deliveries.map(d => d.id === current.id ? updated : d));
    updateLocalOrderStatus(current.orderId, 'packed', { delivery_partner_id: partnerId, delivery_status: updated.status });
    return updated;
  }, [deliveries, persistDeliveries]);

  const assignDelivery = useCallback((orderId: string, partnerId: string) => {
    const existing = getDeliveryForOrder(orderId);
    if (existing) { return reassignDeliveryInternal(existing, partnerId, 'Assigned by admin'); }
    const order = getLocalOrderById(orderId);
    if (!order) return null;
    const delivery: Delivery = {
      id: `delivery-${Date.now()}`, orderId, deliveryPartnerId: partnerId, status: 'DELIVERY_ASSIGNED',
      assignedAt: now(), acceptedAt: null, pickedUpAt: null, outForDeliveryAt: null, arrivingAt: null,
      deliveredAt: null, failedAt: null, failureReason: null, estimatedMinutes: 30, currentLocation: null,
      proofOfDelivery: String(Math.floor(1000 + Math.random() * 9000)), deliveryNotes: '', codCollected: order.payment_method !== 'cod', codCollectedAt: null,
      activityLog: [{ id: generateOrderId(), status: 'DELIVERY_ASSIGNED', message: 'Delivery assigned', timestamp: now(), actor: 'Admin' }], createdAt: now(),
    };
    persistDeliveries([delivery, ...deliveries]);
    updateLocalOrderStatus(orderId, 'packed', { delivery_id: delivery.id, delivery_partner_id: partnerId, delivery_status: delivery.status });
    const partner = partners.find(p => p.id === partnerId);
    if (partner) updatePartner(partnerId, { status: 'BUSY', activeDeliveries: partner.activeDeliveries + 1, totalDeliveries: partner.totalDeliveries + 1 });
    return delivery;
  }, [deliveries, getDeliveryForOrder, partners, persistDeliveries, reassignDeliveryInternal, updatePartner]);

  const transitionDelivery = useCallback((id: string, status: DeliveryStatus, options: { actor?: string; failureReason?: string; otp?: string; codCollected?: boolean } = {}) => {
    const current = deliveries.find(d => d.id === id);
    if (!current || !canTransitionDelivery(current.status, status)) return false;
    if (status === 'DELIVERED' && options.otp !== current.proofOfDelivery) return false;
    const timestamp = now();
    const timestampField: Partial<Delivery> = {
      ...(status === 'DELIVERY_ACCEPTED' ? { acceptedAt: timestamp } : {}),
      ...(status === 'PICKED_UP' ? { pickedUpAt: timestamp } : {}),
      ...(status === 'OUT_FOR_DELIVERY' ? { outForDeliveryAt: timestamp } : {}),
      ...(status === 'ARRIVING' ? { arrivingAt: timestamp } : {}),
      ...(status === 'DELIVERED' ? { deliveredAt: timestamp, codCollectedAt: options.codCollected ? timestamp : current.codCollectedAt } : {}),
      ...(status === 'DELIVERY_FAILED' ? { failedAt: timestamp, failureReason: options.failureReason ?? 'Customer unavailable' } : {}),
    };
    const entry: DeliveryActivityLogEntry = { id: generateOrderId(), status, message: status.replace(/_/g, ' '), timestamp, actor: options.actor ?? 'Delivery Partner' };
    const updated = { ...current, ...timestampField, status, codCollected: options.codCollected ?? current.codCollected, activityLog: [...current.activityLog, entry] };
    persistDeliveries(deliveries.map(d => d.id === id ? updated : d));
    const orderStatus = status === 'DELIVERED' ? 'delivered' : status === 'OUT_FOR_DELIVERY' ? 'out_for_delivery' : status === 'ORDER_CONFIRMED' ? 'confirmed' : undefined;
    if (orderStatus) updateLocalOrderStatus(current.orderId, orderStatus, { delivery_status: status });
    if (status === 'DELIVERED' || status === 'DELIVERY_FAILED') {
      const partner = partners.find(p => p.id === current.deliveryPartnerId);
      if (partner) updatePartner(partner.id, { activeDeliveries: Math.max(0, partner.activeDeliveries - 1), status: 'ONLINE', ...(status === 'DELIVERED' ? { completedDeliveries: partner.completedDeliveries + 1 } : { failedDeliveries: partner.failedDeliveries + 1 }) });
    }
    return true;
  }, [deliveries, partners, persistDeliveries, updatePartner]);

  const reassignDelivery = useCallback((id: string, partnerId: string, reason = 'Delivery reassigned') => {
    const current = deliveries.find(d => d.id === id); return current ? Boolean(reassignDeliveryInternal(current, partnerId, reason)) : false;
  }, [deliveries, reassignDeliveryInternal]);

  const updateSlots = useCallback((next: DeliverySlotConfig[]) => { setSlots(next); save(SLOTS_KEY, next); }, []);
  const signInPartner = useCallback((email: string, password: string) => { const partner = partners.find(p => p.email.toLowerCase() === email.toLowerCase() && p.password === password && p.isActive); if (!partner) return null; setAuthId(partner.id); save(AUTH_KEY, partner.id); return partner; }, [partners]);
  const signOutPartner = useCallback(() => { setAuthId(null); save(AUTH_KEY, null); }, []);

  const currentPartner = useMemo(() => partners.find(p => p.id === authId) ?? null, [authId, partners]);
  const value = useMemo(() => ({ partners, deliveries, slots, currentPartner, refresh, addPartner, updatePartner, deletePartner, setPartnerStatus, assignDelivery, transitionDelivery, reassignDelivery, getDeliveryForOrder, updateSlots, signInPartner, signOutPartner }), [partners, deliveries, slots, currentPartner, refresh, addPartner, updatePartner, deletePartner, setPartnerStatus, assignDelivery, transitionDelivery, reassignDelivery, getDeliveryForOrder, updateSlots, signInPartner, signOutPartner]);
  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}

export function useDeliveryData() {
  const context = useContext(DeliveryContext);
  if (!context) throw new Error('useDeliveryData must be used within DeliveryDataProvider');
  return context;
}
