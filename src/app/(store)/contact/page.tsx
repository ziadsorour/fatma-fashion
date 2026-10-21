"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  MessageCircle,
} from "lucide-react";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const { t, locale, dir } = useI18n();
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const WHATSAPP_NUMBER = "201000000000"; // placeholder — admin configurable

  const texts = {
    pageTitle: locale === "ar" ? "تواصلي معنا" : "Contact Us",
    pageSubtitle:
      locale === "ar"
        ? "نسعد بتواصلك معنا! أرسلي لنا رسالة وسنرد عليكِ في أقرب وقت."
        : "We'd love to hear from you! Send us a message and we'll respond as soon as possible.",
    nameLabel: locale === "ar" ? "الاسم" : "Name",
    emailLabel: locale === "ar" ? "البريد الإلكتروني" : "Email",
    subjectLabel: locale === "ar" ? "الموضوع" : "Subject",
    messageLabel: locale === "ar" ? "الرسالة" : "Message",
    namePlaceholder: locale === "ar" ? "اسمك الكامل" : "Your full name",
    emailPlaceholder: locale === "ar" ? "example@email.com" : "example@email.com",
    subjectPlaceholder:
      locale === "ar" ? "موضوع الرسالة" : "Message subject",
    messagePlaceholder:
      locale === "ar"
        ? "اكتبي رسالتك هنا..."
        : "Write your message here...",
    sendBtn: locale === "ar" ? "إرسال الرسالة" : "Send Message",
    whatsappBtn:
      locale === "ar" ? "تواصلي عبر واتساب" : "Chat on WhatsApp",
    // Validation
    nameRequired: locale === "ar" ? "الاسم مطلوب" : "Name is required",
    emailRequired:
      locale === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required",
    emailInvalid:
      locale === "ar"
        ? "البريد الإلكتروني غير صالح"
        : "Invalid email address",
    subjectRequired: locale === "ar" ? "الموضوع مطلوب" : "Subject is required",
    messageRequired: locale === "ar" ? "الرسالة مطلوبة" : "Message is required",
    messageTooShort:
      locale === "ar"
        ? "الرسالة قصيرة جداً (10 أحرف على الأقل)"
        : "Message is too short (at least 10 characters)",
    successTitle:
      locale === "ar" ? "تم إرسال رسالتك بنجاح!" : "Message sent successfully!",
    successDesc:
      locale === "ar"
        ? "سنرد عليكِ في أقرب وقت ممكن"
        : "We'll get back to you as soon as possible",
    errorTitle:
      locale === "ar" ? "حصل خطأ أثناء الإرسال" : "Error sending message",
    // Store info
    storeInfoTitle: locale === "ar" ? "معلومات التواصل" : "Contact Information",
    emailInfo: "support@fatma-fashion.com",
    phoneInfo: "+20 100 000 0000",
    workingHoursTitle: locale === "ar" ? "ساعات العمل" : "Working Hours",
    workingHours:
      locale === "ar"
        ? "السبت - الخميس: 10 صباحاً - 10 مساءً"
        : "Sat - Thu: 10 AM - 10 PM",
    workingHoursFriday:
      locale === "ar" ? "الجمعة: 2 مساءً - 10 مساءً" : "Friday: 2 PM - 10 PM",
    addressTitle: locale === "ar" ? "العنوان" : "Address",
    addressText:
      locale === "ar"
        ? "القاهرة، مصر"
        : "Cairo, Egypt",
    mapPlaceholder:
      locale === "ar" ? "خريطة الموقع" : "Store Location Map",
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = texts.nameRequired;
    if (!form.email.trim()) {
      newErrors.email = texts.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = texts.emailInvalid;
    }
    if (!form.subject.trim()) newErrors.subject = texts.subjectRequired;
    if (!form.message.trim()) {
      newErrors.message = texts.messageRequired;
    } else if (form.message.trim().length < 10) {
      newErrors.message = texts.messageTooShort;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: texts.successTitle, description: texts.successDesc, variant: "success" });
        setForm({ name: "", email: "", subject: "", message: "" });
        setErrors({});
      } else {
        toast({ title: texts.errorTitle, variant: "error" });
      }
    } catch {
      toast({ title: texts.errorTitle, variant: "error" });
    }
    setLoading(false);
  };

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-cream py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-3">
            {texts.pageTitle}
          </h1>
          <p className="text-charcoal/60 max-w-lg mx-auto">
            {texts.pageSubtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-beige/50 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    label={texts.nameLabel}
                    placeholder={texts.namePlaceholder}
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    error={errors.name}
                  />
                  <Input
                    label={texts.emailLabel}
                    type="email"
                    placeholder={texts.emailPlaceholder}
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                    dir="ltr"
                  />
                </div>
                <Input
                  label={texts.subjectLabel}
                  placeholder={texts.subjectPlaceholder}
                  value={form.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  error={errors.subject}
                />
                <Textarea
                  label={texts.messageLabel}
                  placeholder={texts.messagePlaceholder}
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  error={errors.message}
                  rows={5}
                />
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="submit" size="lg" loading={loading} className="flex-1">
                    <Send className="h-4 w-4" />
                    {texts.sendBtn}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1 !border-green-500 !text-green-600 hover:!bg-green-500 hover:!text-white"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${WHATSAPP_NUMBER}`,
                        "_blank"
                      )
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                    {texts.whatsappBtn}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Store Info Sidebar */}
          <div className="space-y-6">
            {/* Contact Info Card */}
            <div className="bg-white rounded-2xl p-6 border border-beige/50 shadow-sm">
              <h2 className="font-semibold text-charcoal mb-5 text-lg">
                {texts.storeInfoTitle}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-gold/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-rose-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {texts.emailLabel}
                    </p>
                    <a
                      href={`mailto:${texts.emailInfo}`}
                      className="text-sm text-rose-gold hover:underline"
                      dir="ltr"
                    >
                      {texts.emailInfo}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-gold/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-rose-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {locale === "ar" ? "الهاتف" : "Phone"}
                    </p>
                    <a
                      href={`tel:${texts.phoneInfo.replace(/\s/g, "")}`}
                      className="text-sm text-rose-gold hover:underline"
                      dir="ltr"
                    >
                      {texts.phoneInfo}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-gold/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-rose-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {texts.workingHoursTitle}
                    </p>
                    <p className="text-sm text-charcoal/60">
                      {texts.workingHours}
                    </p>
                    <p className="text-sm text-charcoal/60">
                      {texts.workingHoursFriday}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-gold/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-rose-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {texts.addressTitle}
                    </p>
                    <p className="text-sm text-charcoal/60">
                      {texts.addressText}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl border border-beige/50 shadow-sm overflow-hidden">
              <div className="aspect-[4/3] bg-beige/30 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-10 w-10 text-charcoal/20 mx-auto mb-2" />
                  <p className="text-sm text-charcoal/40">
                    {texts.mapPlaceholder}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
