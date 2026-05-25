"use client";
// Trainee surface for the shared marketplace. The actual UI lives in
// app/recruiter/modules/Marketplace.jsx so both surfaces stay in sync. The
// only difference is buyerType — when a trainee buys, the backend clones the
// position into trainee_interviews so it surfaces in /trainee /sessions.
import { Marketplace } from '@/app/recruiter/modules/Marketplace';

export function TraineeMarketplace({ onNavigate }) {
  return <Marketplace buyerType="trainee" onNavigate={onNavigate} />;
}
