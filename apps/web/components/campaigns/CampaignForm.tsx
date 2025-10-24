'use client';

import { useState } from 'react';
import { GlassInput, GlassButton } from '@/components/ui';
import { CreateCampaignDto } from '@/lib/api';
import { X } from 'lucide-react';

interface CampaignFormProps {
  initialData?: Partial<CreateCampaignDto>;
  onSubmit: (data: CreateCampaignDto) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function CampaignForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Campaign',
}: CampaignFormProps) {
  const [formData, setFormData] = useState<CreateCampaignDto>({
    name: initialData?.name || '',
    billingNumber: initialData?.billingNumber || '',
    dropDate: initialData?.dropDate || '',
    redropDate: initialData?.redropDate || '',
    markets: initialData?.markets || [],
    campaignType: initialData?.campaignType || 'acquisition',
    priority: initialData?.priority || 'normal',
    expectedRecords: initialData?.expectedRecords,
    vendorEmail: initialData?.vendorEmail || '',
    notes: initialData?.notes || '',
  });

  const [marketInput, setMarketInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddMarket = () => {
    const market = marketInput.trim();
    if (market && !formData.markets.includes(market)) {
      setFormData((prev) => ({
        ...prev,
        markets: [...prev.markets, market],
      }));
      setMarketInput('');
    }
  };

  const handleRemoveMarket = (market: string) => {
    setFormData((prev) => ({
      ...prev,
      markets: prev.markets.filter((m) => m !== market),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.billingNumber.trim()) newErrors.billingNumber = 'Billing number is required';
    if (!formData.dropDate) newErrors.dropDate = 'Drop date is required';
    if (formData.markets.length === 0) newErrors.markets = 'At least one market is required';
    if (!formData.vendorEmail.trim()) newErrors.vendorEmail = 'Vendor email is required';
    if (formData.vendorEmail && !formData.vendorEmail.includes('@')) {
      newErrors.vendorEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Name */}
        <GlassInput
          label="Campaign Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="September 2024 Campaign"
          required
          error={errors.name}
        />

        {/* Billing Number */}
        <GlassInput
          label="Billing Number"
          value={formData.billingNumber}
          onChange={(e) => setFormData({ ...formData, billingNumber: e.target.value })}
          placeholder="TIDE123"
          required
          error={errors.billingNumber}
        />

        {/* Drop Date */}
        <GlassInput
          label="Drop Date"
          type="date"
          value={formData.dropDate}
          onChange={(e) => setFormData({ ...formData, dropDate: e.target.value })}
          required
          error={errors.dropDate}
        />

        {/* Redrop Date */}
        <GlassInput
          label="Redrop Date (Optional)"
          type="date"
          value={formData.redropDate || ''}
          onChange={(e) => setFormData({ ...formData, redropDate: e.target.value })}
        />

        {/* Campaign Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">
            Campaign Type <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.campaignType}
            onChange={(e) =>
              setFormData({
                ...formData,
                campaignType: e.target.value as CreateCampaignDto['campaignType'],
              })
            }
            className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/50 transition-all duration-200"
            required
          >
            <option value="acquisition">Acquisition</option>
            <option value="winback">Winback</option>
            <option value="retention">Retention</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: e.target.value as CreateCampaignDto['priority'],
              })
            }
            className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/50 transition-all duration-200"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Vendor Email */}
        <GlassInput
          label="Vendor Email"
          type="email"
          value={formData.vendorEmail}
          onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
          placeholder="vendor@example.com"
          required
          error={errors.vendorEmail}
        />

        {/* Expected Records */}
        <GlassInput
          label="Expected Records (Optional)"
          type="number"
          value={formData.expectedRecords || ''}
          onChange={(e) =>
            setFormData({ ...formData, expectedRecords: e.target.value ? parseInt(e.target.value) : undefined })
          }
          placeholder="10000"
        />
      </div>

      {/* Markets */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">
          Markets <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <GlassInput
            value={marketInput}
            onChange={(e) => setMarketInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMarket())}
            placeholder="Enter market name (e.g., Houston)"
            className="flex-1"
          />
          <GlassButton type="button" onClick={handleAddMarket} variant="secondary">
            Add
          </GlassButton>
        </div>
        {errors.markets && <p className="text-sm text-red-400">{errors.markets}</p>}
        {formData.markets.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.markets.map((market) => (
              <span
                key={market}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
              >
                {market}
                <button
                  type="button"
                  onClick={() => handleRemoveMarket(market)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">Notes (Optional)</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/50 transition-all duration-200 resize-none"
          placeholder="Additional notes about this campaign..."
        />
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <GlassButton type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </GlassButton>
        )}
        <GlassButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : submitLabel}
        </GlassButton>
      </div>
    </form>
  );
}
