'use client';

import { useState } from 'react';
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassModal,
  StatusBadge
} from '@/components/ui';

export default function ComponentsDemo() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white">Component Demo</h1>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Glass Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard>
              <h3 className="text-white font-semibold mb-2">Basic Card</h3>
              <p className="text-white/70">Standard glassmorphic card</p>
            </GlassCard>
            <GlassCard hover>
              <h3 className="text-white font-semibold mb-2">Hover Card</h3>
              <p className="text-white/70">With hover animation</p>
            </GlassCard>
            <GlassCard gradient>
              <h3 className="text-white font-semibold mb-2">Gradient Card</h3>
              <p className="text-white/70">With gradient overlay</p>
            </GlassCard>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <GlassButton variant="primary">Primary</GlassButton>
            <GlassButton variant="secondary">Secondary</GlassButton>
            <GlassButton variant="ghost">Ghost</GlassButton>
            <GlassButton size="sm">Small</GlassButton>
            <GlassButton size="lg">Large</GlassButton>
            <GlassButton disabled>Disabled</GlassButton>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Inputs</h2>
          <div className="max-w-md space-y-4">
            <GlassInput label="Email" type="email" placeholder="your@email.com" />
            <GlassInput label="Password" type="password" placeholder="••••••••" required />
            <GlassInput label="Error State" error="This field is required" />
          </div>
        </section>

        {/* Status Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Status Badges</h2>
          <div className="flex flex-wrap gap-4">
            <StatusBadge status="pending" />
            <StatusBadge status="collecting" />
            <StatusBadge status="matching" />
            <StatusBadge status="analyzing" />
            <StatusBadge status="complete" />
            <StatusBadge status="error" />
          </div>
        </section>

        {/* Modal */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Modal</h2>
          <GlassButton onClick={() => setModalOpen(true)}>
            Open Modal
          </GlassButton>
          <GlassModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
          >
            <p className="text-white/80 mb-4">
              This is a glassmorphic modal with backdrop blur and animations.
            </p>
            <div className="flex gap-4">
              <GlassButton onClick={() => setModalOpen(false)}>
                Close
              </GlassButton>
              <GlassButton variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </GlassButton>
            </div>
          </GlassModal>
        </section>
      </div>
    </div>
  );
}
