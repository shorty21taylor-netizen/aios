'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  Step1Schema,
  Step2Schema,
  Step3Schema,
  Step4Schema,
  Step5Schema,
  Step6Schema,
} from '@/lib/profile/schemas';
import { verticalDefaults, type VerticalType } from '@/lib/profile/vertical-defaults';

const TIMEZONES = [
  'America/Chicago',
  'America/New_York',
  'America/Los_Angeles',
  'America/Denver',
  'UTC',
];



export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, any>>({});
  const [selectedVertical, setSelectedVertical] = useState<VerticalType | null>(null);

  // Load existing profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const profile = await res.json();
          setProfileData(profile);
          setCurrentStep(profile.onboarding_step || 1);
          setSelectedVertical(profile.vertical || null);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  const schemas = [Step1Schema, Step2Schema, Step3Schema, Step4Schema, Step5Schema, Step6Schema];
  const {
    control,
    handleSubmit,

    formState: { errors },

  } = useForm({
    resolver: zodResolver(schemas[currentStep - 1]),
    defaultValues: profileData,
  });



  const saveStep = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: currentStep,
          data,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfileData(updated.profile);

        if (currentStep < 6) {
          setCurrentStep(currentStep + 1);
        } else {
          // Complete onboarding
          const completeRes = await fetch('/api/onboarding/complete', {
            method: 'POST',
          });

          if (completeRes.ok) {
            router.push('/dashboard');
          }
        }
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error('Error saving step:', error);
      alert('Failed to save step');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardTitle className="text-2xl">
          Business Profile Setup — Step {currentStep} of 6
        </CardTitle>
        <CardContent className="mt-6">
          <form onSubmit={handleSubmit(saveStep)} className="space-y-6">
            {/* Step 1: Business Basics */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Name
                  </label>
                  <Controller
                    name="business_name"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Acme Roofing"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                      />
                    )}
                  />
                  {errors.business_name && (
                    <p className="text-red-400 text-sm mt-1">{errors.business_name.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Industry Vertical
                  </label>
                  <Controller
                    name="vertical"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setSelectedVertical(e.target.value as VerticalType);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
                      >
                        <option value="">Select vertical</option>
                        <option value="roofing">Roofing</option>
                        <option value="hvac">HVAC</option>
                        <option value="solar">Solar</option>
                        <option value="exteriors">Exteriors</option>
                        <option value="remodeling">Remodeling</option>
                        <option value="other">Other</option>
                      </select>
                    )}
                  />
                  {errors.vertical && (
                    <p className="text-red-400 text-sm mt-1">{errors.vertical.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Years in Business (optional)
                  </label>
                  <Controller
                    name="years_in_business"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        placeholder="10"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Phone Number
                  </label>
                  <Controller
                    name="phone_number"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        placeholder="+1234567890"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                      />
                    )}
                  />
                  {errors.phone_number && (
                    <p className="text-red-400 text-sm mt-1">{errors.phone_number.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Address
                  </label>
                  <Controller
                    name="company_address"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="123 Main St, Austin TX"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                      />
                    )}
                  />
                  {errors.company_address && (
                    <p className="text-red-400 text-sm mt-1">{errors.company_address.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Timezone
                  </label>
                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Service Area & Hours */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Service Area Description
                  </label>
                  <Controller
                    name="service_area_description"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Austin + surrounding 30 miles"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                      />
                    )}
                  />
                  {errors.service_area_description && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.service_area_description.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Service Area Zip Codes (comma-separated, optional)
                  </label>
                  <Controller
                    name="service_area_zip_codes"
                    control={control}
                    render={({ field: { value, ...field } }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="78701, 78702, 78703"
                        value={Array.isArray(value) ? value.join(', ') : ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              .split(',')
                              .map((z) => z.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                      />
                    )}
                  />
                </div>

                <p className="text-sm text-slate-400 mt-4">Business Hours:</p>
                <div className="grid grid-cols-2 gap-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day}>
                      <p className="text-xs text-slate-300 mb-1">{day}</p>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          defaultValue="08:00"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                        />
                        <input
                          type="time"
                          defaultValue="18:00"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Services */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  List your main services and pricing ranges:
                </p>
                {selectedVertical && verticalDefaults[selectedVertical] && (
                  <div className="bg-emerald-900 border border-emerald-700 rounded p-3 text-sm text-emerald-200">
                    Pre-populated defaults for {selectedVertical}. Edit as needed.
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400">Service 1</label>
                    <input
                      type="text"
                      placeholder="Service name"
                      defaultValue={
                        selectedVertical ? verticalDefaults[selectedVertical]?.services[0]?.name : ''
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500 text-sm mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Price range (e.g., $1000-$5000)"
                      defaultValue={
                        selectedVertical
                          ? verticalDefaults[selectedVertical]?.services[0]?.price_range_usd
                          : ''
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Voice & Brand */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-3">Voice Persona</p>
                  <div className="space-y-2">
                    {['professional', 'friendly', 'direct'].map((persona) => (
                      <label key={persona} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="voice_persona"
                          value={persona}
                          defaultChecked={profileData.voice_persona === persona}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-300 capitalize">{persona}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-300 mb-3">Brand Tone</p>
                  <div className="space-y-2">
                    {['formal', 'casual', 'warm', 'technical'].map((tone) => (
                      <label key={tone} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="brand_tone"
                          value={tone}
                          defaultChecked={profileData.brand_tone === tone}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-300 capitalize">{tone}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Booking URL (Calendly, JobNimbus, etc.)
                  </label>
                  <Controller
                    name="booking_url"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="url"
                        placeholder="https://calendly.com/yourname"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 5: FAQs & Objections */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-2">Frequently Asked Questions</p>
                  <div className="space-y-2">
                    {selectedVertical &&
                      verticalDefaults[selectedVertical]?.top_faqs.slice(0, 2).map((faq, i) => (
                        <div key={i} className="bg-slate-900 rounded p-3">
                          <p className="text-xs text-slate-400 mb-1">Q:</p>
                          <p className="text-sm text-slate-300 mb-2">{faq.q}</p>
                          <p className="text-xs text-slate-400 mb-1">A:</p>
                          <p className="text-sm text-slate-300">{faq.a}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Escalation & Consent */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Operator Phone (for escalation)
                  </label>
                  <Controller
                    name="operator_phone_e164"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        placeholder="+1234567890"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Operator Email (for escalation)
                  </label>
                  <Controller
                    name="operator_email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        placeholder="operator@company.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder-slate-500"
                      />
                    )}
                  />
                </div>

                <div className="bg-emerald-900 border border-emerald-700 rounded p-4 mt-6">
                  <p className="text-emerald-200 text-sm">
                    Your business profile is complete. Click "Create my workspace" to finish setup and start using AIOS.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={goBack}
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading
                  ? 'Saving...'
                  : currentStep === 6
                  ? 'Create my workspace'
                  : 'Next'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
