'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { PromptPreview } from './prompt-preview';

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (_section: number) => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Profile not found. Complete onboarding first.</p>
      </div>
    );
  }

  const sections = [
    {
      title: 'Business Basics',
      fields: [
        { label: 'Business Name', key: 'business_name' },
        { label: 'Vertical', key: 'vertical' },
        { label: 'Years in Business', key: 'years_in_business' },
        { label: 'Phone Number', key: 'phone_number' },
        { label: 'Company Address', key: 'company_address' },
        { label: 'Timezone', key: 'timezone' },
      ],
    },
    {
      title: 'Service Area',
      fields: [
        { label: 'Service Area Description', key: 'service_area_description' },
        { label: 'Service Area Zip Codes', key: 'service_area_zip_codes' },
      ],
    },
    {
      title: 'Brand & Voice',
      fields: [
        { label: 'Voice Persona', key: 'voice_persona' },
        { label: 'Brand Tone', key: 'brand_tone' },
        { label: 'Booking URL', key: 'booking_url' },
      ],
    },
    {
      title: 'Escalation & Contact',
      fields: [
        { label: 'Operator Phone', key: 'operator_phone_e164' },
        { label: 'Operator Email', key: 'operator_email' },
      ],
    },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-6">Business Profile Settings</h1>

      <div className="mb-8">
        <PromptPreview profile={profile} />
      </div>

      {sections.map((section, idx) => (
        <Card key={idx} className="mb-6">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-lg cursor-pointer"
              onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
            >
              {section.title}
            </CardTitle>
            {expandedSection !== idx && (
              <Button variant="secondary" onClick={() => setExpandedSection(idx)}>
                Edit
              </Button>
            )}
          </div>

          {expandedSection === idx && (
            <CardContent className="mt-6 space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={profile[field.key] || ''}
                    onChange={(e) =>
                      setProfile({ ...profile, [field.key]: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
                  />
                </div>
              ))}

              <div className="flex gap-4 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setExpandedSection(null)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSave(idx)}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    ))}
  </div>
  );
}
