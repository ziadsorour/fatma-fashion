'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard, Banknote, Smartphone, Building2, Check,
  AlertCircle, ExternalLink, Save
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  enabled: boolean;
  configured: boolean;
  fields: { key: string; label: string; type: string; placeholder: string; value: string }[];
}

export default function PaymentsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: 'cod',
      name: 'Cash on Delivery',
      nameAr: 'الدفع عند الاستلام',
      description: 'Customers pay in cash when the order is delivered.',
      descriptionAr: 'يدفع العملاء نقداً عند استلام الطلب',
      icon: <Banknote className="w-5 h-5" />,
      enabled: true,
      configured: true,
      fields: [
        { key: 'cod_fee', label: 'COD Fee (EGP)', type: 'number', placeholder: '0', value: '0' },
        { key: 'cod_max_order', label: 'Max Order Amount (EGP)', type: 'number', placeholder: 'No limit', value: '' },
      ],
    },
    {
      id: 'online',
      name: 'Online Payment (Paymob)',
      nameAr: 'دفع إلكتروني (باي موب)',
      description: 'Accept card payments via Paymob payment gateway.',
      descriptionAr: 'قبول مدفوعات البطاقات عبر بوابة باي موب',
      icon: <CreditCard className="w-5 h-5" />,
      enabled: false,
      configured: false,
      fields: [
        { key: 'paymob_api_key', label: 'Paymob API Key', type: 'password', placeholder: 'Enter API key', value: '' },
        { key: 'paymob_secret_key', label: 'Paymob Secret Key', type: 'password', placeholder: 'Enter secret key', value: '' },
        { key: 'paymob_hmac_secret', label: 'HMAC Secret', type: 'password', placeholder: 'Enter HMAC secret', value: '' },
        { key: 'paymob_integration_id', label: 'Integration ID', type: 'text', placeholder: 'Enter integration ID', value: '' },
      ],
    },
    {
      id: 'instapay',
      name: 'InstaPay',
      nameAr: 'إنستاباي',
      description: 'Accept payments via InstaPay (manual verification required).',
      descriptionAr: 'قبول المدفوعات عبر إنستاباي (يتطلب تأكيد يدوي)',
      icon: <Smartphone className="w-5 h-5" />,
      enabled: false,
      configured: false,
      fields: [
        { key: 'instapay_account', label: 'InstaPay Account/Phone', type: 'text', placeholder: 'Enter account number', value: '' },
        { key: 'instapay_name', label: 'Account Holder Name', type: 'text', placeholder: 'Enter name', value: '' },
        { key: 'instapay_instructions_en', label: 'Instructions (English)', type: 'text', placeholder: 'Instructions for customer', value: '' },
        { key: 'instapay_instructions_ar', label: 'Instructions (Arabic)', type: 'text', placeholder: 'تعليمات للعميل', value: '' },
      ],
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      nameAr: 'تحويل بنكي',
      description: 'Accept bank transfers (manual verification required).',
      descriptionAr: 'قبول التحويلات البنكية (يتطلب تأكيد يدوي)',
      icon: <Building2 className="w-5 h-5" />,
      enabled: false,
      configured: false,
      fields: [
        { key: 'bank_name', label: 'Bank Name', type: 'text', placeholder: 'e.g., CIB, NBE', value: '' },
        { key: 'bank_account_name', label: 'Account Name', type: 'text', placeholder: 'Account holder name', value: '' },
        { key: 'bank_account_number', label: 'Account Number', type: 'text', placeholder: 'Enter account number', value: '' },
        { key: 'bank_iban', label: 'IBAN', type: 'text', placeholder: 'Enter IBAN (optional)', value: '' },
        { key: 'bank_swift', label: 'SWIFT Code', type: 'text', placeholder: 'Enter SWIFT code (optional)', value: '' },
        { key: 'bank_instructions_en', label: 'Instructions (English)', type: 'text', placeholder: 'Instructions for customer', value: '' },
        { key: 'bank_instructions_ar', label: 'Instructions (Arabic)', type: 'text', placeholder: 'تعليمات للعميل', value: '' },
      ],
    },
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        const settings = data.settings || {};

        setMethods(prev => prev.map(method => {
          const enabledKey = `payment_${method.id}_enabled`;
          const isEnabled = settings[enabledKey] === '1' || settings[enabledKey] === 'true' || (method.id === 'cod' && settings[enabledKey] === undefined);

          const updatedFields = method.fields.map(field => ({
            ...field,
            value: settings[field.key] || field.value,
          }));

          const isConfigured = method.id === 'cod' || updatedFields.some(f => f.value && f.value.length > 0);

          return {
            ...method,
            enabled: isEnabled,
            configured: isConfigured,
            fields: updatedFields,
          };
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      const settings: Record<string, string> = {};

      methods.forEach(method => {
        settings[`payment_${method.id}_enabled`] = method.enabled ? '1' : '0';
        method.fields.forEach(field => {
          settings[field.key] = field.value;
        });
      });

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  }

  function toggleMethod(methodId: string) {
    setMethods(prev => prev.map(m =>
      m.id === methodId ? { ...m, enabled: !m.enabled } : m
    ));
  }

  function updateField(methodId: string, fieldKey: string, value: string) {
    setMethods(prev => prev.map(m =>
      m.id === methodId ? {
        ...m,
        fields: m.fields.map(f => f.key === fieldKey ? { ...f, value } : f),
      } : m
    ));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-500 text-sm mt-1">Configure how customers can pay for orders</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-rose-gold hover:bg-rose-gold/90 text-white"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Saving...
            </span>
          ) : saved ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Saved!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </span>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {methods.map((method) => (
          <Card key={method.id} className={!method.enabled ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${method.enabled ? 'bg-rose-gold/10 text-rose-gold' : 'bg-gray-100 text-gray-400'}`}>
                    {method.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {method.name}
                      {method.enabled && method.configured && (
                        <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                      )}
                      {method.enabled && !method.configured && method.id !== 'cod' && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          <AlertCircle className="w-3 h-3 me-1" />
                          Setup Required
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">{method.description}</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={method.enabled}
                  onCheckedChange={() => toggleMethod(method.id)}
                />
              </div>
            </CardHeader>

            {method.enabled && method.fields.length > 0 && (
              <>
                <Separator />
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {method.fields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
                        <Input
                          id={field.key}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={field.value}
                          onChange={(e) => updateField(method.id, field.key, e.target.value)}
                          dir="ltr"
                          className="text-left"
                        />
                      </div>
                    ))}
                  </div>

                  {method.id === 'online' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Get your Paymob credentials at{' '}
                        <a href="https://paymob.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                          paymob.com
                        </a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
