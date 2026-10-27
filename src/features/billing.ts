import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { getUserId } from '@/src/lib/identity';
import type { PlanType } from '@/src/types';

const KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
export const ENTITLEMENT = 'pro';
export const billingConfigured = Platform.OS === 'android' && Boolean(KEY);

export type Plan = {
  id: PlanType;
  price: string;
  hasFreeTrial: boolean;
  pkg: PurchasesPackage;
};

export type Entitlement = {
  active: boolean;
  plan: PlanType | null;
  isTrial: boolean;
  expiresAt: string | null;
};

let configured = false;

export async function initBilling(): Promise<boolean> {
  if (!billingConfigured) return false;
  if (!configured) {
    Purchases.configure({ apiKey: KEY as string, appUserID: await getUserId() });
    configured = true;
  }
  return true;
}

function planFromProductId(id: string): PlanType {
  const s = id.toLowerCase();
  if (/annual|year|12m/.test(s)) return 'annual';
  if (/quarter|3m|three/.test(s)) return 'quarterly';
  return 'monthly';
}

function toEntitlement(info: CustomerInfo): Entitlement {
  const e = info.entitlements.active[ENTITLEMENT];
  if (!e) return { active: false, plan: null, isTrial: false, expiresAt: null };
  return {
    active: true,
    plan: planFromProductId(e.productIdentifier),
    isTrial: e.periodType === 'TRIAL',
    expiresAt: e.expirationDate,
  };
}

export async function loadPlans(): Promise<Plan[]> {
  if (!(await initBilling())) return [];
  const offerings = await Purchases.getOfferings();
  const cur = offerings.current;
  if (!cur) return [];
  const pairs: [PlanType, PurchasesPackage | null][] = [
    ['annual', cur.annual],
    ['quarterly', cur.threeMonth],
    ['monthly', cur.monthly],
  ];
  return pairs
    .filter((p): p is [PlanType, PurchasesPackage] => p[1] != null)
    .map(([id, pkg]) => ({
      id,
      pkg,
      price: pkg.product.priceString,
      hasFreeTrial: Boolean(pkg.product.defaultOption?.freePhase),
    }));
}

/** Returns null when the user backs out of the Play sheet. */
export async function purchasePlan(plan: Plan): Promise<Entitlement | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
    return toEntitlement(customerInfo);
  } catch (e: any) {
    if (e?.userCancelled) return null;
    throw e;
  }
}

export async function restorePurchases(): Promise<Entitlement> {
  await initBilling();
  return toEntitlement(await Purchases.restorePurchases());
}

export async function refreshEntitlement(): Promise<Entitlement | null> {
  if (!(await initBilling())) return null;
  return toEntitlement(await Purchases.getCustomerInfo());
}
